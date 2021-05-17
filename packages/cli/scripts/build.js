const path = require("path");
const fs = require("fs-extra");

require("esbuild")
  .build({
    platform: "node",
    entryPoints: ["src/main.ts"],
    sourcemap: true,
    bundle: true,
    /** TODO Although demo template and examples are using node 16 in GitHub Action, earlier users are still using 14. Upgrade requires major release */ 
    target: "node14",
    outfile: "bin/main.js",
  })
  .catch(() => process.exit(1));

fs.copySync(path.resolve("src/index-template.html"), path.resolve("bin/index-template.html"));
fs.copySync(path.resolve("src/system-static"), path.resolve("bin/system-static"));
fs.copySync(path.resolve("src/system-templates"), path.resolve("bin/system-templates"));
