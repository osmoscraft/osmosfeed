import type { AxiosError } from "axios";
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { cliVersion } from "../utils/version";
import type { EnrichedSource } from "./enrich";

/**
 * relative to the dir that contains package.json
 */
const CACHE_PATH = "public/cache.json";

const INITIAL_CACHE: Cache = {
  sources: [],
  cliVersion,
};

export interface Cache {
  readonly sources: EnrichedSource[];
  readonly cliVersion: string;
}

export function setCache(data: Cache) {
  const cacheString = JSON.stringify(data, undefined, 2);
  console.log(`[cache] cache updated with cli version ${data.cliVersion}`);

  fs.mkdirSync(path.resolve("public"), { recursive: true });
  fs.writeFileSync(path.resolve(CACHE_PATH), cacheString);
}

export async function getCache(cacheUrl: string | null): Promise<Cache> {
  let cache: Cache;
  if (!cacheUrl) {
    console.log(`[cache] no cache url provided, will restore local cache`);
    // This is for development. The build server won't have any local cache.
    cache = await getCacheLocal(CACHE_PATH);
  } else {
    console.log(`[cache] cache url provided, will restore remote cache`);
    cache = await getCacheRemote(cacheUrl);
  }

  console.log(`[cache] cache cli version ${cache.cliVersion}`);
  return cache;
}

async function getCacheRemote(cacheUrl: string): Promise<Cache> {
  try {
    const response = await axios.get(cacheUrl);

    if (typeof response.data !== "object") throw new Error(`Invalid cache from ${cacheUrl}`);

    console.log(`[cache] cache restored from ${cacheUrl}`);
    return response.data as Cache;
  } catch (err) {
    // During the first run, the cache file will return 404. Continue will initial cache
    if ((err as AxiosError)?.response?.status === 404) {
      console.warn(`[cache] cache not found at ${cacheUrl}, build continues...`);
      return INITIAL_CACHE;
    } else {
      console.error(`[cache] unexpected cache restore failure at ${cacheUrl}`);
      throw new Error(err);
    }
  }
}

async function getCacheLocal(cachePath: string): Promise<Cache> {
  try {
    const cache: Cache = await fs.readJSON(cachePath);

    console.log(`[cache] cache restored from ${cachePath}`);
    return cache;
  } catch (err) {
    console.log(`[cache] cache not found locally, use empty cache.`);
    return INITIAL_CACHE;
  }
}
