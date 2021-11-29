import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { atomParser, parseFeed, rssParser } from "../lib";

const pkg = require("../../package.json");

describe("Parse channel", () => {
  it("Throws for Non-feed XML", async () => {
    await expect(() => myParseFeed(`<?xml version="1.0"?>`)).toThrow();
  });

  it("Missings fields/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel></channel>
      </rss>
    `);

    await expect(result.title).toEqual("");
    await expect(result.items).toEqual([]);
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["_ext", "items", "title", "version"]);
  });

  it("Missing fields/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel></channel>
      </rdf:RDF>
    `);

    await expect(result.title).toEqual("");
    await expect(result.items).toEqual([]);
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["_ext", "items", "title", "version"]);
  });

  it("Missing fields/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom"></feed>
    `);

    await expect(result.title).toEqual("");
    await expect(result.items).toEqual([]);
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["_ext", "items", "title", "version"]);
  });

  it("Parser version/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel></channel>
      </rss>
    `);

    await expect(result._ext.generator_version).toEqual(pkg.version);
    await expect(result._ext.generator_version.includes(".")).toEqual(true);
  });

  it("Parser version/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel></channel>
      </rdf:RDF>
    `);

    await expect(result._ext.generator_version).toEqual(pkg.version);
    await expect(result._ext.generator_version.includes(".")).toEqual(true);
  });

  it("Parser version/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom"></feed>
    `);

    await expect(result._ext.generator_version).toEqual(pkg.version);
    await expect(result._ext.generator_version.includes(".")).toEqual(true);
  });

  it("JSON Feed version/RSS", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <title></title>
        </channel>
      </rss>
    `);

    await expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("JSON Feed version/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
          <title></title>
        </channel>
      </rdf:RDF>
    `);

    await expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("JSON Feed version/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title></title>
      </feed>
    `);

    await expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("Title/RSS", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <title>Mock channel title</title>
        </channel>
      </rss>
    `);

    await expect(result.title).toEqual("Mock channel title");
  });

  it("Title/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Mock channel title</title>
      </feed>
    `);

    await expect(result.title).toEqual("Mock channel title");
  });

  it("Summary/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <description>Mock channel description</description>
        </channel>
      </rss>
    `);

    await expect(result.description).toEqual("Mock channel description");
  });

  it("Summary/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <subtitle>Mock channel description</subtitle>
      </feed>
    `);

    await expect(result.description).toEqual("Mock channel description");
  });

  it("Home page url/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <link>http://mock-domain.com</link>
        </channel>
      </rss>
    `);

    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Home page url/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <link href="http://mock-domain.com"/>
      </feed>
    `);

    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Home page url with self/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <link rel="self" href="http://mock-domain.com/feed.xml"/>
        <link rel="alternate" href="http://mock-domain.com"/>
      </feed>
    `);

    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Channel icon/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <image>
            <url>http://mock-domain.com/channel-image.png</url>
            <title>Mock channel image title</title>
            <link>http://mock-domain.com</link>
          </image>
        </channel>
      </rss>
    `);

    await expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });

  it("Channel icon/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel rdf:about="http://mock-domain.com/rss">
          <image rdf:resource="http://mock-domain.com/channel-image.png" />
        </channel>
        <image rdf:about="https://mock-domain.com/channel.image.png">
          <url>http://mock-domain.com/channel-image.png</url>
          <title>Mock channel image title</title>
          <link>http://mock-domain.com</link>
        </image>
      </rdf:RDF>
    `);

    await expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });

  it("Channel icon/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <icon>http://mock-domain.com/channel-image.png</icon>
      </feed>
    `);

    await expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });

  it("Channel timestamps/No date/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
        </channel>
      </rss>
    `);

    await expect(result._ext.date_published).toEqual(undefined);
    await expect(result._ext.date_modified).toEqual(undefined);
  });

  it("Channel timestamps/Publish only/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <pubDate>Sat, 01 Jan 2000 00:00:00 GMT</pubDate>
        </channel>
      </rss>
    `);

    await expect(result._ext.date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result._ext.date_modified).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Channel timestamps/Update only/RSS", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <lastBuildDate>Tue, 12 Dec 2000 12:12:12 GMT</lastBuildDate>
        </channel>
      </rss>
    `);

    await expect(result._ext.date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result._ext.date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("Channel timestamps/Publish and update/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <pubDate>Sat, 01 Jan 2000 00:00:00 GMT</pubDate>
          <lastBuildDate>Tue, 12 Dec 2000 12:12:12 GMT</lastBuildDate>
        </channel>
      </rss>
    `);

    await expect(result._ext.date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result._ext.date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("Channel timestamps/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <channel rdf:about="http://mock-domain.com/rss">
          <dc:date>2000-12-12T12:12:12Z</dc:date>
        </channel>
      </rdf:RDF>
    `);

    await expect(result._ext.date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result._ext.date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("Channel timestamps/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <updated>2000-12-12T12:12:12Z</updated>
      </feed>
    `);

    await expect(result._ext.date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result._ext.date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });
});

function myParseFeed(input: string) {
  return parseFeed({
    xml: input,
    parsers: [rssParser, atomParser],
  });
}
