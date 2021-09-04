import assert from "assert/strict";
import { getTests, runTests } from "./";
import { scheduledSuites, _clearScheduledTests } from "./scheduler";

async function runAssertionPassingTests() {
  const tests = await getTests("./", /assertion-should-pass\.test\.ts$/);
  const results = runTests(tests, { noExit: true, quiet: false });

  return results;
}

async function runAssertionFailingTests() {
  const tests = await getTests("./", /assertion-should-fail\.test\.ts$/);
  const results = runTests(tests, { noExit: true, quiet: true });

  return results;
}

async function runLifecycleFailingTests() {
  const tests = await getTests("./", /lifecycle-should-fail\.test\.ts$/);
  const results = runTests(tests, { noExit: true, quiet: true });

  return results;
}

async function runSchedulerTests() {
  const tests = await getTests("./", /scheduler\.test\.ts$/);
  const results = runTests(tests, { noExit: true, quiet: false });

  return results;
}

async function runToolsTests() {
  const tests = await getTests("./", /tools\.test\.ts$/);
  const results = runTests(tests, { noExit: true, quiet: false });

  return results;
}

async function run() {
  const assertionShouldPassResults = await runAssertionPassingTests();
  assert.deepEqual(assertionShouldPassResults.stats.failCount, 0);
  assert.deepEqual(assertionShouldPassResults.stats.warningCount, 0);
  assert.deepEqual(assertionShouldPassResults.stats.suiteCount > 0, true);
  assert.deepEqual(assertionShouldPassResults.stats.passCount > 0, true);

  _clearScheduledTests();

  const assertionsShouldFailResults = await runAssertionFailingTests();
  assert.deepEqual(assertionsShouldFailResults.stats.failCount > 0, true);
  assert.deepEqual(assertionsShouldFailResults.stats.warningCount, 0);
  assert.deepEqual(assertionsShouldFailResults.stats.suiteCount > 0, true);
  assert.deepEqual(assertionsShouldFailResults.stats.passCount, 0);

  _clearScheduledTests();

  const lifecycleResults = await runLifecycleFailingTests();
  assert.deepEqual(lifecycleResults.stats.failCount, 0);
  // we set up one warning per spec
  assert.deepEqual(lifecycleResults.stats.warningCount, 4);
  assert.deepEqual(lifecycleResults.stats.suiteCount > 0, true);
  assert.deepEqual(lifecycleResults.stats.passCount, 4);

  _clearScheduledTests();

  const toolsTestsResults = await runToolsTests();
  assert.deepEqual(toolsTestsResults.stats.failCount, 0);
  assert.deepEqual(toolsTestsResults.stats.warningCount, 0);
  assert.deepEqual(toolsTestsResults.stats.suiteCount > 0, true);
  assert.deepEqual(toolsTestsResults.stats.passCount > 0, true);

  _clearScheduledTests();
  const schedulerResults = await runSchedulerTests();
  assert.deepEqual(schedulerResults.stats.failCount, 0);
  assert.deepEqual(schedulerResults.stats.warningCount, 0);
  assert.deepEqual(schedulerResults.stats.suiteCount > 0, true);
  assert.deepEqual(schedulerResults.stats.passCount > 0, true);

  console.log(
    `${
      assertionShouldPassResults.stats.failCount + assertionShouldPassResults.stats.warningCount
    } assertion should-pass tests failed`
  );
  console.log(`${assertionsShouldFailResults.stats.passCount} assertion should-fail tests passed`);
  console.log(`${lifecycleResults.stats.warningCount} lifecycle issues successfully reported`);
  console.log(`${schedulerResults.stats.failCount + schedulerResults.stats.warningCount} scheduler tests failed`);
}

run();
