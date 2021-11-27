const { build } = require("esbuild");

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

async function buildServer() {
  build({
    platform: "node",
    entryPoints: ["./src/main.ts"],
    sourcemap: true,
    bundle: true,
    format: "cjs",
    target: "node16",
    outdir: "dist",
  }).catch(() => process.exit(1));
}

buildServer();
