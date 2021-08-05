import { readTextAsync } from "./file-system.js";

export async function loadXmlFixture(sampleFilename: string): Promise<string> {
  return readTextAsync(`src/__fixtures__/feed-content/${sampleFilename}`);
}
