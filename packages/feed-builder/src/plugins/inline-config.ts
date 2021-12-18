import { ProjectConfig } from "@osmosfeed/types";
import { Plugin } from "../types/plugin";

export function useInlineConfig(config: ProjectConfig): Plugin {
  return {
    packageName: "@osmosfeed/inline-config",
    config: async () => config,
  };
}
