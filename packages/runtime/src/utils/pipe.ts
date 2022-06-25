export function pipe<T = any>(
  initFn: () => (T | Promise<T>)[] | Promise<T[]>,
  ...mapFns: ((value: T) => T | Promise<T>)[]
): () => Promise<T[]> {
  return async function () {
    const initialVector = await initFn();
    const asyncVector = initialVector.map(async (element) => element);
    return Promise.all(
      mapFns.reduce((currentVector, mapFn) => currentVector.map(async (item) => mapFn(await item)), asyncVector)
    );
  };
}
