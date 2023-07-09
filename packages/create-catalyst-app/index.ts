#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
import chalk from 'chalk';
import { Command } from 'commander';
import path, { join } from 'path';
import got from 'got';
import tar from 'tar';
import { promisify } from 'util';
// import Conf from 'conf';
import prompts from 'prompts';
import packageJson from './package.json';
import fs, { createWriteStream } from 'fs';
import { Stream } from 'stream';
import os, { tmpdir } from 'os';
import { validateNpmName} from './helpers/validate-package';

let projectPath: string = '';

const handleSigTerm = () => process.exit(0);

process.on('SIGINT', handleSigTerm);
process.on('SIGTERM', handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
}

const makeDir = (
  root: string,
  options = { recursive: true }
): Promise<string | undefined> => {
  return fs.promises.mkdir(root, options)
}
const program = new Command("create-catalyst-app");

program
  .version(packageJson.version)
  .option('--token <token>', 'GitHub Access Token')
  .parse(process.argv)

const options = program.opts();
const GIT_ACCESS_TOKEN = options.token ?? '';
const packageManager = 'pnpm';


async function run(): Promise<void> {
  if (!GIT_ACCESS_TOKEN) {
    console.log(chalk.red(`Your GitHub token required to continue work with CLI...`));
    console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
  
    process.exit(1);
  }

  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: 'text',
      name: 'path',
      message: 'What is your project name?',
      initial: 'catalyst-storefront',
      validate: (name: string) => {
        const validation = validateNpmName(path.basename(path.resolve(name)))
        if (validation.valid) {
          return true;
        }
        return 'Invalid project name: ' + validation.problems![0];
      },
    });

    if (typeof res.path === 'string') {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      '\nPlease specify the project directory:\n' +
        `  ${chalk.cyan(program.name())} ${chalk.green(
          '<project-directory>'
        )}\n` +
        'For example:\n' +
        `  ${chalk.cyan(program.name())} ${chalk.green('my-catalyst-app')}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    )
    process.exit(1);
  }
 
  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    );

    problems!.forEach((p) => console.error(` ${chalk.red.bold('*')} ${p}`));
    process.exit(1);
  }

  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const userDir = os.homedir();
  const rootAppName = `${userDir}/${appName}`;
  const createBigCommerceModule = async (root: string) => {
    const p = path.join(root, '@bigcommerce');

    await makeDir(p);
  };

  await makeDir(rootAppName);

  const folderExists = fs.existsSync(rootAppName);

  if (folderExists) {
    console.log(`${chalk.green('project directory created successfully')}`);
    console.log();
  } else {
    process.exit(1);
  }

  const moveContent = (from: string, to: string) => {
    const transferHandler = (err: unknown) => {
      if (err) {
        return console.error(`${chalk.red('something went wrong on transfering files: ')}`, err);
      }

      return console.log(`${chalk.green('files successfully transfered to your destination folder: ')}`, to);
    };

    return fs.cp(from, to, {recursive: true}, transferHandler);
  };

  const downloadCatalystMainBranch = async (urlPath: string) => {
    const options = {
      headers: {
        Authorization: `Bearer ${GIT_ACCESS_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw'
      }
    };

    const catalystRepo = new URL(urlPath);
    const pipeline = promisify(Stream.pipeline);
    const tempFile = join(tmpdir(), `catalyst.temp-${Date.now()}`);

    await pipeline(got.stream(catalystRepo, options), createWriteStream(tempFile))

    // console.log("tempFile stream pipeline =", tempFile);

    return tempFile;
  };
  let tempFile;

  try {
  tempFile = await downloadCatalystMainBranch('https://codeload.github.com/bigcommerce/catalyst/tar.gz/main');

  // TODO: copy docs content + main dependencies [reactant, catalyst-configs, eslint-config-catalyst]
  console.log(`${chalk.green('catalyst storefront templates fetched successfully')}`);
  } catch (error) {
    console.error(`${chalk.red('something went wrong on transfering files: ')}`, error);
  }

  // await createBigCommerceModule(rootAppName);

  await tar.x({
    file: tempFile,
    cwd: rootAppName,
    filter: (path, entry) => {
      const docs = 'catalyst-main/apps/docs';
      // TODO: copy to bigcommerce dir
      // const reactant = 'catalyst-main/packages/reactant';
      // const catalystConfigs = 'catalyst-main/packages/catalyst-configs';
      // const eslintConfig = 'catalyst-main/packages/eslint-config-catalyst';

      if (path.includes(docs)) {
        return true;
      }

      // if (path.includes(reactant)) {
      //   return true;
      // }
      // if (path.includes(catalystConfigs)) {
      //   return true;
      // }
      // if (path.includes(eslintConfig)) {
      //   return true;
      // }

      return false;
    },
    // onentry: (entry) => {
    //   const packagesList = ['reactant', 'catalyst-configs', 'eslint-config-catalyst'];

    //   if (entry.path.includes('reactant')) {
    //     console.log(`${chalk.yellow('entry full path ==')}`, path.join(rootAppName, entry.path));

    //     fs.cp(entry.path, `${rootAppName}/@bigcommerce`, {recursive: true}, (err) => {
    //       if (err) {
    //         console.log(`${chalk.red('copying process went wrong')}`, err)
    //       }
    //     });
    //   }

    //   if (entry.path.includes('docs')) {
    //     fs.cp(entry.path, `${rootAppName}`, {recursive: true}, (err) => {
    //       if(err) {
    //         console.log(err);
    //       }
    //     })
    //   }
    // },
    strip: 3
  })

  console.log();
  console.log(`${chalk.green('catalyst storefront templates copied successfully')}`);

  await fs.unlink(tempFile!, (err) => {
    if (err) {
      console.log('unkink failed for reason ', err);
    }
  });
}

run()
  .catch(async (reason) => {
    console.log('Aborting installation.')
    if (reason.command) {
      console.log(`${chalk.cyan(reason.command)} has failed.`)
    } else {
      console.log(
        chalk.red('Unexpected error. Please report it as a bug:') + '\n',
        reason
      );
    }
    console.log();

    process.exit(1);
  });
