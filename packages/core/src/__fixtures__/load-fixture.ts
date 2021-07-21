import { readTextAsync } from "./file-system.js";

export async function loadFixtureXml(sampleFilename: string): Promise<string> {
  return readTextAsync(`src/__fixtures__/${sampleFilename}`);
}
