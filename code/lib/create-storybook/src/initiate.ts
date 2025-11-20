import { ProjectType } from 'storybook/internal/cli';
import { type JsPackageManager, executeCommand } from 'storybook/internal/common';
import { withTelemetry } from 'storybook/internal/core-server';
import { logTracker, logger } from 'storybook/internal/node-logger';
import { ErrorCollector } from 'storybook/internal/telemetry';

<<<<<<< HEAD
import boxen from 'boxen';
import * as find from 'empathic/find';
// eslint-disable-next-line depend/ban-dependencies
import execa from 'execa';
import picocolors from 'picocolors';
import { getProcessAncestry } from 'process-ancestry';
import prompts from 'prompts';
import { lt, prerelease } from 'semver';
import { dedent } from 'ts-dedent';

import angularGenerator from './generators/ANGULAR';
import emberGenerator from './generators/EMBER';
import htmlGenerator from './generators/HTML';
import nextjsGenerator from './generators/NEXTJS';
import nuxtGenerator from './generators/NUXT';
import preactGenerator from './generators/PREACT';
import qwikGenerator from './generators/QWIK';
import reactGenerator from './generators/REACT';
import reactNativeGenerator from './generators/REACT_NATIVE';
import reactNativeWebGenerator from './generators/REACT_NATIVE_WEB';
import reactScriptsGenerator from './generators/REACT_SCRIPTS';
import serverGenerator from './generators/SERVER';
import solidGenerator from './generators/SOLID';
import svelteGenerator from './generators/SVELTE';
import svelteKitGenerator from './generators/SVELTEKIT';
import vue3Generator from './generators/VUE3';
import webComponentsGenerator from './generators/WEB-COMPONENTS';
import webpackReactGenerator from './generators/WEBPACK_REACT';
import type { CommandOptions, GeneratorFeature, GeneratorOptions } from './generators/types';
import { packageVersions } from './ink/steps/checks/packageVersions';
import { vitestConfigFiles } from './ink/steps/checks/vitestConfigFiles';
import { currentDirectoryIsEmpty, scaffoldNewProject } from './scaffold-new-project';

const ONBOARDING_PROJECT_TYPES = [
  ProjectType.REACT,
  ProjectType.REACT_SCRIPTS,
  ProjectType.REACT_NATIVE_WEB,
  ProjectType.REACT_PROJECT,
  ProjectType.WEBPACK_REACT,
  ProjectType.NEXTJS,
  ProjectType.VUE3,
  ProjectType.ANGULAR,
];

