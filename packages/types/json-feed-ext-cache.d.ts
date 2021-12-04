import { JsonFeedItem } from "./json-feed";

export interface JsonFeedCacheExtension {
  _ext_cache: {
    pkg_version: string;
    cache_key: string;
  };
  items: (JsonFeedItem & JsonFeedItemCacheExtension)[];
}

export interface JsonFeedItemCacheExtension {
  _ext_cache: {
    pkg_version: string;
    cache_key: string;
  };
}
