import { build } from "esbuild";
import glob from "tiny-glob";

(async () => {
  const entryPoints = await glob("./src/**/*.ts");

  build({
    platform: "node",
    entryPoints,
    sourcemap: true,
    bundle: false,
    format: "esm",
    target: "node16",
    outdir: "dist",
  }).catch(() => process.exit(1));

})()
