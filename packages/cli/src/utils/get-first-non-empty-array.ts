export function getFirstNonEmptyArray<T>(...arrayList: T[][]): T[] | null {
  const nonEmptyArray = arrayList.find((templateList) => templateList.length > 0);
  if (!nonEmptyArray) return null;

  return nonEmptyArray;
}
