import path from "path";

/** The dir that contains of index.ts/js */
export const ENTRY_DIR = path.dirname(require?.main?.filename ?? __dirname);
