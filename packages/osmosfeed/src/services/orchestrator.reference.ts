export class Orchestrator {
  configService: any;
  storageService: any;
  buildService: any;
  networkService: any;
  pageService: any;
  diffService: any;
  feedService: any;

  async run() {
    // data-fetch sources
    const sourceList = await this.configService.getSourceList();

    // pre-process sources => sources with metadata (add | keep | remove)

    // process sources (aka source => feeds)
    const feedsAsync = sourceList.map(async (source: any) => {
      // data-fetch source
      const rawFeed = await this.networkService.download(source);

      // pre-process source (aka source => feed meta + items)
      const parsedFeed = this.feedService.parse(rawFeed);
      const cachedFeed = await this.storageService.getFeed(source);
      const [newItems, existingItems] = this.feedService.diff(parsedFeed, cachedFeed);

      // process source items
      const pagesAsync = newItems.map(async (item: any) => {
        // process item
        const crawledPage = await this.networkService.download(item);
        const parsedPage = await this.pageService.parse(crawledPage);
        await this.storageService.savePage(parsedPage);
      });
      await Promise.all(pagesAsync);

      // post-process feed (soure + feed meta + items => new feed meta + items)
      const meta = this.feedService.getUpdatedFeedMeta(parsedFeed, cachedFeed);
      const feed = this.feedService.merge(meta, [...newItems, ...existingItems]);
      return feed;
    });
    const feeds = await Promise.all(feedsAsync);

    // post-process feeds
    await this.buildService.build(feeds);
    await this.storageService.saveFeeds(feeds).removeUnusedItems();
  }
}
