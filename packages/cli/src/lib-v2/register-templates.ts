import path from "path";
import { getFirstNonEmptyArray } from "../utils/get-first-non-empty-array";
import type { ParsableFile } from "./discover-files";
import Handlebars from "handlebars";

export interface RegisterTemplatesInput {
  userTemplates: ParsableFile[];
  systemTemplates: ParsableFile[];
}

export function registerTemplates({ userTemplates, systemTemplates }: RegisterTemplatesInput) {
  const effectiveTemplates = getFirstNonEmptyArray(userTemplates, systemTemplates);
  if (!effectiveTemplates) throw new Error("No templates found.");

  effectiveTemplates.forEach((template) => {
    const templateName = getTemplateName(template);
    Handlebars.registerPartial(templateName, template.rawText);
    console.log(`[register-template] Registered ${templateName}:`, template.path);
  });
}

function getTemplateName(file: ParsableFile): string {
  return path.basename(file.filename, file.extension);
}
