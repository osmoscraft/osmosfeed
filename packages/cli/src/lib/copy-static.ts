import { copyFileDeepAsync } from "../utils/fs";
import type { CopyStaticPlan } from "./get-copy-static-plan";

export function copyStatic(plan: CopyStaticPlan) {
  const tasksAsync = plan.items.map((item) =>
    copyFileDeepAsync(item.fromPath, item.toPath).then(() => console.log(`[copy-static] Copied:`, item.fromPath))
  );

  return Promise.all(tasksAsync);
}
