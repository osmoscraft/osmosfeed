import { getTests, runTests } from "@osmoscraft/typescript-testing-library";

async function run() {
  const tests = await getTests("src", /\.test\.ts$/);
  runTests(tests);
}

run();
