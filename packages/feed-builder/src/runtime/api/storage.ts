import fs from "fs/promises";
import path from "path";
import { IStorageApi, PruneFilesConfig } from "../../types/plugin";

export interface FileStorageContext {
  pluginPackageName: string;
}

export const CORE_PLUGINS_DIRNAME = "plugins";

export class StorageApi implements IStorageApi {
  constructor(private context: FileStorageContext) {}

  async readPluginDataFile(filename: string): Promise<Buffer | null> {
    const relativeDir = `data/plugins/${this.context.pluginPackageName}`;
    const pathToFile = path.join(relativeDir, filename);
    if (!(await this.exists(pathToFile))) {
      return null;
    }
    const content = await fs.readFile(pathToFile);
    return content;
  }

  async writePluginDataFile(filename: string, content: Buffer | string) {
    const relativeDir = `data/plugins/${this.context.pluginPackageName}`;
    await this.ensureDir(relativeDir);
    await fs.writeFile(path.join(relativeDir, filename), content);
  }

  async prunePluginDataFiles(config: PruneFilesConfig): Promise<void> {
    const relativeDir = `data/plugins/${this.context.pluginPackageName}`;
    if (!this.exists(relativeDir)) return;

    const allFiles = await fs.readdir(relativeDir);
    const filesToRemove = allFiles.filter((file) => !config.keep.includes(file));
    await Promise.allSettled(filesToRemove.map((fileToRemove) => fs.rm(path.join(relativeDir, fileToRemove))));
  }

  /**
   * @param pathToFile path relative to the root of the project
   */
  async readFile(pathToFile: string): Promise<Buffer | null> {
    if (!this.exists(pathToFile)) return null;

    return fs.readFile(pathToFile);
  }

  /**
   * @param pathToFile path relative to the root of the project
   */
  async writeFile(pathToFile: string, content: Buffer | string): Promise<void> {
    await this.ensureDir(path.dirname(pathToFile));
    await fs.writeFile(pathToFile, content);
  }

  async readPluginStaticFile(pathToFile: string): Promise<Buffer | null> {
    // TODO Avoid branching logic. Refactor core plugin into userland plugin
    const corePluginStaticFilePath = path.resolve(
      __dirname,
      CORE_PLUGINS_DIRNAME,
      this.context.pluginPackageName,
      pathToFile
    );
    const isCorePlugin = await this.exists(path.dirname(corePluginStaticFilePath));
    if (isCorePlugin) {
      if (await this.exists(corePluginStaticFilePath)) {
        return fs.readFile(corePluginStaticFilePath);
      } else {
        return null;
      }
    }

    // TODO support static files for userland plugins
    return null;
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
