import { ProjectConfig, SourceConfig } from "@osmoscraft/osmosfeed-types";
import { ConfigPlugin } from "../sdk";

export function useInlineConfig(config: ProjectConfig): ConfigPlugin {
  return async () => config;
}
