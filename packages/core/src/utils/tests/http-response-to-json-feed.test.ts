import { expect } from "../../test-helper/assertion.js";
import { readTextAsync } from "../../test-helper/file-system.js";
import { describe } from "../../test-helper/scheduler.js";
import { httpResponseToJsonFeed, JsonFeed } from "../http-response-to-json-feed.js";
import path from "path";

describe("XML to JSON feed", async ({ spec }) => {
  spec("Reject incorrect content type", async () => {
    await expect(() => {
      httpResponseToJsonFeed({
        contentType: "text/plain",
        raw: "Hello world",
      });
    }).toThrow();
  });

  spec("RSS 2.0/JSON feed version", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample.xml");
    await expect(jsonFeed.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  spec("RSS 2.0/Parse channel title", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample.xml");
    await expect(jsonFeed.title).toEqual("Mock channel title");
  });

  spec("RSS 2.0/Parse home page url", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample.xml");
    await expect(jsonFeed.home_page_url).toEqual("http://mock-domain.com");
  });

  spec("RSS 2.0/Parse empty items", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample.xml");
    await expect(jsonFeed.items.length).toEqual(0);
  });

  spec("RSS 2.0/Parse 1 item", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample-1.xml");
    await expect(jsonFeed.items.length).toEqual(1);
  });

  spec("RSS 2.0/Parse multiple items", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample-2.xml");
    await expect(jsonFeed.items.length > 1).toEqual(true);
  });

  spec("RSS 2.0/Parse item title", async () => {
    const jsonFeed = await parseRss2("rss-v2-sample-1.xml");
    await expect(jsonFeed.items[0].title).toEqual("Mock item title 1");
  });
});

async function parseRss2(sampleFilename: string): Promise<JsonFeed> {
  const feedContent = await readTextAsync(`assets/${sampleFilename}`);

  const jsonFeed = httpResponseToJsonFeed({
    contentType: "application/xml",
    raw: feedContent,
  });

  return jsonFeed;
}
