import { readTextAsync } from "./file-system";

export async function loadXmlFixture(sampleFilename: string): Promise<string> {
  return readTextAsync(`src/__fixtures__/feed-content/${sampleFilename}`);
}
