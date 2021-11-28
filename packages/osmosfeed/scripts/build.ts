import { build } from "esbuild";
import path from "path";
import { copyDirRecursive } from "../src/lib/fs-utils";

const isWatchMode = process.argv.includes("--watch");

main();

async function main() {
  await Promise.all([buildCli(), buildClient(), copyAssets()]);
}

async function copyAssets() {
  copyDirRecursive(path.join(__dirname, "../src/assets"), path.join(__dirname, "../dist/client"));
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

async function buildClient() {
  build({
    entryPoints: [require.resolve("@osmoscraft/osmosfeed-web-reader/src/client/index.ts")],
    sourcemap: true,
    bundle: true,
    format: "esm",
    outdir: "dist/client",
  }).catch(() => process.exit(1));
}
