import type { ProjectTask } from "../runtime";
import type { Project } from "./types";

export function generate(): ProjectTask<Project> {
  return async (project) => {
    return project;
  };
}
