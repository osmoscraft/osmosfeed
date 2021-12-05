import { JsonFeedItem } from "./json-feed";

export type JsonFeedCacheExtension = {
  _ext_cache: {
    pkg_version: string;
    cache_key: string;
  };
};

export type JsonFeedItemCacheExtension = {
  _ext_cache: {
    pkg_version: string;
    cache_key?: string;
  };
};
