import fs from "fs/promises";
import path from "path";
import { build } from "vite";
import { Header } from "./components/header/header.server";

render();

async function render() {
  await buildClient();

  const mainHtml = Header.toString();

  const template = await fs.readFile(path.resolve(__dirname, "client/index.html"), "utf8");
  const hydratedIndexHtml = template.replace("<!--SSG_MAIN-->", mainHtml);

  await fs.writeFile(path.resolve(__dirname, "client/index.html"), hydratedIndexHtml);
}

async function buildClient() {
  await build({
    base: "",
    build: {
      outDir: path.resolve(__dirname, "client"),
      rollupOptions: {
        external: ["fs/promises"],
      },
    },
  });
}
