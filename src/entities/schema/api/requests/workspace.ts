import { database } from "@/entities/schema/api/requests/database";
import { project } from "@/entities/schema/api/requests/project";
import { realm } from "@/entities/schema/api/requests/realm";
import { schemaEnums } from "@/entities/schema/api/requests/enums";

export async function loadWorkspace(): Promise<Schema.Workspace> {
  const [enums, realms, projects, databases] = await Promise.all([
    schemaEnums.get(),
    realm.list(),
    project.list(),
    database.list(),
  ]);
  const realmIds = new Set(realms.map((item) => item.id));
  const visibleProjects = projects.filter((item) => realmIds.has(item.realmId));
  const projectIds = new Set(visibleProjects.map((item) => item.id));

  return {
    enums,
    realms,
    projects: visibleProjects,
    databases: databases.filter((item) => projectIds.has(item.projectId)),
  };
}
