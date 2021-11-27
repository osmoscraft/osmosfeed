const { build } = require("esbuild");

const isWatchMode = process.argv.includes("--watch");

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

buildCli();

async function buildClient() {
  build({
    entryPoints: [require.resolve("@osmoscraft/osmosfeed-web-reader/src/client/index.ts")],
    sourcemap: true,
    bundle: true,
    format: "esm",
    outdir: "dist/client",
  }).catch(() => process.exit(1));
}

buildClient();
