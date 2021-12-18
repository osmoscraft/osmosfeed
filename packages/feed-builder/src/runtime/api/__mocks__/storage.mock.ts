import { IStorageApi, PruneFilesConfig } from "../../../types/plugin";

export class MockStorageApi implements IStorageApi {
  constructor(private override?: Partial<IStorageApi>) {}

  async readPluginDataFile(filename: string) {
    return this.override?.readPluginDataFile ? this.override.readPluginDataFile(filename) : Buffer.from("Hello world");
  }

  async writePluginDataFile(filename: string, content: Buffer | string) {
    return this.override?.writePluginDataFile?.(filename, content);
  }

  async prunePluginDataFiles(config: PruneFilesConfig) {
    return this.override?.prunePluginDataFiles?.(config);
  }

  async writeFile(path: string, content: string | Buffer) {
    return this.override?.writeFile?.(path, content);
  }
}
