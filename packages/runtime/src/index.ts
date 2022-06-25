export interface PipeConfig<T> {
  preProjectTasks?: ((feeds: T[][]) => Promise<T[][]>)[];
  preFeedTasks?: ((feed: T[]) => Promise<T>[])[];
  itemTasks?: ((feed: T) => Promise<T>)[];
  postFeedTasks?: ((feed: T[]) => Promise<T>[])[];
  postProjectTasks?: ((feeds: T[][]) => Promise<T[][]>)[];
}

export async function createPipe<T>(config?: PipeConfig<T>) {
  const itemTasks = config?.itemTasks ?? [];

  const preFeedTasks = config?.preFeedTasks ?? [];
  const postFeedTasks = config?.postFeedTasks ?? [];
  const feedTask = (items: T[]) => spawnMap(items, itemTasks);
  const feedTasks = [...preFeedTasks, feedTask, ...postFeedTasks];
  // const feedTask = async (items: T[]) => items.map((item) => itemTasks.reduce(asyncReducer, Promise.resolve(item)));

  const preProjectTasks = config?.preProjectTasks ?? [];
  const postProjectTasks = config?.postFeedTasks ?? [];
  const projectTask = async (feeds: T[][]) => {
    return Promise.all(spawnMap(feeds, feedTasks));
  };

  const result = await [...preProjectTasks, projectTask, ...postProjectTasks].reduce(
    asyncReducer,
    Promise.resolve<T[][]>([])
  );

  return result;
}

function spawnMap<T>(collection: T[], asyncTasks: ((value: T) => Promise<T>)[]) {
  return collection.map((item) => asyncTasks.reduce(asyncReducer, Promise.resolve(item)));
}

async function asyncReducer<T>(current: Promise<T>, task: (value: T) => Promise<T>) {
  return task(await current);
}
