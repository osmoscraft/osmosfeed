import { describe, it, expect } from "@osmosframe/test-utils";
import { parseFeed, atomParser, rssParser } from "../lib/parse/parse-feed";

describe("Parse channel", () => {
  it("JSON Feed version", async () => {
    const result = myParseFeed(`
      <channel>
        <title></title>
      </channel>
    `);

    await expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("Title/RSS", async () => {
    const result = myParseFeed(`
      <channel>
        <title>Mock channel title</title>
      </channel>
    `);

    await expect(result.title).toEqual("Mock channel title");
  });

  it("Title/Atom", async () => {
    const result = myParseFeed(`
      <feed>
        <title>Mock channel title</title>
      </feed>
    `);

    await expect(result.title).toEqual("Mock channel title");
  });

  it("Summary/RSS", async () => {
    const result = myParseFeed(`
      <channel>
        <description>Mock channel description</description>
      </channel>
    `);

    await expect(result.description).toEqual("Mock channel description");
  });

  it("Summary/Atom", async () => {
    const result = myParseFeed(`
      <feed>
        <subtitle>Mock channel description</subtitle>
      </feed>
    `);

    await expect(result.description).toEqual("Mock channel description");
  });

  it("HomePageUrl/RSS", async () => {
    const result = myParseFeed(`
      <channel>
        <link>http://mock-domain.com</link>
      </channel>
    `);

    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("HomePageUrl/Atom", async () => {
    const result = myParseFeed(`
      <feed>
        <link href="http://mock-domain.com"/>
      </feed>
    `);

    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });
});

function myParseFeed(input: string) {
  return parseFeed({
    xml: input,
    parsers: [rssParser, atomParser],
  });
}
