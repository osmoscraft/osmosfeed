import { build } from "esbuild";

async function buildClient() {
  build({
    entryPoints: ["./src/client/index.ts"],
    sourcemap: true,
    bundle: true,
    format: "esm",
    outdir: "dist/client",
  }).catch(() => process.exit(1));
}

async function buildServer() {
  build({
    platform: "node",
    entryPoints: ["./src/lib.ts"],
    sourcemap: true,
    bundle: true,
    format: "cjs",
    target: "node16",
    outdir: "dist",
  }).catch(() => process.exit(1));
}

buildServer();
buildClient();
