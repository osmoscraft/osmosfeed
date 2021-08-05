const scheduledSuites: ScheduledSuite[] = [];

export function describe(
  suiteName: string,
  suiteContext: (context: { beforeEach: ScheduleTask; afterEach: ScheduleTask; spec: ScheduleSpecFn }) => void
) {
  const getInitialSuite = () => ({
    name: suiteName,
    beforeEach: [],
    afterEach: [],
    specs: [],
  });

  const scheduleBeforeEach: ScheduleTask = (task) => {
    let currentSuite = scheduledSuites.find((suite) => suite.name === suiteName);
    if (!currentSuite) {
      currentSuite = getInitialSuite();
      scheduledSuites.push(currentSuite);
    }

    currentSuite.beforeEach.push(task);
  };

  const scheduleAfterEach: ScheduleTask = (task) => {
    let currentSuite = scheduledSuites.find((suite) => suite.name === suiteName);
    if (!currentSuite) {
      currentSuite = getInitialSuite();
      scheduledSuites.push(currentSuite);
    }

    currentSuite.afterEach.push(task);
  };

  const scheduleSpec: ScheduleSpecFn = (specName, run) => {
    let currentSuite = scheduledSuites.find((suite) => suite.name === suiteName);
    if (!currentSuite) {
      currentSuite = getInitialSuite();
      scheduledSuites.push(currentSuite);
    }

    currentSuite.specs.push({
      name: specName,
      run,
    });
  };

  suiteContext({ beforeEach: scheduleBeforeEach, afterEach: scheduleAfterEach, spec: scheduleSpec });
}

export async function runTests() {
  let suiteCount = 0;
  let passCount = 0;
  let failCount = 0;

  for (let suite of scheduledSuites) {
    suiteCount++;

    for (let spec of suite.specs) {
      try {
        for (let task of suite.beforeEach) {
          await task();
        }
        await spec.run();
        for (let task of suite.afterEach) {
          await task();
        }
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
  beforeEach: AsyncCall[];
  specs: ScheduledSpec[];
  afterEach: AsyncCall[];
}

interface ScheduledSpec {
  name: string;
  run: AsyncCall;
}

interface ScheduleSpecFn {
  (specName: string, run: AsyncCall): void;
}

interface ScheduleTask {
  (task: AsyncCall): void;
}

interface AsyncCall {
  (): Promise<void>;
}
