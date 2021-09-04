import { getTests, runTests } from "@osmoscraft/test-utils";

import "./__tests__/e2e.test"; // to trigger ts-node-dev watcher

async function run() {
	const tests = await getTests(".", /e2e\.test\.ts$/);
	runTests(tests);
}

run();
