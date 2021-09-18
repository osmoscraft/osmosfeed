import { describe, it, expect } from "@osmosframe/test-utils";
import { parseFeed } from "../lib/parse/parse-feed";
import { atomParser, rssParser } from "../lib/parse/parsers";

describe("Parse items", () => {
  it("Empty", async () => {
    const result = myParseFeed(`
      <channel></channel>
    `);

    await expect(result.items).toEqual([]);
  });

  it("Title/RSS2", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <title>Mock item title 1</title>
        </item>
      </channel>
    `);

    await expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Title/RDF", async () => {
    const result = myParseFeed(`
      <channel>
      </channel>
      <item>
        <title>Mock item title 1</title>
      </item>
    `);

    await expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Title/Atom", async () => {
    const result = myParseFeed(`
      <feed>
        <entry>
          <title>Mock item title 1</title>
        </entry>
      </feed>
    `);

    await expect(result.items[0].title).toEqual("Mock item title 1");
  });

  it("Content/Plaintext", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description>Plaintext description</description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("Plaintext description");
  });

  it("Content/EscapeXmlEntity", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description>&amp;</description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("&");
    await expect(result.items[0].content_html).toEqual("&");
  });

  it("Content/EscapeHtmlEntity", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description>&lt;b&gt;bold&lt;/b&gt;</description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/DoubleEscapedEntities", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description>&amp;lt;b&amp;gt;bold&amp;lt;/b&amp;gt;</description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("<b>bold</b>");
    await expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/CDATANoEscape", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description><![CDATA[<b>bold</b>]]></description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/CDATAEscaped", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description><![CDATA[&lt;b&gt;bold&lt;/b&gt;]]></description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("<b>bold</b>");
    await expect(result.items[0].content_html).toEqual("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("Content/HTML", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description><b>bold</b></description>
        </item>
      </channel>
    `);

    await expect(result.items[0].content_text).toEqual("bold");
    await expect(result.items[0].content_html).toEqual("<b>bold</b>");
  });

  it("Content/Atom/DefaultType", async () => {
    const result = myParseFeed(`
      <feed>
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
      <feed>
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
      <feed>
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
      <feed>
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
      <channel>
        <item>
          <description>summary</description>
        </item>
      </channel>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("summary");
  });

  it("SummaryAndContent/SummaryOnly/Atom", async () => {
    const result = myParseFeed(`
      <feed>
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
      <channel>
        <item>
          <content:encoded>content</content:encoded>
        </item>
      </channel>
    `);

    await expect(result.items[0].summary).toEqual("content");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("SummaryAndContent/ContentOnly/Atom", async () => {
    const result = myParseFeed(`
      <feed>
        <entry>
          <content>content</content>
        </entry>
      </feed>
    `);

    await expect(result.items[0].summary).toEqual("content");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("SummaryAndContent/Both/RSS", async () => {
    const result = myParseFeed(`
      <channel>
        <item>
          <description>summary</description>
          <content:encoded>content</content:encoded>
        </item>
      </channel>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("content");
  });

  it("SummaryAndContent/Both/Atom", async () => {
    const result = myParseFeed(`
      <feed>
        <entry>
          <summary>summary</summary>
          <content>content</content>
        </entry>
      </feed>
    `);

    await expect(result.items[0].summary).toEqual("summary");
    await expect(result.items[0].content_text).toEqual("content");
  });
});

function myParseFeed(input: string) {
  return parseFeed({
    xml: input,
    parsers: [rssParser, atomParser],
  });
}
