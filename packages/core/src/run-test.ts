import { getTests, runTests } from "@osmoscraft/test-utils";

async function run() {
  const tests = await getTests(".", /\.test\.ts$/);
  runTests(tests);
}

run();
