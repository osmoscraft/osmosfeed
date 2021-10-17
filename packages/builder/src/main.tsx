import React from "react";
import ReactDOMServer from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { App } from "./App";
import fs from "fs/promises";
import path from "path";
import { build } from "vite";
import react from "@vitejs/plugin-react";

render();

async function render() {
  await buildClient();

  const sheet = new ServerStyleSheet();
  const mainHtml = ReactDOMServer.renderToStaticMarkup(sheet.collectStyles(<App />));
  const stylesHtml = sheet.getStyleTags();

  const template = await fs.readFile(path.resolve(__dirname, "client/index.html"), "utf8");
  const hydratedIndexHtml = template.replace("<!--SSG_MAIN-->", mainHtml).replace("<!--SSG_STYLES-->", stylesHtml);

  await fs.writeFile(path.resolve(__dirname, "client/index.html"), hydratedIndexHtml);
}

async function buildClient() {
  await build({
    plugins: [react()],
    base: "",
    build: {
      outDir: path.resolve(__dirname, "client"),
      rollupOptions: {
        external: ["fs/promises"],
      },
    },
  });
}
