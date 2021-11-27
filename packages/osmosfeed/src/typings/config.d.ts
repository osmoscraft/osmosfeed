export interface ProjectConfig {
  siteTitle?: string;
  channels: ChannelConfig[];
}

export interface ChannelConfig {
  href: string;
}
