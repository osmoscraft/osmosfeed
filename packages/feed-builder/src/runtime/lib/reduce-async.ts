export async function reduceAsync<T, P>(values: T[], reducer: (prev: P, current: T) => Promise<P>, initial: P) {
  let result: P = initial;
  for (let value of values) {
    result = await reducer(result, value);
  }
  return result;
}
