export function asyncVectorPipeFactory<T = any>(
  ...mapFns: ((value: T) => T | Promise<T>)[]
): (initialVector: T[]) => Promise<T[]> {
  return function asyncVectorPipe(initialVector: T[]) {
    const asyncVector = initialVector.map(async (element) => element);
    return Promise.all(
      mapFns.reduce((currentVector, mapFn) => currentVector.map(async (item) => mapFn(await item)), asyncVector)
    );
  };
}
