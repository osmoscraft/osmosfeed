const { build } = require("esbuild");

async function build() {
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

build();
