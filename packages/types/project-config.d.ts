export interface ProjectConfig {
  sources: SourceConfig[];
}

export interface SourceConfig {
  url: string;
  /** @deprecated use `url` instead */
  href?: string;
}
