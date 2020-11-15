import type { Article } from "..";
import fs from "fs";
import path from "path";

export interface Cache {
  articles: Article[];
}

export function setCache(data: Cache) {
  const cacheString = JSON.stringify(data);

  fs.mkdirSync(path.resolve("dist"), { recursive: true });
  fs.writeFileSync(path.resolve("dist/cache.json"), cacheString);
}

export function getCache(): Cache {
  // TODO get cache from remote
  // Handle error
  // Handle empty state
  const cacheString = fs.readFileSync(path.resolve("dist/cache.json"), "utf-8");

  return JSON.parse(cacheString) as Cache;
}
