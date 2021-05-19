import { readFile } from "fs";
import { promisify } from "util";

export const readFileAsync = promisify(readFile);
