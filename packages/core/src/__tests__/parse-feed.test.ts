import { expect } from "../test-helper/assertion.js";
import { describe } from "../test-helper/scheduler.js";
import { JsonFeed } from "../utils/feed-converters.js";
import { parseFeed } from "../utils/parse-feed.js";
import { loadXmlFixture } from "../test-helper/load-fixture.js";

describe("Parse feed", ({ spec }) => {
  spec("Rejects non feed xml", async () => {
    await expect(async () => await parseXmlFixture("non-feed.xml")).toThrow();
  });

  spec("No error thrown on basic setup", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      await parseXmlFixture(filename);
    });
  });

  spec("JSON feed version", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      const jsonFeed = await parseXmlFixture(filename);
      await expect(jsonFeed.version).toEqual("https://jsonfeed.org/version/1.1");
    });
  });

  spec("Parse channel title", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      const jsonFeed = await parseXmlFixture(filename);
      await expect(jsonFeed.title).toEqual("Mock channel title");
    });
  });

  spec("Parse home page url", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      const jsonFeed = await parseXmlFixture(filename);
      await expect(jsonFeed.home_page_url).toEqual("http://mock-domain.com");
    });
  });

  spec("Parse empty items/RSS 2.0", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      const jsonFeed = await parseXmlFixture(filename);
      await expect(jsonFeed.items.length).toEqual(0);
    });
  });

  spec("Parse 1 item/RSS 2.0", async () => {
    await runMatrix(["single-item-atom.xml", "single-item-rss.xml", "single-item-rdf.xml"], async (filename) => {
      const jsonFeed = await parseXmlFixture(filename);
      await expect(jsonFeed.items.length).toEqual(1);
    });
  });

  spec("Parse multiple items/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("multi-item-rss.xml");
    await expect(jsonFeed.items.length > 1).toEqual(true);
  });

  spec("Parse item title/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("single-item-rss.xml");
    await expect(jsonFeed.items[0].title).toEqual("Mock item title 1");
  });

  spec("Parse item url/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("single-item-rss.xml");
    await expect(jsonFeed.items[0].url).toEqual("http://mock-domain.com/item/1");
  });

  spec("Parse item summary of plaintext/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-summary-rss.xml");
    await expect(jsonFeed.items[0].summary).toEqual("Plaintext description");
  });

  spec("Parse item summary of escaped HTML entities/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-summary-rss.xml");
    await expect(jsonFeed.items[1].summary).toEqual("I'm bold");
  });

  spec("Parse item summary of CDATA/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-summary-rss.xml");
    await expect(jsonFeed.items[2].summary).toEqual("I'm bold");
  });

  spec("Parse item summary of double escaped HTML entities/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-summary-rss.xml");
    await expect(jsonFeed.items[3].summary).toEqual("I'm <b>bold</b>");
  });

  spec("Parse item summary of CDATA containing escaped HTML entities/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-summary-rss.xml");
    await expect(jsonFeed.items[4].summary).toEqual("I'm <b>bold</b>");
  });

  spec("Parse item summary of HTML/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-summary-rss.xml");
    await expect(jsonFeed.items[5].summary).toEqual("I'm bold");
  });

  spec("Parse item with description but no content:encoded/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-description-rss.xml");
    await expect(jsonFeed.items[0].summary).toEqual("I'm description");
    await expect(jsonFeed.items[0].content_html).toEqual("I'm <b>description</b>");
    await expect(jsonFeed.items[0].content_text).toEqual("I'm description");
  });

  spec("Parse item with description and content:encoded/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-description-rss.xml");
    await expect(jsonFeed.items[1].summary).toEqual("I'm description");
    await expect(jsonFeed.items[1].content_html).toEqual("I'm <b>encoded content</b>");
    await expect(jsonFeed.items[1].content_text).toEqual("I'm encoded content");
  });

  spec("Parse item with no description but with content:encoded/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-description-rss.xml");
    await expect(jsonFeed.items[2].summary).toEqual("I'm encoded content");
    await expect(jsonFeed.items[2].content_html).toEqual("I'm <b>encoded content</b>");
    await expect(jsonFeed.items[2].content_text).toEqual("I'm encoded content");
  });

  spec("Parse item with neither description nor content:encoded/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-description-rss.xml");
    await expect(jsonFeed.items[3].summary).toEqual("");
    await expect(jsonFeed.items[3].content_html).toEqual("");
    await expect(jsonFeed.items[3].content_text).toEqual("");
  });

  spec("Parse item with CDATA description but no content:encoded/RSS 2.0", async () => {
    const jsonFeed = await parseXmlFixture("item-description-rss.xml");
    await expect(jsonFeed.items[4].summary).toEqual("I'm description");
    await expect(jsonFeed.items[4].content_html).toEqual("I'm <b>description</b>");
    await expect(jsonFeed.items[4].content_text).toEqual("I'm description");
  });
});

async function parseXmlFixture(fixtureFilename: string): Promise<JsonFeed> {
  const feedContent = await loadXmlFixture(fixtureFilename);
  return parseFeed(feedContent);
}

async function runMatrix(filenames: string[], assertion: (filename: string) => Promise<void>) {
  for (let filename of filenames) {
    try {
      await assertion(filename);
    } catch (error) {
      if (error instanceof Error) {
        error.message += `\nError occured in ${filename}`;
      }
      throw error;
    }
  }
}
