import assert from "assert/strict";
import { exit } from "process";
import { scenario } from "./fixture/runner.js";
import { readJsonAsync, readDirAsync, readFileAsync } from "./fixture/utils.js";

try {
  await scenario("default-empty", "Single empty source with no customization", async ({ spec }) => {
    await spec("Cache is not changed", assertCacheIsNotChanged);
    await spec("System assets are copied", assertSystemAssetsAreCopied);
    await spec("Default template assets are copied", assertDefaultTemplateAssetsAreCopied);
  });

  await scenario("with-user-assets", "Single empty source with static assets from user", async ({ spec }) => {
    await spec("Cache is not changed", assertCacheIsNotChanged);
    await spec("System assets are copied", assertSystemAssetsAreCopied);
    await spec("Default template assets are copied", assertDefaultTemplateAssetsAreCopied);

    await spec("robots.txt is copied", async ({ dir }) => {
      const files = await readDirAsync(`${dir}/public`);
      assert(files.includes("robots.txt"));
    });

    await spec("favicon.ico is copied", async ({ dir }) => {
      const outputVersion = await readFileAsync(`${dir}/public/favicon.ico`);
      const userVersion = await readFileAsync(`${dir}/static/favicon.ico`);
      assert(Buffer.compare(outputVersion, userVersion) === 0);
    });

    await spec("index.js is copied", async ({ dir }) => {
      const outputVersion = await readFileAsync(`${dir}/public/index.js`, "utf-8");
      const userVersion = await readFileAsync(`${dir}/static/index.js`, "utf-8");
      assert(userVersion === outputVersion);
      assert(outputVersion.includes("// hello world"));
    });
  });

  await scenario("with-user-templates", "Single empty source with template from user", async ({ spec }) => {
    await spec("Cache is not changed", assertCacheIsNotChanged);
    await spec("System assets are copied", assertSystemAssetsAreCopied);
    await spec("Default template assets not copied", assertDefaultTemplateAssetsAreNotCopied);

    await spec("index.hbs is rendered into index.html", async ({ dir }) => {
      const outputHtml = await readFileAsync(`${dir}/public/index.html`, "utf-8");
      assert(outputHtml.includes("test template"));
    });
  });

  await scenario("with-user-snippets", "Single empty source with snippets from user", async ({ spec }) => {
    await spec("Cache is not changed", assertCacheIsNotChanged);
    await spec("System assets are copied", assertSystemAssetsAreCopied);
    await spec("Default template assets are copied", assertDefaultTemplateAssetsAreCopied);

    await spec("User snippets are rendered into index.html", async ({ dir }) => {
      const outputHtml = await readFileAsync(`${dir}/public/index.html`, "utf-8");
      assert(outputHtml.includes("<div>after body begin snippet</div>"));
      assert(outputHtml.includes("<div>before body end snippset</div>"));
      assert(outputHtml.includes("<div>before head end snippet</div>"));
    });
  });

  console.log("All tests passed");
} catch (error) {
  console.log(error);
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

async function assertDefaultTemplateAssetsAreNotCopied({ dir }) {
  const files = await readDirAsync(`${dir}/public`);
  assert(!files.includes("index.css"));
  assert(!files.includes("index.js"));
}
