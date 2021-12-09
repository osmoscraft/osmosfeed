export interface ProjectConfig<SourceConfigType = SourceConfig> {
  sources: SourceConfigType[];
}

export interface SourceConfig {
  url: string;
  /** @deprecated use `url` instead */
  href?: string;
}
