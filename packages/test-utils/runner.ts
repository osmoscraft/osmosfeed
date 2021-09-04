import { readdir } from "fs/promises";
import { resolve } from "path";
import { bold, green, red, yellow } from "./print";
import { logger } from "./reporter";
import { scheduledSuites } from "./scheduler";

export interface RunTestConfig {
  /** Instead of exit process, return the error summary to the caller */
  noExit?: boolean;
  quiet?: boolean;
}

export async function runTests(files: string[], config?: RunTestConfig) {
  logger.setSilent(!!config?.quiet);

  for (let file of files) {
    await import(file);
  }

  let suiteCount = 0;
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  for (let suite of scheduledSuites) {
    suiteCount++;

    for (let task of suite.beforeAll) {
      try {
        await task.run();
      } catch (error: any) {
        logger.info(yellow(`[WARN] ${suite.name}/${task.name}`));
        logger.error(error);
        warningCount++;
      }
    }

    for (let spec of suite.specs) {
      try {
        for (let task of suite.beforeEach) {
          try {
            await task.run();
          } catch (error: any) {
            logger.info(yellow(`[WARN] ${suite.name}/${task.name}`));
            logger.error(error);
            warningCount++;
          }
        }

        await spec.run();

        for (let task of suite.afterEach) {
          try {
            await task.run();
          } catch (error: any) {
            logger.info(yellow(`[WARN] ${suite.name}/${task.name}`));
            logger.error(error);
            warningCount++;
          }
        }

        logger.info(green(`[PASS] ${suite.name}/${spec.name}`));
        passCount++;
      } catch (error: any) {
        logger.info(red(`[FAIL] ${suite.name}/${spec.name}`));
        logger.error(error);
        failCount++;
      }
    }

    for (let task of suite.afterAll) {
      try {
        await task.run();
      } catch (error: any) {
        logger.info(yellow(`[WARN] ${suite.name}/${task.name}`));
        logger.error(error);
        warningCount++;
      }
    }
  }

  logger.info(
    (failCount + warningCount > 0 ? red : green)(
      bold(
        `\n${suiteCount} suites | ${
          passCount + failCount
        } specs | ${passCount} passed | ${failCount} failed | ${warningCount} issues\n`
      )
    )
  );

  if (!config?.noExit && failCount + warningCount) process.exit(1);

  return {
    stats: {
      suiteCount,
      passCount,
      failCount,
      warningCount,
    },
  };
}

export async function getTests(rootDir: string, matchPattern: RegExp) {
  const files = (await getFiles(rootDir)) as string[];
  const testFiles = files.filter((file) => file.match(matchPattern));
  return testFiles;
}

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }) as any
  );

  return Array.prototype.concat(...files);
}
