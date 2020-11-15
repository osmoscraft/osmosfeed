import fs from "fs";
import path from "path";
import type { EnrichedSource } from "./enrich";

export interface Cache {
  readonly sources: EnrichedSource[];
}

export function setCache(data: Cache) {
  const cacheString = JSON.stringify(data, undefined, 2);

  fs.mkdirSync(path.resolve("dist"), { recursive: true });
  fs.writeFileSync(path.resolve("dist/cache.json"), cacheString);
}

export function getCache(): Cache {
  // TODO get cache from remote
  // Handle error
  // Handle empty state
  try {
    const cacheString = fs.readFileSync(path.resolve("dist/cache.json"), "utf-8");

    console.log(`[cache] cache restored`);
    return JSON.parse(cacheString) as Cache;
  } catch (err) {
    console.log(`[cache] cache not found`);
    return {
      sources: [],
    };
  }
}