const installStorybook = async <Project extends ProjectType>(
  projectType: Project,
  packageManager: JsPackageManager,
  options: CommandOptions
): Promise<any> => {
  const npmOptions: NpmOptions = {
    type: 'devDependencies',
    skipInstall: options.skipInstall,
  };

  const language = await detectLanguage(packageManager as any);

  // TODO: Evaluate if this is correct after removing pnp compatibility code in SB11
  const pnp = await detectPnp();
  if (pnp) {
    deprecate(dedent`
      As of Storybook 10.0, PnP is deprecated.
      If you are using PnP, you can continue to use Storybook 10.0, but we recommend migrating to a different package manager or linker-mode.

      In future versions, PnP compatibility will be removed.
    `);
  }

  const generatorOptions: GeneratorOptions = {
    language,
    builder: options.builder as Builder,
    linkable: !!options.linkable,
    pnp: pnp || (options.usePnp as boolean),
    yes: options.yes as boolean,
    projectType,
    features: options.features || [],
  };

  const runGenerator: () => Promise<any> = async () => {
    switch (projectType) {
      case ProjectType.REACT_SCRIPTS:
        return reactScriptsGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Create React App" based project')
        );

      case ProjectType.REACT:
        return reactGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "React" app')
        );

      case ProjectType.REACT_NATIVE: {
        return reactNativeGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "React Native" app')
        );
      }

      case ProjectType.REACT_NATIVE_WEB: {
        return reactNativeWebGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "React Native" app')
        );
      }

      case ProjectType.REACT_NATIVE_AND_RNW: {
        commandLog('Adding Storybook support to your "React Native" app');
        await reactNativeGenerator(packageManager, npmOptions, generatorOptions);
        return reactNativeWebGenerator(packageManager, npmOptions, generatorOptions);
      }

      case ProjectType.QWIK: {
        return qwikGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Qwik" app')
        );
      }

      case ProjectType.WEBPACK_REACT:
        return webpackReactGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Webpack React" app')
        );

      case ProjectType.REACT_PROJECT:
        return reactGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "React" library')
        );

      case ProjectType.NEXTJS:
        return nextjsGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Next" app')
        );

      case ProjectType.VUE3:
        return vue3Generator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Vue 3" app')
        );

      case ProjectType.NUXT:
        return nuxtGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Nuxt" app')
        );

      case ProjectType.ANGULAR:
        commandLog('Adding Storybook support to your "Angular" app');
        return angularGenerator(packageManager, npmOptions, generatorOptions, options);

      case ProjectType.EMBER:
        return emberGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Ember" app')
        );

      case ProjectType.HTML:
        return htmlGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "HTML" app')
        );

      case ProjectType.WEB_COMPONENTS:
        return webComponentsGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "web components" app')
        );

      case ProjectType.PREACT:
        return preactGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Preact" app')
        );

      case ProjectType.SVELTE:
        return svelteGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Svelte" app')
        );

      case ProjectType.SVELTEKIT:
        return svelteKitGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "SvelteKit" app')
        );

      case ProjectType.SERVER:
        return serverGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "Server" app')
        );

      case ProjectType.NX:
        throw new NxProjectDetectedError();

      case ProjectType.SOLID:
        return solidGenerator(packageManager, npmOptions, generatorOptions).then(
          commandLog('Adding Storybook support to your "SolidJS" app')
        );

      case ProjectType.UNSUPPORTED:
        paddedLog(`We detected a project type that we don't support yet.`);
        paddedLog(
          `If you'd like your framework to be supported, please let use know about it at https://github.com/storybookjs/storybook/issues`
        );

        // Add a new line for the clear visibility.
        logger.log('');

        return Promise.resolve();

      default:
        paddedLog(`We couldn't detect your project type. (code: ${projectType})`);
        paddedLog(
          'You can specify a project type explicitly via `storybook init --type <type>`, see our docs on how to configure Storybook for your framework: https://storybook.js.org/docs/get-started/install'
        );

        // Add a new line for the clear visibility.
        logger.log('');

        return projectTypeInquirer(options, packageManager);
    }
  };

  try {
    return await runGenerator();
  } catch (err: any) {
    if (err?.message !== 'Canceled by the user' && err?.stack) {
      logger.error(`\n     ${picocolors.red(err.stack)}`);
    }
    throw new HandledError(err);
  }
};

const projectTypeInquirer = async (
  options: CommandOptions & { yes?: boolean },
  packageManager: JsPackageManager
) => {
  const manualAnswer = options.yes
    ? true
    : await prompts([
        {
          type: 'confirm',
          name: 'manual',
          message: 'Do you want to manually choose a Storybook project type to install?',
          initial: true,
        },
      ]);

  if (manualAnswer !== true && manualAnswer.manual) {
    const { manualFramework } = await prompts([
      {
        type: 'select',
        name: 'manualFramework',
        message: 'Please choose a project type from the following list:',
        choices: installableProjectTypes.map((type) => ({
          title: type,
          value: type.toUpperCase(),
        })),
      },
    ]);

    if (manualFramework) {
      return installStorybook(manualFramework, packageManager, options);
    }
  }

  logger.log('');
  logger.log('For more information about installing Storybook: https://storybook.js.org/docs');
  process.exit(0);
};

interface PromptOptions {
  skipPrompt?: boolean;
  disableTelemetry?: boolean;
  settings: Settings;
  projectType?: ProjectType;
}

type InstallType = 'recommended' | 'light';
=======
import {
  executeAddonConfiguration,
  executeDependencyInstallation,
  executeFinalization,
  executeFrameworkDetection,
  executeGeneratorExecution,
  executePreflightCheck,
  executeProjectDetection,
  executeUserPreferences,
} from './commands';
import { DependencyCollector } from './dependency-collector';
import { registerAllGenerators } from './generators';
import type { CommandOptions } from './generators/types';
import { FeatureCompatibilityService } from './services/FeatureCompatibilityService';
import { TelemetryService } from './services/TelemetryService';
>>>>>>> upstream/next

/**
 * Main entry point for Storybook initialization
 *
 * This is a clean, command-based orchestration that replaces the monolithic 986-line implementation
 * with a modular, testable approach.
 */
export async function doInitiate(options: CommandOptions): Promise<
  | {
      shouldRunDev: true;
      shouldOnboard: boolean;
      projectType: ProjectType;
      packageManager: JsPackageManager;
      storybookCommand?: string | null;
    }
  | { shouldRunDev: false }
