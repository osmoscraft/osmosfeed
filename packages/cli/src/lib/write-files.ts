import path from "path";
import { PUBLIC_ROOT_DIR } from "./path-constants";
import { FEED_FILENAME, INDEX_FILENAME } from "./render-atom";
import { mkdirAsync, writeFileAsync } from "../utils/fs";

export interface RenderFilesInput {
  html: string;
  atom: string;
}

export async function writeFiles(input: RenderFilesInput) {
  const { html, atom } = input;

  await mkdirAsync(PUBLIC_ROOT_DIR, { recursive: true });

  const indexPath = path.resolve(`${PUBLIC_ROOT_DIR}/${INDEX_FILENAME}`);
  const atomPath = path.resolve(`${PUBLIC_ROOT_DIR}/${FEED_FILENAME}`);

  const renderHtmlAsync = writeFileAsync(indexPath, html).then(() => console.log(`[write-file] Wrote:`, indexPath));
  const renderAtomAsync = writeFileAsync(atomPath, atom).then(() => console.log(`[write-file] Wrote:`, atomPath));

  return Promise.all([renderHtmlAsync, renderAtomAsync]);
}
