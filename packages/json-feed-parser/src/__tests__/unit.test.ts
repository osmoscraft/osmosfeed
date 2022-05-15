import { describe, expect, it } from "vitest";
import { parse } from "../lib";

describe("Parse doc", () => {
  it("Compiles", () => {
    expect(typeof parse).toBe("function");
  });

  it("Rejects non-xml", () => {
    expect(parse("This is not a XML string")).rejects.toThrow();
  });

  it("Rejects non-feed xml", () => {
    expect(parse(`<?xml version="1.0" encoding="UTF-8"?>`)).rejects.toThrow();
  });
});

describe("Parse channel", () => {
  it("Missings fields/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel></channel>
      </rss>
    `);

    expect(result.title).toEqual("");
    expect(result.items).toEqual([]);
    expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["items", "title", "version"]);
  });

  it("Missing fields/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel></channel>
      </rdf:RDF>
    `);

    expect(result.title).toEqual("");
    expect(result.items).toEqual([]);
    expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["items", "title", "version"]);
  });

  it("Missing fields/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom"></feed>
    `);

    expect(result.title).toEqual("");
    expect(result.items).toEqual([]);
    expect(
      Object.keys(Object.fromEntries(Object.entries(result).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["items", "title", "version"]);
  });

  it("JSON Feed version/RSS", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <title></title>
        </channel>
      </rss>
    `);

    expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("JSON Feed version/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
          <title></title>
        </channel>
      </rdf:RDF>
    `);

    expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("JSON Feed version/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title></title>
      </feed>
    `);

    expect(result.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  it("Title/RSS", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <title>Mock channel title</title>
        </channel>
      </rss>
    `);

    expect(result.title).toEqual("Mock channel title");
  });

  it("Title/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Mock channel title</title>
      </feed>
    `);

    expect(result.title).toEqual("Mock channel title");
  });

  it("Summary/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <description>Mock channel description</description>
        </channel>
      </rss>
    `);

    expect(result.description).toEqual("Mock channel description");
  });

  it("Summary/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <subtitle>Mock channel description</subtitle>
      </feed>
    `);

    expect(result.description).toEqual("Mock channel description");
  });

  it("Home page url/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <link>http://mock-domain.com</link>
        </channel>
      </rss>
    `);

    expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Home page url/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <link href="http://mock-domain.com"/>
      </feed>
    `);

    expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Home page url with self/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <link rel="self" href="http://mock-domain.com/feed.xml"/>
        <link rel="alternate" href="http://mock-domain.com"/>
      </feed>
    `);

    expect(result.home_page_url).toEqual("http://mock-domain.com");
  });

  it("Channel icon/RSS2", async () => {
    const result = await parse(`
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

    expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });

  it("Channel icon/RDF", async () => {
    const result = await parse(`
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

    expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });

  it("Channel icon/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <icon>http://mock-domain.com/channel-image.png</icon>
      </feed>
    `);

    expect(result.icon).toEqual("http://mock-domain.com/channel-image.png");
  });
});

