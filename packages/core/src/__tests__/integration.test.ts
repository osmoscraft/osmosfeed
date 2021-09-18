import { describe, expect, it } from "@osmosframe/test-utils";
import type { JsonFeed } from "../lib/parse/json-feed";
import { parseFeed } from "../lib/parse/parse-feed";
import { atomParser, rssParser } from "../lib/parse/parsers";
import { loadXmlFixture } from "../__fixtures__/test-helper/load-fixture";

describe("Integration", () => {
  it("Rejects non feed xml", async () => {
    await expect(async () => await parseXmlFixture("non-feed.xml")).toThrow();
  });

  it("No error thrown on basic setup", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      await expect(() => parseXmlFixture(filename)).not.toThrow();
    });
  });

  it("Parse multiple items", async () => {
    await runMatrix(["multi-item-atom.xml", "multi-item-rss.xml", "multi-item-rdf.xml"], async (filename) => {
      const jsonFeed = await parseXmlFixture(filename);
      await expect(jsonFeed.items.length).toEqual(2);
    });
  });
});

async function parseXmlFixture(fixtureFilename: string): Promise<JsonFeed> {
  const feedContent = await loadXmlFixture(fixtureFilename);
  return parseFeed({
    xml: feedContent,
    parsers: [rssParser, atomParser],
  });
}

async function runMatrix(filenames: string[], assertion: (filename: string) => Promise<void>) {
  for (let filename of filenames) {
    try {
      await assertion(filename);
    } catch (error) {
      if (error instanceof Error) {
        error.message += `\nError occured in ${filename}`;
      }
      throw error;
    }
  }
}
