import {
  build,
  useFeedDownloader,
  useHtmlPageCrawler,
  useIncrementalFeedStorage,
  useJsonFeedParser,
  useWebReader,
  useYamlConfig,
} from "@osmosfeed/feed-builder";

async function run() {
  const { errors } = await build({
    plugins: [
      useYamlConfig(),
      useFeedDownloader(),
      useJsonFeedParser(),
      useIncrementalFeedStorage(),
      useHtmlPageCrawler(),
      useWebReader(),
    ],
  });

  if (errors) console.error(errors);
}

run();
