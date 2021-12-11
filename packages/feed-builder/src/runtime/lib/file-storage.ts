import fs from "fs/promises";
import path from "path";
import { OnFeedHookData } from "../../types/plugins";

export async function getTextFile(context: OnFeedHookData, filename: string): Promise<string> {
  const relativeDir = `data/plugins/${context.pluginId}`;
  const content = await fs.readFile(path.join(relativeDir, filename), "utf8");
  return content;
}

export async function setFile(context: OnFeedHookData, filename: string, fileContent: Buffer | string) {
  const relativeDir = `data/plugins/${context.pluginId}`;
  await ensureDir(relativeDir);
  await fs.writeFile(path.join(relativeDir, filename), fileContent);
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}
