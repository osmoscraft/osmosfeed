import { log } from "./log";

export type UrlMapJson = [url: string, filename: string][];

export class UrlMap {
  private mutableMap: Map<string, string>;

  constructor(urlMap: UrlMapJson) {
    try {
      this.mutableMap = new Map(urlMap);
    } catch (error) {
      log.error(`Error initializing url map. Fallback to empty map.`, error);
      this.mutableMap = new Map([]);
    }
  }

  get size() {
    return this.mutableMap.size;
  }

  toString() {
    return JSON.stringify([...this.mutableMap.entries()], null, 2);
  }

  set(url: string, filename: string) {
    this.mutableMap.set(url, filename);
  }

  get(url: string): string | undefined {
    return this.mutableMap.get(url);
  }
}
