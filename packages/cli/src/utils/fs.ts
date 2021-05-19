import { promises } from "fs";

export const readFileAsync = promises.readFile;
export const readDirAsync = promises.readdir;
