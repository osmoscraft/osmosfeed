import { red } from "./print";

export const scheduledSuites: ScheduledSuite[] = [];

export function _clearScheduledTests() {
  // todo replace with OOP class-based design
  scheduledSuites.splice(0, scheduledSuites.length);
}

export function describe(suiteName: string, scheduleSuite: () => void) {
  const currentSuite = createCurrentSuite();

  scheduleSuite();

  currentSuite.isDraft = false;
  currentSuite.name = suiteName;
}

export const beforeAll = createTaskScheduler("beforeAll");
export const beforeEach = createTaskScheduler("beforeEach");
export const afterEach = createTaskScheduler("afterEach");
export const afterAll = createTaskScheduler("afterAll");
export const it: ScheduleNamedTask = (specName, run) => {
  const currentSuite = getCurrentSuite();
  currentSuite.specs.push({
    name: specName,
    run,
  });
};

function createTaskScheduler(taskGroupName: keyof ScheduledSuite) {
  const scheduler: ScheduleAnonymousTask = (run) => {
    const currentSuite = getCurrentSuite();
    (currentSuite[taskGroupName] as any[]).push({
      name: taskGroupName,
      run,
    });
  };

  return scheduler;
}

function createCurrentSuite(): ScheduledSuite {
  const currentSuite = getDraftSuite();
  scheduledSuites.push(currentSuite);
  return currentSuite;
}

function getCurrentSuite(): ScheduledSuite {
  let currentSuite = scheduledSuites.find((suite) => suite.isDraft);
  if (!currentSuite) {
    console.error(red("No suite found. Did you forget to `describe`?"));
    process.exit(1);
  }

  return currentSuite;
}

function getDraftSuite() {
  return {
    name: "",
    beforeAll: [],
    beforeEach: [],
    afterEach: [],
    afterAll: [],
    specs: [],
    isDraft: true,
  };
}

interface ScheduledSuite {
  name: string;
  beforeAll: ScheduledTask[];
  beforeEach: ScheduledTask[];
  specs: ScheduledTask[];
  afterEach: ScheduledTask[];
  afterAll: ScheduledTask[];
  isDraft: boolean;
}

interface ScheduledTask {
  name: string;
  run: AsyncCall;
}

interface ScheduleNamedTask {
  (specName: string, run: AsyncCall): void;
}

interface ScheduleAnonymousTask {
  (task: AsyncCall): void;
}

interface AsyncCall {
  (): Promise<void>;
}
