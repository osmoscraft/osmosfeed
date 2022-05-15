export interface FileHandle {
  fullPath: string;
  name: string;
  ext: string;
  read(filename: string): Promise<string>;
  read<T>(filename: string, format: "json"): Promise<T>;
  read(filename: string, format: "blob"): Promise<Blob>;
}
export async function getFileHandles(globs: string[]) {
  const filePaths = await getGlobs(globs);
  return filePaths.map((filePath) => ({
    filePath,
    name: "",
    ext: "",
    read: () => "",
  }));
}

async function getGlobs(globs: string[]) {
  return [];
}
