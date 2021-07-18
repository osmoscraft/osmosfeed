export interface ScenarioFn {
  (context: ScenarioContext): Promise<void>
}

export interface ScenarioContext {
  spec: SpecFn;
}

export interface SpecFn {
  (specName: string, specFn: () => Promise<void>): Promise<void>
}

export async function describe(scenarioName: string, scenarioFn: ScenarioFn) {
  return new Promise(async (resolve, reject) => {

    const runSpec: SpecFn = async (specName, specFn) => {
      console.log(`[SPEC] ${scenarioName}: ${specName}`);
      try {
        await specFn();
      } catch (err) {
        console.log(`"${scenarioName}: ${specName}" failed`);
        reject(err);
      }
    };

    await scenarioFn({ spec: runSpec });
    resolve(true);
  });
}
