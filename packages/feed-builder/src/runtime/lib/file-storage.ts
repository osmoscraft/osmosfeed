import fs from "fs/promises";
import path from "path";

export async function getTextFile(pluginName: string, filename: string): Promise<string> {
  const relativeDir = `data/plugins/${pluginName}`;
  const content = await fs.readFile(path.join(relativeDir, filename), "utf8");
  return content;
}

export async function setFile(pluginName: string, filename: string, fileContent: Buffer | string) {
  const relativeDir = `data/plugins/${pluginName}`;
  await ensureDir(relativeDir);
  await fs.writeFile(path.join(relativeDir, filename), fileContent);
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}
