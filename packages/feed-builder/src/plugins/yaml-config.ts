import { ProjectConfig } from "@osmosfeed/types";
import { Plugin } from "../types/plugin";
import { parse } from "yaml";

export function useYamlConfig(): Plugin {
  return {
    packageName: "@osmosfeed/yaml-config",
    config: async ({ api }) => {
      const fileRaw = (await api.storage.readFile("osmosfeed.yml")) ?? (await api.storage.readFile("osmosfeed.yaml"));
      if (!fileRaw) throw new Error("osmosfeed.yml file not found");

      const parsedConfig = parse(fileRaw.toString("utf-8")) as ProjectConfig;
      // TODO validation

      return parsedConfig;
    },
  };
}
