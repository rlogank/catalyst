#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
import chalk from 'chalk';
import { Command } from 'commander';
import path from 'path';
// import Conf from 'conf';
import prompts from 'prompts';
import packageJson from './package.json';
import fs from 'fs';
import os from 'os';
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
  .argument('<project-directory>')
  .usage(`${chalk.green('project-directory')}`)
  .action((path: string) => {
    projectPath = path;
  });

const packageManager = 'pnpm';

async function run(): Promise<void> {
  // const conf = new Conf({ projectName: 'create-catalyst-storefront' })


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
 
  const resolvedProjectPath = path.resolve(projectPath); // user/home/documents/initial-test-0
  const projectName = path.basename(resolvedProjectPath); // user/initial-test-0

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

  // TODO: Add catalyst core
  // if (program.example === true) {
  //   console.error(
  //     'Please provide an example name or url, otherwise remove the example option.'
  //   )
  //   process.exit(1)
  // }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const userDir = os.homedir();
  const rootAppName = `${userDir}/${appName}` ;

  await makeDir(rootAppName);

  const folderExists = fs.existsSync(rootAppName);

  if (folderExists) {
    console.log(`${chalk.green('project directory created successfully')}`)
  } else {
    process.exit(1);
  }

  // const catalystCorePath = 'https://github.com/bigcommerce/catalyst/tree/main/apps/core/src/app';
  // TODO: handle core-files for catalyst
  const moveContent = (from: string, to: string) => {
    const transferHandler = (err: unknown) => {
      if (err) {
        return console.error(`${chalk.red('something went wrong on transfering files: ')}`, err);
      }

      return console.log(`${chalk.green('files successfully transfered to your destination folder: ')}`, to);
    };

    return fs.cp(from, to, {recursive: true}, transferHandler);
  };
  // const coreTemplates = `${process.cwd()}/core-test`;
  const coreTemplates = path.join(__dirname, '..', 'core-test');

  console.log('coreTemplates are ...', path.join(__dirname, '..', 'core-test'));

  await moveContent(coreTemplates, rootAppName);

  console.log(`${chalk.green('catalyst storefront templates created successfully')}`);
}
// NOTE: run fn ended



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
