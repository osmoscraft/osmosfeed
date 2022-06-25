export interface PipeConfig<T> {
  preProjectTasks?: ((feeds: T[][]) => T[][] | Promise<T[][]>)[];
  preFeedTasks?: ((feed: T[]) => T[] | Promise<T[]>)[];
  itemTasks?: ((feed: T) => T | Promise<T>)[];
  postFeedTasks?: ((feed: T[]) => T[] | Promise<T[]>)[];
  postProjectTasks?: ((feeds: T[][]) => T[][] | Promise<T[][]>)[];
}

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

function spawnMap<T>(collection: T[], asyncTasks: ((value: T) => T | Promise<T>)[]): Promise<T[]> {
  return Promise.all(collection.map((item) => asyncTasks.reduce(asyncReducer, Promise.resolve(item))));
}

async function asyncReducer<T>(current: Promise<T>, task: (value: T) => T | Promise<T>) {
  return task(await current);
}
