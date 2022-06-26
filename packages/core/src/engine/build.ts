export interface BuildConfig<P extends BaseProject = any, F extends BaseFeed = any, I = any> {
  preProjectTasks?: ProjectTask<P>[];
  preFeedTasks?: FeedTask<F>[];
  itemTasks?: ItemTask<I>[];
  postFeedTasks?: FeedTask<F>[];
  postProjectTasks?: ProjectTask<P>[];
}

export type ProjectTask<T extends BaseProject = BaseProject> = (project: T) => T | Promise<T>;
export type FeedTask<T extends BaseFeed = BaseFeed> = (feed: T) => T | Promise<T>;
export type ItemTask<T = any> = (item: T) => T | Promise<T>;

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
  const initProj: BaseProject = {
    feeds: [],
  };

  const {
    itemTasks = [],
    preFeedTasks = [],
    postFeedTasks = [],
    preProjectTasks = [],
    postProjectTasks = [],
  } = config ?? {};

  const feedTask = async (feed: BaseFeed) => ({
    ...feed,
    items: await Promise.all(feed.items.map((item) => runAsyncTasks(itemTasks, item))),
  });
  const feedTasks = [...preFeedTasks, feedTask, ...postFeedTasks];

  const projectTask = async (proj: BaseProject) => ({
    ...proj,
    feeds: await Promise.all(proj.feeds.map((feed) => runAsyncTasks(feedTasks, feed))),
  });
  const projectTasks = [...preProjectTasks, projectTask, ...postProjectTasks];

  return await runAsyncTasks(projectTasks, initProj);
}

async function runAsyncTasks<T>(tasks: ((value: T) => T | Promise<T>)[], initialValue: T): Promise<T> {
  return tasks.reduce(async (value, task) => {
    try {
      return await task(await value);
    } catch (e) {
      // TODO associate error with task
      console.error(e);
      return await value;
    }
  }, Promise.resolve(initialValue));
}
