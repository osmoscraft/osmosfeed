let build: any;

async function main() {
  const definition = {
    sourcesProvider: yamlConfigSourceListProvider(),
    feedProviders: [cacheFeedProvider(), httpFeedProvider()],
    feedReducers: [mergeMetadata(), mergeItems({ maxCount: 100, maxAge: 100 })],
    itemProviders: [cacheItemProvider(), httpItemProvider()],
    itemReducers: [useFirstAvailable()],
  };

  const sources = definition.sourcesProvider();
  sources.map(async (source: any) => {
    const feeds = await Promise.all(definition.feedProviders.map((provider) => provider(source)));
    const mergedFeed = feeds.reduce(
      (soFar, current) =>
        definition.feedReducers.reduce(
          (prevReducerResult, currentReducer) => currentReducer(prevReducerResult, current),
          soFar
        ),
      {}
    );

    const items = mergedFeed.items.map(async (item: any) => {});
  });
}

build();

function httpFeedProvider(): any {
  throw new Error("Function not implemented.");
}

function mergeItem() {}

function httpItemProvider() {
  throw new Error("Function not implemented.");
}

function yamlConfigSourceListProvider(): any {
  throw new Error("Function not implemented.");
}

function cacheFeedProvider(): any {
  throw new Error("Function not implemented.");
}

function limitByDays(arg0: number) {
  throw new Error("Function not implemented.");
}

function limitByItems(arg0: number) {
  throw new Error("Function not implemented.");
}

function cacheItemProvider() {
  throw new Error("Function not implemented.");
}
function runInSequence() {
  throw new Error("Function not implemented.");
}
function updateMetadata() {
  throw new Error("Function not implemented.");
}

function combineItems() {
  throw new Error("Function not implemented.");
}

function limitItemByDays(arg0: number) {
  throw new Error("Function not implemented.");
}

function limitItemByCount(arg0: number) {
  throw new Error("Function not implemented.");
}
function httpFeedTransformer() {
  throw new Error("Function not implemented.");
}

function cacheFeedTransformer() {
  throw new Error("Function not implemented.");
}
function mergeMetadata(): any {
  throw new Error("Function not implemented.");
}
function mergeItems(...args: any[]): any {
  throw new Error("Function not implemented.");
}
function parallel(arg0: void[]) {
  throw new Error("Function not implemented.");
}

function sequence(arg0: void[]) {
  throw new Error("Function not implemented.");
}

function buildSite(feeds: any) {
  throw new Error("Function not implemented.");
}
function greedyCacheItemProvider() {
  throw new Error("Function not implemented.");
}
function useNewer() {
  throw new Error("Function not implemented.");
}
function useFirstAvailable() {
  throw new Error("Function not implemented.");
}
