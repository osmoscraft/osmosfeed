import { expect } from "../test-helper/assertion.js";
import { describe } from "../test-helper/scheduler.js";
import { JsonFeed } from "../utils/feed-converters.js";
import { xmlToJsonFeed } from "../utils/parse-feed.js";
import { loadXmlFixture } from "../__fixtures__/load-fixture.js";

describe("Parse feed", ({ spec }) => {
  spec("Rejects non feed xml", async () => {
    await expect(async () => await parseXmlFixture("non-feed.xml")).toThrow();
  });

  spec("No error thrown on basic setup", async () => {
    await parseXmlFixture("rss-v2-empty.xml");
  });

  spec("RSS 2.0/JSON feed version", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-empty.xml");
    await expect(jsonFeed.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  spec("RSS 2.0/Parse channel title", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-empty.xml");
    await expect(jsonFeed.title).toEqual("Mock channel title");
  });

  spec("RSS 2.0/Parse home page url", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-empty.xml");
    await expect(jsonFeed.home_page_url).toEqual("http://mock-domain.com");
  });

  spec("RSS 2.0/Parse empty items", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-empty.xml");
    await expect(jsonFeed.items.length).toEqual(0);
  });

  spec("RSS 2.0/Parse 1 item", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-single-item.xml");
    await expect(jsonFeed.items.length).toEqual(1);
  });

  spec("RSS 2.0/Parse multiple items", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-multi-item.xml");
    await expect(jsonFeed.items.length > 1).toEqual(true);
  });

  spec("RSS 2.0/Parse item title", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-single-item.xml");
    await expect(jsonFeed.items[0].title).toEqual("Mock item title 1");
  });

  spec("RSS 2.0/Parse item url", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-single-item.xml");
    await expect(jsonFeed.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  spec("RSS 2.0/Parse item summary of plaintext", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary.xml");
    await expect(jsonFeed.items[0].summary).toEqual("Plaintext description");
  });

  spec("RSS 2.0/Parse item summary of escaped HTML entities", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary.xml");
    await expect(jsonFeed.items[1].summary).toEqual("I'm bold");
  });

  spec("RSS 2.0/Parse item summary of CDATA", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary.xml");
    await expect(jsonFeed.items[2].summary).toEqual("I'm bold");
  });

  spec("RSS 2.0/Parse item summary of double escaped HTML entities", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary.xml");
    await expect(jsonFeed.items[3].summary).toEqual("I'm <b>bold</b>");
  });

  spec("RSS 2.0/Parse item summary of CDATA containing escaped HTML entities", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary.xml");
    await expect(jsonFeed.items[4].summary).toEqual("I'm <b>bold</b>");
  });

  spec("RSS 2.0/Parse item summary of HTML", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary.xml");
    await expect(jsonFeed.items[5].summary).toEqual("I'm bold");
  });

  spec("RSS 2.0/Parse item with description but no content:encoded", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary-and-full-text.xml");
    await expect(jsonFeed.items[0].summary).toEqual("I'm description");
    await expect(jsonFeed.items[0].content_html).toEqual("I'm <b>description</b>");
    await expect(jsonFeed.items[0].content_text).toEqual("I'm description");
  });

  spec("RSS 2.0/Parse item with description and content:encoded", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary-and-full-text.xml");
    await expect(jsonFeed.items[1].summary).toEqual("I'm description");
    await expect(jsonFeed.items[1].content_html).toEqual("I'm <b>encoded content</b>");
    await expect(jsonFeed.items[1].content_text).toEqual("I'm encoded content");
  });

  spec("RSS 2.0/Parse item with no description but with content:encoded", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary-and-full-text.xml");
    await expect(jsonFeed.items[2].summary).toEqual("I'm encoded content");
    await expect(jsonFeed.items[2].content_html).toEqual("I'm <b>encoded content</b>");
    await expect(jsonFeed.items[2].content_text).toEqual("I'm encoded content");
  });

  spec("RSS 2.0/Parse item with neither description nor content:encoded", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary-and-full-text.xml");
    await expect(jsonFeed.items[3].summary).toEqual("");
    await expect(jsonFeed.items[3].content_html).toEqual("");
    await expect(jsonFeed.items[3].content_text).toEqual("");
  });

  spec("RSS 2.0/Parse item with CDATA description but no content:encoded", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-item-summary-and-full-text.xml");
    await expect(jsonFeed.items[4].summary).toEqual("I'm description");
    await expect(jsonFeed.items[4].content_html).toEqual("I'm <b>description</b>");
    await expect(jsonFeed.items[4].content_text).toEqual("I'm description");
  });
});
async function parseXmlFixture(fixtureFilename: string): Promise<JsonFeed> {
  const feedContent = await loadXmlFixture(fixtureFilename);
  return xmlToJsonFeed(feedContent);
}
