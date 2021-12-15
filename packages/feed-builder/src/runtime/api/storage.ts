import fs from "fs/promises";
import path from "path";
import { IStorageApi, PruneFilesConfig } from "../../types/plugin";

export interface FileStorageContext {
  pluginId: string;
}

export class StorageApi implements IStorageApi {
  constructor(private context: FileStorageContext) {}

  async getTextFile(filename: string): Promise<string | null> {
    const relativeDir = `data/plugins/${this.context.pluginId}`;
    const pathToFile = path.join(relativeDir, filename);
    if (!(await this.exists(pathToFile))) {
      return null;
    }
    const content = await fs.readFile(pathToFile, "utf8");
    return content;
  }

  async setFile(filename: string, fileContent: Buffer | string) {
    const relativeDir = `data/plugins/${this.context.pluginId}`;
    await this.ensureDir(relativeDir);
    await fs.writeFile(path.join(relativeDir, filename), fileContent);
  }

  async pruneFiles(config: PruneFilesConfig): Promise<void> {
    const relativeDir = `data/plugins/${this.context.pluginId}`;
    if (!this.exists(relativeDir)) return;

    const allFiles = await fs.readdir(relativeDir);
    const filesToRemove = allFiles.filter((file) => !config.keep.includes(file));
    await Promise.allSettled(filesToRemove.map((fileToRemove) => fs.rm(path.join(relativeDir, fileToRemove))));
  }

  private async ensureDir(path: string) {
    await fs.mkdir(path, { recursive: true });
  }

  private async exists(path: string) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