describe("Parse items", () => {
  it("Missing fields/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item></item>
        </channel>
      </rss>
    `);

    expect(result.items[0].id).toEqual("");
    expect(result.items[0].content_text).toEqual("");
    expect(result.items[0].content_html).toEqual("");
    expect(
      Object.keys(Object.fromEntries(Object.entries(result.items[0]).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["content_html", "content_text", "id"]);
  });

  it("Missing fields/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel></channel>
        <item></item>
      </rdf:RDF>
    `);

    expect(result.items[0].id).toEqual("");
    expect(result.items[0].content_text).toEqual("");
    expect(result.items[0].content_html).toEqual("");
    expect(
      Object.keys(Object.fromEntries(Object.entries(result.items[0]).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["content_html", "content_text", "id"]);
  });

  it("Missing fields/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry></entry>
      </feed>
    `);

    expect(result.items[0].id).toEqual("");
    expect(result.items[0].content_text).toEqual("");
    expect(result.items[0].content_html).toEqual("");
    expect(
      Object.keys(Object.fromEntries(Object.entries(result.items[0]).filter((entry) => entry[1] !== undefined))).sort()
    ).toEqual(["content_html", "content_text", "id"]);
  });

  it("Id/Link only/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <link>http://mock-domain.com/item/1</link>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].id).toEqual("http://mock-domain.com/item/1");
  });

  it("Id/Guid only/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <guid>1234-abcd</guid>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Id/Guid and link/RSS2", async () => {
    const result = await parse(`
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

    expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Id/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <link>http://mock-domain.com/item/1</link>
        </item>
      </rdf:RDF>
    `);

    expect(result.items[0].id).toEqual("http://mock-domain.com/item/1");
  });

  it("Id/Id only/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>1234-abcd</id>
        </entry>
      </rss>
    `);

    expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Id/Link only/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link href="http://mock-domain.com/item/1"/>
        </entry>
      </rss>
    `);

    expect(result.items[0].id).toEqual("http://mock-domain.com/item/1");
  });

  it("Id/Id and link/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>1234-abcd</id>
          <link href="http://mock-domain.com/item/1"/>
        </entry>
      </rss>
    `);

    expect(result.items[0].id).toEqual("1234-abcd");
  });

  it("Url/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <link>http://mock-domain.com/item/1</link>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <link>http://mock-domain.com/item/1</link>
        </item>
      </rdf:RDF>
    `);

    expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link href="http://mock-domain.com/item/1"/>
        </entry>
      </rss>
    `);

    expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url trimming/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <link> \t\nhttp://mock-domain.com/item/1 \n\t </link>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url trimming/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <link> \t\n http://mock-domain.com/item/1 \n\t </link>
        </item>
      </rdf:RDF>
    `);

    expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Url trimming/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom ">
        <entry>
          <link href=" \t\n http://mock-domain.com/item/1 \n\t "/>
        </entry>
      </rss>
    `);

    expect(result.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  it("Title/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title>Mock item title 1</title>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Title/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <channel>
        </channel>
        <item>
          <title>Mock item title 1</title>
        </item>
      </rdf:RDF>
    `);

    expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Title/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Mock item title 1</title>
        </entry>
      </feed>
    `);

    expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Content/Plaintext", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>Plaintext description</description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("Plaintext description");
    expect(result.items[0].content_html).toEqual("Plaintext description");
  });

  it("Content/Space trimming", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description> \r\n\t Plaintext description \r\n\t </description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("Plaintext description");
    expect(result.items[0].content_html).toEqual("Plaintext description");
  });

  it("Content/Ampersand", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&amp;</description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("&");
    expect(result.items[0].content_html).toEqual("&");
  });

  it("Content/Angle bracket", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&amp;lt;</description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("<");
    expect(result.items[0].content_html).toEqual("&lt;");
  });

  it("Content/HTML tags", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&lt;b&gt;bold&lt;/b&gt;</description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("bold");
    expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/Double-escaped entities", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>&amp;lt;b&amp;gt;bold&amp;lt;/b&amp;gt;</description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("<b>bold</b>");
    expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/CDATA without escape", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description><![CDATA[<b>bold</b>]]></description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("bold");
    expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/CDATA with escape", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description><![CDATA[&lt;b&gt;bold&lt;/b&gt;]]></description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("<b>bold</b>");
    expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/HTML", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description><b>bold</b></description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].content_text).toEqual("bold");
    expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/Atom/Default type", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary>&lt;b&gt;bold&lt;/b&gt;</summary>
        </entry>
      </feed>
    `);

    expect(result.items[0].content_text).toEqual("<b>bold</b>");
    expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/Atom/text type", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary type="text">&lt;b&gt;bold&lt;/b&gt;</summary>
        </entry>
      </feed>
    `);

    expect(result.items[0].content_text).toEqual("<b>bold</b>");
    expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/Atom/html type", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary type="html">&lt;b&gt;bold&lt;/b&gt;</summary>
        </entry>
      </feed>
    `);

    expect(result.items[0].content_text).toEqual("bold");
    expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/Atom/xhtml type", async () => {
    const result = await parse(`
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

    expect(result.items[0].content_text).toEqual("AT&T bought by SBC");
    expect(result.items[0].content_html).toEqual("AT&T bought <b>by SBC</b>");
  });

  it("Summary and content/Summary only/RSS", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <description>summary</description>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].summary).toEqual("summary");
    expect(result.items[0].content_text).toEqual("summary");
  });

  it("Summary and content/Summary only/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary>summary</summary>
        </entry>
      </feed>
    `);

    expect(result.items[0].summary).toEqual("summary");
    expect(result.items[0].content_text).toEqual("summary");
  });

  it("Summary and content/Content only/RSS", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <content:encoded>content</content:encoded>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].summary).toEqual("content");
    expect(result.items[0].content_text).toEqual("content");
  });

  it("Summary and content/Content only/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <content>content</content>
        </entry>
      </feed>
    `);

    expect(result.items[0].summary).toEqual("content");
    expect(result.items[0].content_text).toEqual("content");
  });

  it("Summary and content/Both/RSS2", async () => {
    const result = await parse(`
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

    expect(result.items[0].summary).toEqual("summary");
    expect(result.items[0].content_text).toEqual("content");
  });

  it("Summary and content/Both/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <summary>summary</summary>
          <content>content</content>
        </entry>
      </feed>
    `);

    expect(result.items[0].summary).toEqual("summary");
    expect(result.items[0].content_text).toEqual("content");
  });

  it("Image/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <enclosure url="http://mock-domain.com/item-image-1.png" length="1000" type="image/png" />
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].image).toEqual("http://mock-domain.com/item-image-1.png");
  });

  it("Image/RDF", async () => {
    const result = await parse(`
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

    expect(result.items[0].image).toEqual("http://mock-domain.com/item-image-1.png");
  });

  it("Image/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <link rel="enclosure" type="image/png" href="http://mock-domain.com/item-image-1.png" />
        </entry>
      </feed>
    `);

    expect(result.items[0].image).toEqual("http://mock-domain.com/item-image-1.png");
  });

  it("Timestamps/RSS2", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <pubDate>Sat, 01 Jan 2000 00:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Timestamps/RDF", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <dc:date>2000-01-01T00:00:00Z</dc:date>
          </item>
        </channel>
      </rss>
    `);

    expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Timestamps/Publish only/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <published>2000-01-01T00:00:00Z</published>
        </entry>
      </feed>
    `);

    expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
  });

  it("Timestamps/Update only/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <updated>2000-12-12T12:12:12Z</updated>
        </entry>
      </feed>
    `);

    expect(result.items[0].date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });

  it("Timestamps/Publish and update/Atom", async () => {
    const result = await parse(`
      <?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <published>2000-01-01T00:00:00Z</published>
          <updated>2000-12-12T12:12:12Z</updated>
        </entry>
      </feed>
    `);

    expect(result.items[0].date_published).toEqual("2000-01-01T00:00:00.000Z");
    expect(result.items[0].date_modified).toEqual("2000-12-12T12:12:12.000Z");
  });
});
