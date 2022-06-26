import promises from "fs/promises";
import path from "path";

export const readFileAsync = promises.readFile;
export const readDirAsync = promises.readdir;

export async function runMatrix(filenames: string[], assertion: (filename: string) => Promise<void>) {
  for (let filename of filenames) {
    try {
      await assertion(filename);
    } catch (error) {
      if (error instanceof Error) {
        error.message += `\nError occured in ${filename}`;
      }
      throw error;
    }
  }
}

export async function readFixture(fixtureFilename: string): Promise<string> {
  const fileContent = await readTextAsync(path.join(__dirname, "./fixture", fixtureFilename));
  return fileContent;
}

export async function readJsonAsync(path: string) {
  const data = await readFileAsync(path, "utf-8");
  const object = JSON.parse(data);
  return object;
}

export async function readTextAsync(path: string) {
  return readFileAsync(path, "utf-8");
}
