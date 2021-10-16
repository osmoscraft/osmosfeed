const path = require("path");
const { build } = require("vite");

const templateNames = ["Asimov", "Plato"];

async function buildTemplates() {
  const buildsAsync = templateNames.map(async (templateName) => {
    await build({
      clearScreen: false,
      build: {
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
      ssr: true,
      target: "node16",
      lib: {
        entry: path.resolve(__dirname, `../src/lib/render.tsx`),
        name: "osmosfeed-gui-lib",
        formats: ["cjs"],
      },
      outDir: path.resolve(__dirname, "../dist/"),
    },
  });
}

buildLib().then(() => buildTemplates());
