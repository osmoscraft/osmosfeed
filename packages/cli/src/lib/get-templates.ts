import path from "path";
import type { ParsableFile } from "../lib-v2/discover-files";

export const INCLUDE_DIR = "includes";
export const SYSTEM_TEMPLATE_DIR = "system-templates";

export interface TemplateSummary {
  namedTemplates: NamedTemplate[];
}

export interface NamedTemplate {
  name: string;
  templateString: string;
}

export type PartialSource = "user" | "system";
