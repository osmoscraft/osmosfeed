import { loadProject } from "./lib/load-project";
import { request } from "./lib/request";

async function run() {
  const cwd = process.cwd();
  const project = await loadProject(cwd);

  const feedUrls = project.config.content.channels.map((channel) => channel.url);

  console.log(feedUrls);

  const rawFeeds = await Promise.all(
    feedUrls.map(async (feedUrl) => {
      const { raw } = await request(feedUrl);
      return {
        feedUrl,
        textResponse: raw, // TODO error status handling
      };
    })
  );

  console.log(rawFeeds);
}

run();
