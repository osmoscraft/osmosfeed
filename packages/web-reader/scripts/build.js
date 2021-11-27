const { build } = require("esbuild");

async function buildClient() {
  build({
    entryPoints: [require.resolve("./src/client/index.ts")],
    sourcemap: true,
    bundle: true,
    format: "esm",
    outdir: "dist/client",
  }).catch(() => process.exit(1));
}

buildClient();
