import path from "path";
import fs from "fs-extra";
import { FEED_FILENAME, INDEX_FILENAME } from "./render-atom";

export interface RenderFilesInput {
  html: string;
  atom: string;
}

export async function renderFiles(input: RenderFilesInput) {
  const { html, atom } = input;

  await fs.ensureDir(path.resolve("public")).then(() => {
    const indexPath = path.resolve(`public/${INDEX_FILENAME}`);
    const atomPath = path.resolve(`public/${FEED_FILENAME}`);

    const renderHtmlAsync = fs.writeFile(indexPath, html).then(() => console.log(`[render] Rendered: ${indexPath}`));
    const renderAtomAsync = fs.writeFile(atomPath, atom).then(() => console.log(`[render] Rendered: ${atomPath}`));

    return Promise.all([renderHtmlAsync, renderAtomAsync]);
  });
}
