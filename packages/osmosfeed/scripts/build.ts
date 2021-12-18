import { build } from "esbuild";
import path from "path";
import { copyDirRecursive } from "../src/lib/fs-utils";

const isWatchMode = process.argv.includes("--watch");

main();

async function main() {
  await Promise.all([buildCli(), buildCorePlugins()]);
}

async function buildCli() {
  build({
    platform: "node",
    entryPoints: ["./src/main.ts"],
    sourcemap: true,
    bundle: true,
    format: "cjs",
    target: "node16",
    outdir: "dist",
    watch: isWatchMode,
  }).catch(() => process.exit(1));
}

async function buildCorePlugins() {
  const assetDir = path.resolve(require.resolve("@osmosfeed/web-reader"), "../assets");
  copyDirRecursive(path.join(assetDir), path.join(__dirname, "../dist/core-plugins/@osmosfeed/web-reader"));
  build({
    entryPoints: [require.resolve("@osmosfeed/web-reader/src/client/index.ts")],
    sourcemap: true,
    bundle: true,
    format: "esm",
    outdir: "dist/core-plugins/@osmosfeed/web-reader",
  }).catch(() => process.exit(1));
}
