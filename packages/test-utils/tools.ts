export async function flushAsync() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 0);
  });
}
