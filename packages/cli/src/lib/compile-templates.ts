import path from "path";
import { getFirstNonEmptyArray } from "../utils/get-first-non-empty-array";
import type { ParsableFile } from "./discover-files";
import Handlebars from "handlebars";

const ENTRY_TEMPLATE_NAME = "index";

export interface RegisterTemplatesInput {
  userTemplates: ParsableFile[];
  systemTemplates: ParsableFile[];
}

export function compileTemplates({
  userTemplates,
  systemTemplates,
}: RegisterTemplatesInput): HandlebarsTemplateDelegate {
  const effectiveTemplates = getFirstNonEmptyArray(userTemplates, systemTemplates);
  if (!effectiveTemplates) throw new Error("No templates found.");

  effectiveTemplates.forEach((template) => {
    const templateName = getTemplateName(template);
    Handlebars.registerPartial(templateName, template.rawText);
    console.log(`[register-template] Registered ${templateName}:`, template.path);
  });

  return Handlebars.compile(`{{> ${ENTRY_TEMPLATE_NAME}}}`);
}

function getTemplateName(file: ParsableFile): string {
  return path.basename(file.filename, file.extension);
}
