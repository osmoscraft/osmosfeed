import { IStorageApi, PruneFilesConfig } from "../../../types/plugin";

export class MockStorageApi implements IStorageApi {
  constructor(private override?: Partial<IStorageApi>) {}

  async getTextFile(filename: string) {
    return this.override?.getTextFile ? this.override.getTextFile(filename) : "Hello world";
  }

  async setFile(filename: string, content: Buffer | string) {
    return this.override?.setFile?.(filename, content);
  }

  async pruneFiles(config: PruneFilesConfig) {
    return this.override?.pruneFiles?.(config);
  }
}
