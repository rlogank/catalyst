import { Command, Option } from '@commander-js/extra-typings';
import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { exec as execCallback } from 'child_process';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';
import { promisify } from 'util';

import { checkStorefrontLimit } from '../utils/check-storefront-limit';
import { cloneCatalyst } from '../utils/clone-catalyst';
import { getLatestCoreTag } from '../utils/get-latest-core-tag';
import { Https } from '../utils/https';
import { installDependencies } from '../utils/install-dependencies';
import { login } from '../utils/login';
import { getPackageManager, packageManagerChoices } from '../utils/pm';
import { spinner } from '../utils/spinner';
import { writeEnv } from '../utils/write-env';

const exec = promisify(execCallback);

async function getProjectDirectory(options: {
  projectDir: string;
  projectName: string | undefined;
}) {
  let projectDir = options.projectDir;
  let projectName = kebabCase(options.projectName);

  if (!pathExistsSync(projectDir)) {
    console.error(chalk.red(`Error: ${options.projectDir} is not a valid project directory\n`));
    process.exit(1);
  }

  if (projectName) {
    projectDir = join(projectDir, projectName);

    if (pathExistsSync(projectDir)) {
      console.error(chalk.red(`Error: ${projectDir} already exists\n`));
      process.exit(1);
    }

    return { projectName, projectDir };
  }

  try {
    await input({
      message: 'What would you like to name your project?',
      default: 'my-catalyst-app',
      validate: (i) => {
        const targetName = kebabCase(i);
        const targetDir = join(projectDir, targetName);

        if (!targetName) return 'Project name is required';
        if (pathExistsSync(targetDir)) return `Destination '${targetDir}' already exists`;

        projectDir = targetDir;
        projectName = targetName;

        return true;
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed the prompt')) {
      console.log('\nBye! 👋\n');
      process.exit(0);
    }
  }

  return { projectName, projectDir };
}

export const create = new Command('create')
  .description('Command to scaffold and connect a Catalyst storefront to your BigCommerce store')
  .option('--project-name <name>', 'Name of your Catalyst project')
  .option('--project-dir <dir>', 'Directory in which to create your project', process.cwd())
  .option('--store-hash <hash>', 'BigCommerce store hash')
  .option('--access-token <token>', 'BigCommerce access token')
  .option('--channel-id <id>', 'BigCommerce channel ID')
  .option('--customer-impersonation-token <token>', 'BigCommerce customer impersonation token')
  .option('--gh-ref <ref>', 'Clone a specific ref from the bigcommerce/catalyst repository')
  .addOption(
    new Option('--package-manager <pm>', 'Override detected package manager')
      .choices(packageManagerChoices)
      .default(getPackageManager())
      .hideHelp(),
  )
  .addOption(
    new Option('--code-editor <editor>', 'Your preferred code editor')
      .choices(['vscode'])
      .default('vscode')
      .hideHelp(),
  )
  .addOption(
    new Option('--include-functional-tests', 'Include the functional test suite')
      .default(false)
      .hideHelp(),
  )
  .action(async (options) => {
    const SAMPLE_DATA_API_URL = process.env.SAMPLE_DATA_API_URL ?? 'https://api.bc-sample.store';
    const BIGCOMMERCE_API_URL = process.env.BIGCOMMERCE_API_URL ?? 'https://api.bigcommerce.com';
    const BIGCOMMERCE_IAM_URL = process.env.BIGCOMMRECE_IAM_URL ?? 'https://login.bigcommerce.com';

    const ghRef = options.ghRef ?? (await getLatestCoreTag());

    const { projectName, projectDir } = await getProjectDirectory({
      projectDir: options.projectDir,
      projectName: options.projectName,
    });

    const { packageManager, codeEditor, includeFunctionalTests } = options;

    let storeHash = options.storeHash;
    let accessToken = options.accessToken;
    let channelId;
    let customerImpersonationToken = options.customerImpersonationToken;

    if (options.channelId) {
      channelId = parseInt(options.channelId, 10);
    }

    if (!options.storeHash || !options.accessToken) {
      const credentials = await login(BIGCOMMERCE_IAM_URL);

      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    if (!storeHash || !accessToken) {
      console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

      await cloneCatalyst({ projectDir, projectName, ghRef, codeEditor, includeFunctionalTests });

      console.log(`\nUsing ${chalk.bold(packageManager)}\n`);

      await installDependencies(projectDir, packageManager);

      console.log(
        [
          `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
          `Next steps:`,
          chalk.yellow(`\n- cd ${projectName} && cp .env.example .env.local`),
          chalk.yellow(`\n- Populate .env.local with your BigCommerce API credentials\n`),
        ].join('\n'),
      );

      process.exit(0);
    }

    if (!channelId || !customerImpersonationToken) {
      const bc = new Https({ bigCommerceApiUrl: BIGCOMMERCE_API_URL, storeHash, accessToken });
      const availableChannels = await bc.channels('?available=true&type=storefront');
      const storeInfo = await bc.storeInformation();

      const canCreateChannel = checkStorefrontLimit(availableChannels, storeInfo);

      let shouldCreateChannel;

      if (canCreateChannel) {
        shouldCreateChannel = await select({
          message: 'Would you like to create a new channel?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        });
      }

      if (shouldCreateChannel) {
        const newChannelName = await input({
          message: 'What would you like to name your new channel?',
        });

        const sampleDataApi = new Https({
          sampleDataApiUrl: SAMPLE_DATA_API_URL,
          storeHash,
          accessToken,
        });

        const {
          data: { id: createdChannelId, storefront_api_token: storefrontApiToken },
        } = await sampleDataApi.createChannel(newChannelName);

        await bc.createChannelMenus(createdChannelId);

        channelId = createdChannelId;
        customerImpersonationToken = storefrontApiToken;

        /**
         * @todo prompt sample data API
         */
      }

      if (!shouldCreateChannel) {
        const channelSortOrder = ['catalyst', 'next', 'bigcommerce'];

        const existingChannel = await select({
          message: 'Which channel would you like to use?',
          choices: availableChannels.data
            .sort(
              (a, b) => channelSortOrder.indexOf(a.platform) - channelSortOrder.indexOf(b.platform),
            )
            .map((ch) => ({
              name: ch.name,
              value: ch,
              description: `Channel Platform: ${
                ch.platform === 'bigcommerce'
                  ? 'Stencil'
                  : ch.platform.charAt(0).toUpperCase() + ch.platform.slice(1)
              }`,
            })),
        });

        channelId = existingChannel.id;

        const {
          data: { token },
        } = await bc.customerImpersonationToken(channelId);

        customerImpersonationToken = token;
      }
    }

    if (!channelId) throw new Error('Something went wrong, channelId is not defined');
    if (!customerImpersonationToken)
      throw new Error('Something went wrong, customerImpersonationToken is not defined');

    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

    await cloneCatalyst({ projectDir, projectName, ghRef, codeEditor, includeFunctionalTests });

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      accessToken,
      customerImpersonationToken,
    });

    console.log(`\nUsing ${chalk.bold(packageManager)}\n`);

    await installDependencies(projectDir, packageManager);

    await spinner(exec(`${packageManager} run --prefix ${projectDir} generate`), {
      text: 'Creating GraphQL schema...',
      successText: 'Created GraphQL schema',
      failText: (err) => chalk.red(`Failed to create GraphQL schema: ${err.message}`),
    });

    console.log(
      `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
      '\nNext steps:\n',
      chalk.yellow(`\ncd ${projectName} && ${packageManager} run dev\n`),
    );
  });
