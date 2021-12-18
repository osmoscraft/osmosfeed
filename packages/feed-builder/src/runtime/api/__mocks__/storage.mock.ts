import { IStorageApi, PruneFilesConfig } from "../../../types/plugin";

export class MockStorageApi implements IStorageApi {
  constructor(private override?: Partial<IStorageApi>) {}

  async readPluginDataFile(filename: string) {
    return this.override?.readPluginDataFile?.(filename) ?? null;
  }

  async writePluginDataFile(filename: string, content: Buffer | string) {
    return this.override?.writePluginDataFile?.(filename, content);
  }

  async prunePluginDataFiles(config: PruneFilesConfig) {
    return this.override?.prunePluginDataFiles?.(config);
  }

  async readFile(pathToFile: string) {
    return this.override?.readFile?.(pathToFile) ?? null;
  }

  async writeFile(path: string, content: string | Buffer) {
    return this.override?.writeFile?.(path, content);
  }

  async readPluginStaticFile(pathToFile: string): Promise<Buffer | null> {
    return this.override?.readPluginStaticFile?.(pathToFile) ?? null;
  }
}
