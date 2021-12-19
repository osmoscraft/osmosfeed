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
  // TODO load plugins by package name, instead of direct import
  // TODO clean up feed-parser unused utils
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
