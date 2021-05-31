import assert from "assert/strict";
import { exit } from "process";
import { scenario } from "./fixture/runner.js";
import { readJsonAsync, readDirAsync, readFileAsync } from "./fixture/utils.js";

try {
  await scenario("default-empty", "A single empty source with no customization", async ({ spec }) => {
    await spec("Cache is not changed", assertCacheIsNotChanged);
    await spec("System assets are copied", assertSystemAssetsAreCopied);
    await spec("Default template assets are copied", assertDefaultTemplateAssetsAreCopied);
  });

  await scenario("with-user-assets", "A single empty source with static assets from user", async ({ spec }) => {
    await spec("Cache is not changed", assertCacheIsNotChanged);
    await spec("System assets are copied", assertSystemAssetsAreCopied);
    await spec("Default template assets are copied", assertDefaultTemplateAssetsAreCopied);

    await spec("robots.txt is copied", async ({ dir }) => {
      const files = await readDirAsync(`${dir}/public`);
      assert(files.includes("robots.txt"));
    });

    await spec("favicon.ico overwrites default", async ({ dir }) => {
      const outputVersion = await readFileAsync(`${dir}/public/favicon.ico`);
      const userVersion = await readFileAsync(`${dir}/static/favicon.ico`);
      assert(Buffer.compare(outputVersion, userVersion) === 0);
    });

    await spec("index.js overwrites default", async ({ dir }) => {
      const outputVersion = await readFileAsync(`${dir}/public/index.js`);
      const userVersion = await readFileAsync(`${dir}/static/index.js`);
      assert(Buffer.compare(outputVersion, userVersion) === 0);
    });
  });

  console.log("[PASS] All tests passed");
} catch (error) {
  console.error(`[FAIL] Some tests failed.`, error);
  exit(1);
}

async function assertCacheIsNotChanged({ dir }) {
  const cacheOutput = await readJsonAsync(`${dir}/public/cache.json`);
  const cacheSnapshot = await readJsonAsync(`${dir}/snapshots/cache.json`);
  assert.deepEqual(cacheOutput.sources, cacheSnapshot.sources);
}

async function assertSystemAssetsAreCopied({ dir }) {
  const files = await readDirAsync(`${dir}/public`);
  assert(files.includes("favicon.ico"));
}

async function assertDefaultTemplateAssetsAreCopied({ dir }) {
  const files = await readDirAsync(`${dir}/public`);
  assert(files.includes("index.css"));
  assert(files.includes("index.js"));
}
