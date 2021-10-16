import { getTests, runTests } from "@osmoscraft/typescript-testing-library"

async function run() {
  const tests = await getTests(".", /\.test\.ts$/);
  runTests(tests);
}

run();
