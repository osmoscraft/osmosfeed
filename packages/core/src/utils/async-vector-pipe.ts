export function asyncVectorPipe<T = any>(
  initFn: () => (T | Promise<T>)[],
  ...mapFns: ((value: T) => T | Promise<T>)[]
): () => Promise<T[]> {
  return function asyncVectorPipe() {
    const initialVector = initFn();
    const asyncVector = initialVector.map(async (element) => element);
    return Promise.all(
      mapFns.reduce((currentVector, mapFn) => currentVector.map(async (item) => mapFn(await item)), asyncVector)
    );
  };
}
