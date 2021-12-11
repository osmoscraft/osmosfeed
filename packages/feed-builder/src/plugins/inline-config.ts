import { ProjectConfig } from "@osmoscraft/osmosfeed-types";
import { ConfigPlugin } from "../types/plugins";

export function useInlineConfig(config: ProjectConfig): ConfigPlugin {
  return async () => config;
}
