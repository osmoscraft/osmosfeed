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
    const jsonFeed = await parseRss2();
    await expect(jsonFeed.version).toEqual("https://jsonfeed.org/version/1.1");
  });

  spec("RSS 2.0/Parse channel title", async () => {
    const jsonFeed = await parseRss2();
    await expect(jsonFeed.title).toEqual("Scripting News");
  });

  spec("RSS 2.0/Parse home page url", async () => {
    const jsonFeed = await parseRss2();
    await expect(jsonFeed.home_page_url).toEqual("http://www.scripting.com/");
  });
});

async function parseRss2(): Promise<JsonFeed> {
  const feedContent = await readTextAsync("assets/rss-v2-sample.xml");

  const jsonFeed = httpResponseToJsonFeed({
    contentType: "application/xml",
    raw: feedContent,
  });

  return jsonFeed;
}
