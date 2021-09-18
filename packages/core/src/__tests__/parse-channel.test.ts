import { describe, expect, it } from "@osmosframe/test-utils";
import { parseFeed } from "../lib/parse/parse-feed";
import { atomParser, rssParser } from "../lib/parse/parsers";

describe("Parse channel", () => {
  it("Throws for non-feed xml", async () => {
    await expect(() =>
      myParseFeed(`
      <?xml version="1.0"?>
    `)
    ).toThrow();
  });

  it("MissingFields/RSS2", async () => {
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
    ).toEqual(["items", "title", "version"]);
  });

  it("MissingFields/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF>
        <channel></channel>
      </rdf:RDF>
    `);

    await expect(result.title).toEqual("");
    await expect(result.items).toEqual([]);
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["items", "title", "version"]);
  });

  it("MissingFields/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed></feed>
    `);

    await expect(result.title).toEqual("");
    await expect(result.items).toEqual([]);
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["items", "title", "version"]);
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
      <rdf:RDF>
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
      <feed>
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
      <feed>
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
      <feed>
        <subtitle>Mock channel description</subtitle>
      </feed>
    `);

    await expect(result.description).toEqual("Mock channel description");
  });

  it("HomePageUrl/RSS2", async () => {
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

  it("HomePageUrl/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed>
        <link href="http://mock-domain.com"/>
      </feed>
    `);

    await expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("ChannelIcon/RSS2", async () => {
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

  it("ChannelIcon/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF>
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

  it("ChannelIcon/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed>
        <icon>http://mock-domain.com/channel-image.png</icon>
      </feed>
    `);

    await expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });

  it("ChannelTimestamps/NoDate/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
        </channel>
      </rss>
    `);

    await expect(result._date_published).toEqual(undefined);
    await expect(result._date_modified).toEqual(undefined);
  });

  it("ChannelTimestamps/PublishOnly/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <pubDate>Sat, 01 Jan 2000 00:00:00 GMT</pubDate>
        </channel>
      </rss>
    `);

    await expect(result._date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result._date_modified).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("ChannelTimestamps/UpdateOnly/RSS", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <lastBuildDate>Tue, 12 Dec 2000 12:12:12 GMT</lastBuildDate>
        </channel>
      </rss>
    `);

    await expect(result._date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result._date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("ChannelTimestamps/PublishAndUpdate/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <pubDate>Sat, 01 Jan 2000 00:00:00 GMT</pubDate>
          <lastBuildDate>Tue, 12 Dec 2000 12:12:12 GMT</lastBuildDate>
        </channel>
      </rss>
    `);

    await expect(result._date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result._date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("ChannelTimestamps/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF>
        <channel rdf:about="http://mock-domain.com/rss">
          <dc:date>2000-12-12T12:12:12Z</dc:date>
        </channel>
      </rdf:RDF>
    `);

    await expect(result._date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result._date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("ChannelTimestamps/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed>
        <updated>2000-12-12T12:12:12Z</updated>
      </feed>
    `);

    await expect(result._date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result._date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });
});

function myParseFeed(input: string) {
  return parseFeed({
    xml: input,
    parsers: [rssParser, atomParser],
  });
}
