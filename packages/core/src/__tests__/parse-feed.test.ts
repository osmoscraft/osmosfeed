import { expect } from "../test-helper/assertion.js";
import { describe } from "../test-helper/scheduler.js";
import { JsonFeed } from "../utils/json-feed-converters.js";
import { xmlToJsonFeed } from "../utils/parse-feed.js";
import { loadXmlFixture } from "../__fixtures__/load-fixture.js";

describe("Parse feed", ({ spec }) => {
  spec("Rejects non feed xml", async () => {
    await expect(async () => await parseXmlFixture("non-feed.xml")).toThrow();
  });

  spec("No error thrown on basic setup", async () => {
    await parseXmlFixture("rss-v2-sample-empty.xml");
  });

  spec("RSS 2.0/JSON feed version", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-empty.xml");
    await expect(jsonFeed.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  spec("RSS 2.0/Parse channel title", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-empty.xml");
    await expect(jsonFeed.title).toEqual("Mock channel title");
  });

  spec("RSS 2.0/Parse home page url", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-empty.xml");
    await expect(jsonFeed.home_page_url).toEqual("http://mock-domain.com");
  });

  spec("RSS 2.0/Parse empty items", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-empty.xml");
    await expect(jsonFeed.items.length).toEqual(0);
  });

  spec("RSS 2.0/Parse 1 item", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-single-item.xml");
    await expect(jsonFeed.items.length).toEqual(1);
  });

  spec("RSS 2.0/Parse multiple items", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-multi-item.xml");
    await expect(jsonFeed.items.length > 1).toEqual(true);
  });

  spec("RSS 2.0/Parse item title", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-single-item.xml");
    await expect(jsonFeed.items[0].title).toEqual("Mock item title 1");
  });

  spec("RSS 2.0/Parse item url", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-single-item.xml");
    await expect(jsonFeed.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  spec("RSS 2.0/Parse item summary in plaintext", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-varied-items.xml");
    await expect(jsonFeed.items[0].summary).toEqual("Plaintext description");
  });

  spec("RSS 2.0/Parse item summary with escaped HTML entities", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-varied-items.xml");
    await expect(jsonFeed.items[1].summary).toEqual("I'm bold");
  });

  spec("RSS 2.0/Parse item summary with CDATA", async () => {
    const jsonFeed = await parseXmlFixture("rss-v2-sample-varied-items.xml");
    await expect(jsonFeed.items[2].summary).toEqual("I'm bold");
  });

  // TODO add 2 more scenarios https://cyber.harvard.edu/rss/encodingDescriptions.html
  // TODO test raw HTML inside xml
});
async function parseXmlFixture(fixtureFilename: string): Promise<JsonFeed> {
  const feedContent = await loadXmlFixture(fixtureFilename);
  return xmlToJsonFeed(feedContent);
}
