import promises from "fs/promises";
import path from "path";


export const readFileAsync = promises.readFile;
export const readDirAsync = promises.readdir;

export async function readJsonAsync(path: string) {
  const data = await readFileAsync(pathFromCwd(path), "utf-8");
  const object = JSON.parse(data);
  return object;
}

export async function readTextAsync(path: string) {
  return readFileAsync(pathFromCwd(path), "utf-8");
}

function pathFromCwd(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}