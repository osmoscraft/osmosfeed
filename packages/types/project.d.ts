import { JsonFeed } from ".";

export interface ProjectConfig<SourceConfigType = SourceConfig> {
  sources: SourceConfigType[];
}

export interface SourceConfig {
  url: string;
  /** @deprecated use `url` instead */
  href?: string;
}

export interface ProjectOutput {
  feeds: JsonFeed[];
}
