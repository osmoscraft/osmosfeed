const path = require("path");
const fs = require("fs/promises");
const { build } = require("vite");

const isWatch = process.argv.includes("--watch");

async function main() {
  const templateNames = await getTemplateNames();
  console.log(`[build] found ${templateNames.length} templatings`, templateNames);
  await Promise.all([buildTemplates(templateNames), buildLib()]);
}

async function getTemplateNames() {
  return fs.readdir(path.resolve(__dirname, "../src/templates"));
}

async function buildTemplates(templateNames) {
  const buildsAsync = templateNames.map(async (templateName) => {
    await build({
      clearScreen: false,
      build: {
        watch: isWatch,
        emptyOutDir: !isWatch,
        ssr: true,
        target: "node16",
        lib: {
          entry: path.resolve(__dirname, `../src/templates/${templateName}/index.ts`),
          name: `osmosfeed-template-${templateName.toLowerCase()}`,
          formats: ["cjs"],
        },
        outDir: path.resolve(__dirname, "../dist/templates", templateName),
      },
    });
  });

  return await Promise.all(buildsAsync);
}

async function buildLib() {
  await build({
    clearScreen: false,
    build: {
      watch: isWatch,
      emptyOutDir: !isWatch,
      ssr: true,
      target: "node16",
      lib: {
        entry: path.resolve(__dirname, `../src/lib/render.tsx`),
        name: "osmosfeed-gui-lib",
        formats: ["cjs"],
      },
      outDir: path.resolve(__dirname, "../dist/lib"),
    },
  });
}

main();
