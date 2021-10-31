import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { atomParser, parseFeed, rssParser } from "../lib";

describe("Parse items", () => {
  it("Missing fields/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item></item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("");
    await expect(result.items[0].content_text).toEqual("");
    await expect(result.items[0].content_html).toEqual("");
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result.items[0]).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["content_html", "content_text", "id"]);
  });

  it("Missing fields/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel></channel>
        <item></item>
      </rdf:RDF>
    `);

    await expect(result.items[0].id).toEqual("");
    await expect(result.items[0].content_text).toEqual("");
    await expect(result.items[0].content_html).toEqual("");
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result.items[0]).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["content_html", "content_text", "id"]);
  });

  it("Missing fields/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry></entry>
      </feed>
    `);

    await expect(result.items[0].id).toEqual("");
    await expect(result.items[0].content_text).toEqual("");
    await expect(result.items[0].content_html).toEqual("");
    await expect(
      Object.keys(Object.fromEntries(Object.entries(result.items[0]).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["content_html", "content_text", "id"]);
  });

  it("Id/Link only/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <link>http://mock-domain.com/item/1</link>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("http://mock-domain.com/item/1");
  });

  it("Id/Guid only/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <guid>1234-abcd</guid>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Id/Guid and link/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <link>http://mock-domain.com/item/1</link>
            <guid>1234-abcd</guid>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Id/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <link>http://mock-domain.com/item/1</link>
        </item>
      </rdf:RDF>
    `);

    await expect(result.items[0].id).toEqual("http://mock-domain.com/item/1");
  });

  it("Id/Id only/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>1234-abcd</id>
        </entry>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Id/Link only/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link href="http://mock-domain.com/item/1"/>
        </entry>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("http://mock-domain.com/item/1");
  });

  it("Id/Id and link/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>1234-abcd</id>
          <link href="http://mock-domain.com/item/1"/>
        </entry>
      </rss>
    `);

    await expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Url/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <link>http://mock-domain.com/item/1</link>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <link>http://mock-domain.com/item/1</link>
        </item>
      </rdf:RDF>
    `);

    await expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link href="http://mock-domain.com/item/1"/>
        </entry>
      </rss>
    `);

    await expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Title/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title>Mock item title 1</title>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Title/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <title>Mock item title 1</title>
        </item>
      </rdf:RDF>
    `);

    await expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Title/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Mock item title 1</title>
        </entry>
      </feed>
    `);

    await expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Content/Plaintext", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>Plaintext description</description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("Plaintext description");
    await expect(result.items[0].content_html).toEqual("Plaintext description");
  });

  it("Content/SpaceTrimming", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description> \r\n\t Plaintext description \r\n\t </description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("Plaintext description");
    await expect(result.items[0].content_html).toEqual("Plaintext description");
  });

  it("Content/Ampersand", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&amp;</description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("&");
    await expect(result.items[0].content_html).toEqual("&");
  });

  it("Content/AngleBracket", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&amp;lt;</description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("<");
    await expect(result.items[0].content_html).toEqual("&lt;");
  });

  it("Content/HtmlTags", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&lt;b&gt;bold&lt;/b&gt;</description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/DoubleEscapedEntities", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&amp;lt;b&amp;gt;bold&amp;lt;/b&amp;gt;</description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("<b>bold</b>");
    await expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/CDATANoEscape", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description><![CDATA[<b>bold</b>]]></description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/CDATAEscaped", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description><![CDATA[&lt;b&gt;bold&lt;/b&gt;]]></description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("<b>bold</b>");
    await expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/HTML", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description><b>bold</b></description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/Atom/DefaultType", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary>&lt;b&gt;bold&lt;/b&gt;</summary>
        </entry>
      </feed>
    `);

    await expect(result.items[0].content_text).toEqual("<b>bold</b>");
    await expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/Atom/textType", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary type="text">&lt;b&gt;bold&lt;/b&gt;</summary>
        </entry>
      </feed>
    `);

    await expect(result.items[0].content_text).toEqual("<b>bold</b>");
    await expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/Atom/htmlType", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary type="html">&lt;b&gt;bold&lt;/b&gt;</summary>
        </entry>
      </feed>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/Atom/xhtmlType", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary type="xhtml">
            <div xmlns="http://www.w3.org/1999/xhtml">
              AT&amp;T bought <b>by SBC</b>
            </div>
          </summary>
        </entry>
      </feed>
    `);

    await expect(result.items[0].content_text).toEqual("AT&T bought by SBC");
    await expect(result.items[0].content_html).toEqual("AT&T bought <b>by SBC</b>");
  });

  it("SummaryAndContent/SummaryOnly/RSS", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>summary</description>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("summary");
  });

  it("SummaryAndContent/SummaryOnly/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary>summary</summary>
        </entry>
      </feed>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("summary");
  });

  it("SummaryAndContent/ContentOnly/RSS", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <content:encoded>content</content:encoded>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].summary).toEqual("content");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("SummaryAndContent/ContentOnly/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <content>content</content>
        </entry>
      </feed>
    `);

    await expect(result.items[0].summary).toEqual("content");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("SummaryAndContent/Both/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>summary</description>
            <content:encoded>content</content:encoded>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("SummaryAndContent/Both/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary>summary</summary>
          <content>content</content>
        </entry>
      </feed>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("Image/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <enclosure url="http://mock-domain.com/item-image-1.png" length="1000" type="image/png" />
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].image).toEqual("http://mock-domain.com/item-image-1.png");
  });

  it("Image/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rdf:RDF
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        xmlns:enc="http://purl.oclc.org/net/rss_2.0/enc#"
      >
        <channel>
        </channel>
        <item>
          <enc:enclosure rdf:resource="http://mock-domain.com/item-image-1.png" enc:type="image/png" enc:length="1000" />
        </item>
      </rdf:RDF>
    `);

    await expect(result.items[0].image).toEqual("http://mock-domain.com/item-image-1.png");
  });

  it("Image/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link rel="enclosure" type="image/png" href="http://mock-domain.com/item-image-1.png" />
        </entry>
      </feed>
    `);

    await expect(result.items[0].image).toEqual("http://mock-domain.com/item-image-1.png");
  });

  it("Timestamps/RSS2", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <pubDate>Sat, 01 Jan 2000 00:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result.items[0].date_modified).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Timestamps/RDF", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <dc:date>2000-01-01T00:00:00Z</dc:date>
          </item>
        </channel>
      </rss>
    `);

    await expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result.items[0].date_modified).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Timestamps/PublishOnly/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <published>2000-01-01T00:00:00Z</published>
        </entry>
      </feed>
    `);

    await expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result.items[0].date_modified).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Timestamps/UpdateOnly/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <updated>2000-12-12T12:12:12Z</updated>
        </entry>
      </feed>
    `);

    await expect(result.items[0].date_published).toEqual("2000-12-12T12:12:12.000Z");
    await expect(result.items[0].date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("Timestamps/PublishAndUpdate/Atom", async () => {
    const result = myParseFeed(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <published>2000-01-01T00:00:00Z</published>
          <updated>2000-12-12T12:12:12Z</updated>
        </entry>
      </feed>
    `);

    await expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
    await expect(result.items[0].date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });
});

function myParseFeed(input: string) {
  return parseFeed({
    xml: input,
    parsers: [rssParser, atomParser],
  });
}
