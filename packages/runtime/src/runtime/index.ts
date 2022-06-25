export interface PipeConfig<T> {
  preProjectTasks?: ProjectTask<T>[];
  preFeedTasks?: FeedTask<T>[];
  itemTasks?: ItemTask<T>[];
  postFeedTasks?: FeedTask<T>[];
  postProjectTasks?: ProjectTask<T>[];
}

export type ProjectTask<T> = (project: Project<T>) => Project<T> | Promise<Project<T>>;
export type FeedTask<T> = (feed: Feed<T>) => Feed<T> | Promise<Feed<T>>;
export type ItemTask<T> = (item: T) => T | Promise<T>;

interface Project<T> {
  feeds: Feed<T>[];
}
interface Feed<T> {
  items: T[];
}

/**
 * Runtime responsibility
 * - Scheduling
 * - Error handling
 * - Logging
 * - Network API
 * - Storage API
 */
export async function build<T>(config?: PipeConfig<T>) {
  const initProj: Project<T> = {
    feeds: [],
  };

  const {
    itemTasks = [],
    preFeedTasks = [],
    postFeedTasks = [],
    preProjectTasks = [],
    postProjectTasks = [],
  } = config ?? {};

  const feedTask = async (feed: Feed<T>) => ({
    ...feed,
    items: await Promise.all(feed.items.map((item) => runAsyncTasks(itemTasks, item))),
  });
  const feedTasks = [...preFeedTasks, feedTask, ...postFeedTasks];

  const projectTask = async (proj: Project<T>) => ({
    ...proj,
    feeds: await Promise.all(proj.feeds.map((feed) => runAsyncTasks(feedTasks, feed))),
  });
  const projectTasks = [...preProjectTasks, projectTask, ...postProjectTasks];

  return await runAsyncTasks(projectTasks, initProj);
}

async function runAsyncTasks<T>(tasks: ((value: T) => T | Promise<T>)[], initialValue: T): Promise<T> {
  return tasks.reduce(async (proj, task) => task(await proj), Promise.resolve(initialValue));
}
