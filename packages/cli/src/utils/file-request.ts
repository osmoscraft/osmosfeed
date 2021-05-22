import path from "path";

export interface FileRequest<T = any> {
  path: string;
  ext: string;
  filename: string;
  details: T;
}

export interface FilenameToFileRequestConverter {
  (filename: string): FileRequest;
}

export function getFilenameToFileRequestConverter<T>(dir: string, details?: T): FilenameToFileRequestConverter {
  return (filename: string) => ({
    path: path.join(dir, filename),
    ext: path.extname(filename).toLowerCase(),
    filename,
    details,
  });
}

export interface FileRequestFilter {
  (request: FileRequest): boolean;
}

/**
 * Get a filter function to be used against an array of FileRequest.
 * Each allowed extension string must start with dot, e.g. `.txt`, `.html`
 */
export function getExtensionsFilter(allowedExtensions: string[]): FileRequestFilter {
  return (request: FileRequest) => allowedExtensions.includes(request.ext);
}
