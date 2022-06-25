export interface PipeConfig<T> {
  preProjectTasks?: ((project: T[][]) => T[][] | Promise<T[][]>)[];
  preFeedTasks?: ((feed: T[]) => T[] | Promise<T[]>)[];
  itemTasks?: ((item: T) => T | Promise<T>)[];
  postFeedTasks?: ((feed: T[]) => T[] | Promise<T[]>)[];
  postProjectTasks?: ((project: T[][]) => T[][] | Promise<T[][]>)[];
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
  const itemTasks = config?.itemTasks ?? [];

  const preFeedTasks = config?.preFeedTasks ?? [];
  const postFeedTasks = config?.postFeedTasks ?? [];
  const feedTask = (items: T[]) => spawnMap(items, itemTasks);
  const feedTasks = [...preFeedTasks, feedTask, ...postFeedTasks];

  const preProjectTasks = config?.preProjectTasks ?? [];
  const postProjectTasks = config?.postProjectTasks ?? [];
  const projectTask = async (feeds: T[][]) => spawnMap(feeds, feedTasks);
  const projectTasks = [...preProjectTasks, projectTask, ...postProjectTasks];

  const project = (await spawnMap([[]] as T[][][], projectTasks))[0];
  return project;
}

/**
 * Perform a sequence of async tasks on all the items in a collection in parallel
 */
function spawnMap<T>(collection: T[], asyncTasks: ((value: T) => T | Promise<T>)[]): Promise<T[]> {
  return Promise.all(
    collection.map((item) => asyncTasks.reduce(async (value, task) => task(await value), Promise.resolve(item)))
  );
}
