import { describe } from "../test-helper/scheduler.js";
import { xmlToJsonFeed } from "../utils/parse-feed.js";
import { loadFixtureXml } from "../__fixtures__/load-fixture.js";

describe("Parse feed", ({ spec }) => {
  spec("Basic", async () => {
    const feedContent = await loadFixtureXml("rss-v2-sample-empty.xml");
    xmlToJsonFeed(feedContent);
  });
});
