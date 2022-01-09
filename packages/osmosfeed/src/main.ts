import {
  build,
  useFeedDownloader,
  useFeedSkeleton,
  useHtmlPageCrawler,
  useIncrementalFeedStorage,
  useJsonFeedParser,
  useOrderFeedsByPublishTime,
  useSyntheticPublishTime,
  useWebReader,
  useYamlConfig,
} from "@osmosfeed/feed-builder";

async function run() {
  /**
   * TODO clean up feed-parser unused utils
   * TODO commit feed output during github action
   * TODO open full content in side reading pane
   * TODO backfill description from crawler output
   * TODO style home page
   * TODO themable home page
   */
  const { errors } = await build({
    plugins: [
      useYamlConfig(),
      useFeedSkeleton(),
      // useFeedDownloader(),
      // useJsonFeedParser(),
      // useSyntheticPublishTime(),
      // useOrderFeedsByPublishTime(),
      useIncrementalFeedStorage(),
      // useHtmlPageCrawler(),
      useWebReader(),
    ],
  });

  if (errors) console.error(errors);
}

run();
