import Handlebars from "handlebars";
import path from "path";
import type { FileHandle } from "./fs";

const ENTRY_TEMPLATE_NAME = "index";

export interface RegisterTemplatesInput {
  templates: FileHandle[];
  onTemplateRegistered?: (templateName: string, handle: FileHandle) => any;
}

export async function compileTemplates({
  templates,
  onTemplateRegistered,
}: RegisterTemplatesInput): Promise<HandlebarsTemplateDelegate> {
  if (!templates.length) throw new Error("No templates found.");

  await Promise.all(
    templates.map(async (handle) => {
      const templateText = await handle.text();
      const templateName = path.basename(handle.name, handle.ext);
      Handlebars.registerPartial(templateName, templateText);
      onTemplateRegistered?.(templateName, handle);
    })
  );

  return Handlebars.compile(`{{> ${ENTRY_TEMPLATE_NAME}}}`);
}
