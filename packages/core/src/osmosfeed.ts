import { httpGet } from "./utils/http-get.js";
import { parseFeed } from "./utils/parse-feed.js";

export async function osmosfeed(sources: string[]) {
  const jsonFeedsAsync = sources.map(async (source) => {
    const response = await httpGet(source);
    const raw = response.raw;
    const jsonFeed = parseFeed(raw);
    return jsonFeed;
  });

  const jsonFeeds = await Promise.all(jsonFeedsAsync);
  console.dir(jsonFeeds);
}
