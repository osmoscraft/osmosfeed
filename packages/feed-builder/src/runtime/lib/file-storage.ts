import fs from "fs/promises";
import path from "path";

export interface FileStorageContext {
  pluginId: string;
}

export async function getTextFile(context: FileStorageContext, filename: string): Promise<string | null> {
  const relativeDir = `data/plugins/${context.pluginId}`;
  const fullPath = path.join(relativeDir, filename);
  if (!(await exists(fullPath))) {
    return null;
  }
  const content = await fs.readFile(fullPath, "utf8");
  return content;
}

export async function setFile(context: FileStorageContext, filename: string, fileContent: Buffer | string) {
  const relativeDir = `data/plugins/${context.pluginId}`;
  await ensureDir(relativeDir);
  await fs.writeFile(path.join(relativeDir, filename), fileContent);
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

async function exists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
