import path from "path";

/** The dir that contains of main.ts/js */
export const ENTRY_DIR = path.dirname(require?.main?.filename ?? __dirname);

/** Templates and snippets from user */
export const INCLUDE_DIR = "includes";
export const USER_STATIC_DIR = "static";

export const SYSTEM_STATIC_DIR = "system-static";
export const SYSTEM_TEMPLATE_DIR = "system-templates";

/** Build output folder, also the root of the website */
export const PUBLIC_ROOT_DIR = "public";
