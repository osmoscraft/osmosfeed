export interface BuildConfig<P extends BaseProject = any, F extends BaseFeed = any, I = any> {
  preProjectTasks?: ProjectTask<P>[];
  preFeedTasks?: FeedTask<F>[];
  itemTasks?: ItemTask<I>[];
  postFeedTasks?: FeedTask<F>[];
  postProjectTasks?: ProjectTask<P>[];
}

export type ProjectTask<T extends BaseProject = BaseProject, K = any> = (project: T, context: K) => T | Promise<T>;
export type FeedTask<T extends BaseFeed = BaseFeed, K = any> = (feed: T, context: K) => T | Promise<T>;
export type ItemTask<T = any, K = any> = (item: T, context: K) => T | Promise<T>;

type BaseProject = {
  feeds: BaseFeed[];
};

type BaseFeed = {
  items: any[];
};

/**
 * Runtime responsibility
 * - Scheduling
 * - Error handling
 * - Logging
 * - Network API
 * - Storage API
 */
export async function build(config?: BuildConfig) {
  const initialProject: BaseProject = {
    feeds: [],
  };

  const {
    itemTasks = [],
    preFeedTasks = [],
    postFeedTasks = [],
    preProjectTasks = [],
    postProjectTasks = [],
  } = config ?? {};

  const context = {};

  const feedTask = async (feed: BaseFeed) => ({
    ...feed,
    items: await Promise.all(feed.items.map((item) => runAsyncTasks(itemTasks, item, context))),
  });
  const feedTasks = [...preFeedTasks, feedTask, ...postFeedTasks];

  const projectTask = async (proj: BaseProject) => ({
    ...proj,
    feeds: await Promise.all(proj.feeds.map((feed) => runAsyncTasks(feedTasks, feed, context))),
  });
  const projectTasks = [...preProjectTasks, projectTask, ...postProjectTasks];

  return await runAsyncTasks(projectTasks, initialProject, context);
}

async function runAsyncTasks<T>(
  tasks: ((value: T, context: any) => T | Promise<T>)[],
  initialValue: T,
  context: any
): Promise<T> {
  return tasks.reduce(async (value, task) => {
    try {
      return await task(await value, context);
    } catch (e) {
      // TODO associate error with task
      console.error(e);
      return await value;
    }
  }, Promise.resolve(initialValue));
}
