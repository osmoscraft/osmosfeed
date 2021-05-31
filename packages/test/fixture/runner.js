import { spawn } from "child_process";
import path from "path";

/**
 * Information about the current test scenario
 * @typedef {Object} ScenarioContext
 * @property {string} dir - Full path to the directory that contains the scenario
 * @property {(specName: string, specFn: (context: SpecContext) => Promise<void>) => Promise<void>} spec - Async function that contains the assertions
 */

/**
 * Information about the current spec
 * @typedef {Object} SpecContext
 * @property {string} dir - Full path to the directory that contains the scenario
 */

/**
 * @param {string} scenarioDir
 * @param {string} scenarioName
 * @param {(context: ScenarioContext) => Promise<void>} scenarioFn
 */
export async function scenario(scenarioDir, scenarioName, scenarioFn) {
  return new Promise((resolve, reject) => {
    const scenarioFullDir = path.resolve("scenarios", scenarioDir);
    const mockServerThread = spawn("node", ["../../mock-server/serve-static.js"], { cwd: scenarioFullDir });
    const mockSeverStderrPipe = mockServerThread.stderr.pipe(process.stderr);

    const builderThread = spawn("npm", ["run", "build"], { cwd: scenarioFullDir });
    const builderStderrPipe = builderThread.stderr.pipe(process.stderr);

    builderThread.on("error", (err) => {
      console.log(`"${scenarioName}" emitted error event`, err);
      reject(err);
    });

    builderThread.on("exit", async (exitCode) => {
      mockSeverStderrPipe.destroy();
      builderStderrPipe.destroy();
      mockServerThread.kill();

      if (exitCode !== 0) {
        return reject(new Error(`"${scenarioName}" error exit code ${exitCode}`));
      }

      const runSpec = async (specName, specFn) => {
        console.log(`[SPEC] ${scenarioName}: ${specName}`);
        try {
          await specFn({ dir: scenarioFullDir });
        } catch (err) {
          console.log(`"${scenarioName}: ${specName}" failed`);
          throw err;
        }
      };

      await scenarioFn({ dir: scenarioFullDir, spec: runSpec });
      resolve();
    });
  });
}
