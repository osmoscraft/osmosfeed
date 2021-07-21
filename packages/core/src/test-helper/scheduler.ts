const scheduledSuites: ScheduledSuite[] = [];

export function describe(suiteName: string, suiteContext: (context: { spec: ScheduleSpecFn }) => void) {
  const scheduleSpec = (specName: string, run: () => Promise<void>) => {
    let currentSuite = scheduledSuites.find((suite) => suite.name === suiteName);
    if (!currentSuite) {
      currentSuite = {
        name: suiteName,
        specs: [],
      };
      scheduledSuites.push(currentSuite);
    }

    currentSuite.specs.push({
      name: specName,
      run,
    });
  };

  suiteContext({ spec: scheduleSpec });
}

export async function runTests() {
  let suiteCount = 0;
  let passCount = 0;
  let failCount = 0;

  for (let suite of scheduledSuites) {
    suiteCount++;
    for (let spec of suite.specs) {
      try {
        await spec.run();
        console.log(`[PASS] ${suite.name}/${spec.name}`);
        passCount++;
      } catch (error) {
        console.log(`[FAIL] ${suite.name}/${spec.name}`);
        console.error(error);
        failCount++;
      }
    }
  }

  console.log(`${suiteCount} suites | ${passCount + failCount} specs | ${passCount} passed | ${failCount} failed`);
  if (failCount) process.exit(1);
}

interface ScheduledSuite {
  name: string;
  specs: ScheduledSpec[];
}

interface ScheduledSpec {
  name: string;
  run: () => Promise<void>;
}

interface ScheduleSpecFn {
  (specName: string, run: () => Promise<void>): void;
}
