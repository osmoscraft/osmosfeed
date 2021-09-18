import { describe, it, expect } from "@osmosframe/test-utils";
import { parseFeed } from "../lib/parse/parse-feed";

describe("Parse feed", () => {
  it("Throws when channel does not exist", async () => {
    await expect(() => parseFeed("")).toThrow();
  });

  it("Channel/JSON Feed version", async () => {
    const result = parseFeed(`
  <channel>
    <title></title>
  </channel>
    `);
    await expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("Channel/Title/RSS", async () => {
    const result = parseFeed(`
  <channel>
    <title>Mock channel title</title>
  </channel>
    `);
    await expect(result.title).toEqual("Mock channel title");
  });

  it("Channel/Title/Atom", async () => {
    const result = parseFeed(`
  <feed>
    <title>Mock channel title</title>
  </feed>
    `);
    await expect(result.title).toEqual("Mock channel title");
  });

  it("Channel/HomePageUrl/RSS", async () => {
    const result = parseFeed(`
  <channel>
    <link>http://mock-domain.com</link>
  </channel>
    `);
    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Channel/HomePageUrl/Atom", async () => {
    const result = parseFeed(`
  <feed>
    <link href="http://mock-domain.com"/>
  </feed>
    `);
    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });
});
