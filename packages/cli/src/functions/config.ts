import { parse } from "yaml";

export interface ProjectConfig {
  // timezone: string;
  // timezoneOffset: number;
  sources: Source[];
  // retry?: number;
  // timeout?: number;
}

export interface Source {
  url: string;
  // retry?: number;
  // timeout?: number;
}

export async function getProjectConfig(text: string): Promise<ProjectConfig> {
  const baseConfig = parse(text);

  return baseConfig;
}
