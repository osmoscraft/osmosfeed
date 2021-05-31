import promises from "fs/promises";

export const readFileAsync = promises.readFile;
export const readDirAsync = promises.readdir;

export async function readJsonAsync(path) {
  const data = await readFileAsync(path, "utf-8");
  const object = JSON.parse(data);
  return object;
}
