export interface VirtualFile<T = string> {
  metadata: FileMetadata;
  content: T;
}

export interface FileMetadata {
  path: string;
  filename: string;
  extension: string;
}
