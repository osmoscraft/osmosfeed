export function deduplicate<T>(array: T[], isEqual: (a: T, b: T) => boolean) {
  return array.filter(
    (currentItem, index, self) => index === self.findIndex((existingItem) => isEqual(currentItem, existingItem))
  );
}