> {
  // Initialize services
  const telemetryService = new TelemetryService(options.disableTelemetry);

  // Register all framework generators
  registerAllGenerators();

  let dependencyCollector: DependencyCollector | null = new DependencyCollector();

  // Step 1: Run preflight checks
  const { packageManager } = await executePreflightCheck(options);

  // Step 2: Detect project type
  const { projectType, language } = await executeProjectDetection(packageManager, options);

  // Step 3: Detect framework, renderer, and builder
  const { framework, builder, renderer } = await executeFrameworkDetection(
    projectType,
    packageManager,
    options
  );

  // Step 4: Get user preferences and feature selections (with framework/builder for validation)
  const { newUser, selectedFeatures } = await executeUserPreferences(packageManager, {
    options,
    framework,
    builder,
    projectType,
  });

  // Step 5: Execute generator with dependency collector (now with frameworkInfo)

  const { configDir, storybookCommand, shouldRunDev, extraAddons } =
    await executeGeneratorExecution({
      projectType,
      packageManager,
      frameworkInfo: { builder, framework, renderer },
      options,
      dependencyCollector,
      selectedFeatures,
      language,
    });

  // Step 6: Install all dependencies in a single operation
  const dependencyInstallationResult = await executeDependencyInstallation({
    packageManager,
    dependencyCollector,
    skipInstall: !!options.skipInstall,
    selectedFeatures,
  });

  // After dependencies are installed, we must not use the dependency collector anymore
  dependencyCollector = null;

  // Step 7: Configure addons (run postinstall scripts for configuration only)
  await executeAddonConfiguration({
    packageManager,
    addons: extraAddons,
    configDir,
    dependencyInstallationResult,
    options,
  });

  // Step 8: Print final summary
  await executeFinalization({
    logfile: options.logfile,
    storybookCommand,
  });

<<<<<<< HEAD
      2. Wrap your metro config with the withStorybook enhancer function like this:

      ${picocolors.inverse(' ' + "const { withStorybook } = require('@storybook/react-native/metro/withStorybook');" + ' ')}
      ${picocolors.inverse(' ' + 'module.exports = withStorybook(defaultConfig);' + ' ')}

      For more details go to:
      ${picocolors.cyan('https://github.com/storybookjs/react-native#getting-started')}

      Then to start RN Storybook, run:

      ${picocolors.inverse(' ' + packageManager.getRunCommand('start') + ' ')}
    `);

    if (projectType === ProjectType.REACT_NATIVE_AND_RNW) {
      logger.log(dedent`

        ${picocolors.yellow('React Native Web (RNW) Storybook is fully installed.')}

        To start RNW Storybook, run:

        ${picocolors.inverse(' ' + packageManager.getRunCommand('storybook') + ' ')}
      `);
    }
    return { shouldRunDev: false };
  }

  const foundGitIgnoreFile = find.up('.gitignore');
  const rootDirectory = getProjectRoot();
  if (foundGitIgnoreFile && foundGitIgnoreFile.includes(rootDirectory)) {
    const contents = await fs.readFile(foundGitIgnoreFile, 'utf-8');
    const hasStorybookLog = contents.includes('*storybook.log');
    const hasStorybookStatic = contents.includes('storybook-static');
    const linesToAdd = [
      !hasStorybookLog ? '*storybook.log' : '',
      !hasStorybookStatic ? 'storybook-static' : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (linesToAdd) {
      await fs.appendFile(foundGitIgnoreFile, `\n${linesToAdd}\n`);
    }
  }

  const storybookCommand =
    projectType === ProjectType.ANGULAR
      ? `ng run ${installResult.projectName}:storybook`
      : packageManager.getRunCommand('storybook');

  if (selectedFeatures.has('test')) {
    const flags = ['--yes', options.skipInstall && '--skip-install'].filter(Boolean).join(' ');
    logger.log(
      `> npx storybook@${versions.storybook} add ${flags} @storybook/addon-a11y@${versions['@storybook/addon-a11y']}`
    );
    execSync(
      `npx storybook@${versions.storybook} add ${flags} @storybook/addon-a11y@${versions['@storybook/addon-a11y']}`,
      { cwd: process.cwd(), stdio: 'inherit' }
    );
    logger.log(
      `> npx storybook@${versions.storybook} add ${flags} @storybook/addon-vitest@${versions['@storybook/addon-vitest']}`
    );
    execSync(
      `npx storybook@${versions.storybook} add ${flags} @storybook/addon-vitest@${versions['@storybook/addon-vitest']}`,
      { cwd: process.cwd(), stdio: 'inherit' }
    );
  }

  const printFeatures = (features: Set<GeneratorFeature>) =>
    Array.from(features).join(', ') || 'none';

  logger.log(
    boxen(
      dedent`
          Storybook was successfully installed in your project! 🎉
          Additional features: ${printFeatures(selectedFeatures)}

          To run Storybook manually, run ${picocolors.yellow(
            picocolors.bold(storybookCommand)
          )}. CTRL+C to stop.

          Wanna know more about Storybook? Check out ${picocolors.cyan('https://storybook.js.org/')}
          Having trouble or want to chat? Join us at ${picocolors.cyan(
            'https://discord.gg/storybook/'
          )}
        `,
      { borderStyle: 'round', padding: 1, borderColor: '#F1618C' }
    )
  );
=======
  // Step 9: Track telemetry
  await telemetryService.trackInitWithContext(projectType, selectedFeatures, newUser);
>>>>>>> upstream/next

  return {
    shouldRunDev:
      !!options.dev &&
      !options.skipInstall &&
      shouldRunDev !== false &&
      ErrorCollector.getErrors().length === 0,
    shouldOnboard: newUser,
    projectType,
    packageManager,
    storybookCommand,
  };
}

const handleCommandFailure = async (logFilePath: string | boolean | undefined): Promise<never> => {
  const logFile = await logTracker.writeToFile(logFilePath);
  logger.error('Storybook encountered an error during initialization');
  logger.log(`Storybook debug logs can be found at: ${logFile}`);
  logger.outro('Storybook exited with an error');
  process.exit(1);
};

// cli command -> ctrl c -> exit 0
// process.on('SIGINT', () => {
// })

/** Main initiate function with telemetry wrapper */
export async function initiate(options: CommandOptions): Promise<void> {
  const initiateResult = await withTelemetry(
    'init',
    {
      cliOptions: options,
      printError: (err) => !err.handled && logger.error(err),
    },
    async () => {
      const result = await doInitiate(options);

      logger.outro('');

      return result;
    }
  ).catch(() => {
    handleCommandFailure(options.logfile);
  });

  if (initiateResult?.shouldRunDev) {
    await runStorybookDev(initiateResult);
  }
}

/** Run Storybook dev server after installation */
async function runStorybookDev(result: {
  projectType: ProjectType;
  packageManager: JsPackageManager;
<<<<<<< HEAD
  storybookCommand?: string;
=======
  storybookCommand?: string | null;
>>>>>>> upstream/next
  shouldOnboard: boolean;
}): Promise<void> {
  const { projectType, packageManager, storybookCommand, shouldOnboard } = result;

  if (!storybookCommand) {
    return;
  }

  try {
<<<<<<< HEAD
    const supportsOnboarding = [
      ProjectType.REACT_SCRIPTS,
      ProjectType.REACT,
      ProjectType.WEBPACK_REACT,
      ProjectType.REACT_PROJECT,
      ProjectType.NEXTJS,
      ProjectType.VUE3,
      ProjectType.ANGULAR,
    ].includes(projectType);

    const flags = [];

=======
    const supportsOnboarding = FeatureCompatibilityService.supportsOnboarding(projectType);

    const flags = [];

    if (packageManager.type === 'npm') {
      flags.push('--silent');
    }

>>>>>>> upstream/next
    // npm needs extra -- to pass flags to the command
    // in the case of Angular, we are calling `ng run` which doesn't need the extra `--`
    if (packageManager.type === 'npm' && projectType !== ProjectType.ANGULAR) {
      flags.push('--');
    }

    if (supportsOnboarding && shouldOnboard) {
      flags.push('--initial-path=/onboarding');
    }

    flags.push('--quiet');

    // instead of calling 'dev' automatically, we spawn a subprocess so that it gets
    // executed directly in the user's project directory. This avoid potential issues
    // with packages running in npxs' node_modules
<<<<<<< HEAD
    logger.log('\nRunning Storybook');
    execa.command(`${storybookCommand} ${flags.join(' ')}`, {
=======
    const [command, ...args] = [...storybookCommand.split(' '), ...flags];
    executeCommand({
      command: command,
      args,
>>>>>>> upstream/next
      stdio: 'inherit',
    });
  } catch {
    // Do nothing here, as the command above will spawn a `storybook dev` process which does the error handling already
  }
}
