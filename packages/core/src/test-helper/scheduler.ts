export interface DescribeFn {
  (context: ScenarioContext): void;
}

export interface ScenarioContext {
  spec: SpecFn;
}

export interface SpecFn {
  (specName: string, specFn: () => Promise<void>): Promise<void>;
}

export interface CollectedSpecFn {
  name: string;
  fn: () => Promise<void>;
}

export async function describe(scenarioName: string, describeFn: DescribeFn) {
  const collectedSpecFns: CollectedSpecFn[] = [];

  const collectSpec: SpecFn = async (specName, specFn) => {
    collectedSpecFns.push({
      name: specName,
      fn: specFn,
    });
  };

  describeFn({ spec: collectSpec });

  const collectedErrors: Error[] = [];

  for (let spec of collectedSpecFns) {
    try {
      await spec.fn();
      console.log(`[PASS] ${scenarioName}/${spec.name}`);
    } catch (err) {
      console.log(`[FAIL] ${scenarioName}/${spec.name}`);
      console.error(err);
      collectedErrors.push(err);
    }
  }

  if (collectedErrors.length) process.exit(1);
}
