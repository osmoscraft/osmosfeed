import { getTests, runTests } from "@osmoscraft/typescript-testing-library"

import "./__tests__/osmosfeed.e2e"; // to trigger ts-node-dev watcher

async function run() {
  const tests = await getTests(".", /e2e\.ts$/);
  runTests(tests);
}

run();
