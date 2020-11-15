import yaml from "js-yaml";
import fs from "fs";
import path from "path";

export interface Source {
  href: string;
}

export interface Config {
  sources: Source[];
}

export function getSources(): Source[] {
  const config = getConfig();

  return config.sources;
}

export function getConfig() {
  const sourcesText = fs.readFileSync(path.resolve("platojar.yaml"), "utf8");
  const config = yaml.safeLoad(sourcesText) as Config; // TODO error checking
  return config;
}
