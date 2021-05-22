import axios, { AxiosError } from "axios";
import type { EnrichedSource } from "./enrich";
import { cliVersion } from "../utils/version";
import type { ParsableFile } from "./discover-files";

export interface Cache {
  readonly sources: EnrichedSource[];
  readonly cliVersion: string;
}

export interface GetCacheInput {
  cacheUrl: string | null;
  localCacheFile: ParsableFile | null;
}

export async function getCache({ cacheUrl, localCacheFile }: GetCacheInput): Promise<Cache> {
  if (cacheUrl) {
    console.log(`[get-cache] Use remote cache:`, cacheUrl);
    const remoteCache = await getRemoteCache(cacheUrl);
    if (remoteCache) return remoteCache;
  }

  if (localCacheFile) {
    // This is for development. The build server won't have any local cache.
    console.log(`[get-cache] Use local cache:`, localCacheFile.path);
    return getLocalCache(localCacheFile);
  }

  console.log(`[get-cache] Use empty cache`);
  return getInitialCache();
}

export async function getRemoteCache(cacheUrl: string): Promise<Cache | null> {
  try {
    const response = await axios.get(cacheUrl);

    if (typeof response.data !== "object") throw new Error(`Invalid cache from ${cacheUrl}`);

    console.log(`[discover-cache] Pre-build cache restored: ${cacheUrl}`);
    return response.data as Cache;
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 404) {
      console.warn(`[discover-cache] No cache found: ${cacheUrl}`);
      return null;
    } else {
      console.error(`[discover-cache] Unexpected cache restore error at ${cacheUrl}`);
      throw new Error(err);
    }
  }
}

function getLocalCache(localCacheFile: ParsableFile): Cache {
  return JSON.parse(localCacheFile.rawText);
}

function getInitialCache(): Cache {
  return {
    sources: [],
    cliVersion,
  };
}
