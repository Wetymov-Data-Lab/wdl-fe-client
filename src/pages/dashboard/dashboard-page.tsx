import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { loadWorkspace } from "@/entities/schema/api";
import { schemaQueryKeys } from "@/entities/schema/model/query-keys";
import { useAuth } from "@/features/auth/model/use-auth";

export function DashboardPage() {
  const auth = useAuth();
  const workspaceQuery = useQuery({ queryKey: schemaQueryKeys.workspace, queryFn: loadWorkspace });

  if (workspaceQuery.isLoading) return <PageState>Собираем обзор...</PageState>;
  if (workspaceQuery.isError || !workspaceQuery.data) return <PageState error>Не удалось загрузить обзор.</PageState>;

  const workspace = workspaceQuery.data;
  const ownedRealms = workspace.realms.filter((realm) => realm.authorId === auth.user?.sub);
  const ownedRealmIds = new Set(ownedRealms.map((realm) => realm.id));
  const ownedProjects = workspace.projects.filter((project) => ownedRealmIds.has(project.realmId));
  const ownedProjectIds = new Set(ownedProjects.map((project) => project.id));
  const ownedDatabases = workspace.databases.filter((database) => ownedProjectIds.has(database.projectId));
  const recentDatabases = [...ownedDatabases]
    .sort((left, right) => Date.parse(right.updatedAt ?? right.createdAt) - Date.parse(left.updatedAt ?? left.createdAt))
    .slice(0, 4);

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <span>WDL / DASHBOARD</span>
        </div>
        <div className="dashboard-hero__actions">
          <Link className="button button--primary" to="/realms">
            Создать пространство
          </Link>
          <Link className="button button--secondary" to="/editor">
            Открыть редактор
          </Link>
        </div>
      </header>

      <section className="dashboard-stats" aria-label="Статистика">
        <StatCard index="01" label="Ваши realms" value={ownedRealms.length} />
        <StatCard index="02" label="Проекты" value={ownedProjects.length} />
        <StatCard index="03" label="Базы данных" value={ownedDatabases.length} />
        <StatCard
          index="04"
          label="Опубликовано"
          value={ownedRealms.filter((realm) => realm.visibility === "public").length}
        />
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <header>
            <div>
              <h2>Недавние схемы</h2>
            </div>
            <Link to="/editor">Все схемы</Link>
          </header>
          {recentDatabases.length ? (
            <div className="dashboard-database-list">
              {recentDatabases.map((database) => {
                const project = ownedProjects.find((item) => item.id === database.projectId);
                const realm = ownedRealms.find((item) => item.id === project?.realmId);
                return (
                  <Link to={`/editor?databaseId=${database.id}`} key={database.id}>
                    <span>{database.type}</span>
                    <div>
                      <strong>{database.name}</strong>
                      <small>
                        {realm?.name ?? "Realm"} / {project?.name ?? "Проект"}
                      </small>
                    </div>
                    <b>Открыть</b>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyPanel title="Схем пока нет" action="Создать первую" to="/realms" />
          )}
        </section>

        <section className="dashboard-panel">
          <header>
            <div>
              <span>ПРОСТРАНСТВА</span>
              <h2>Ваши realms</h2>
            </div>
            <Link to="/realms">Управление →</Link>
          </header>
          {ownedRealms.length ? (
            <div className="dashboard-realm-list">
              {ownedRealms.slice(0, 5).map((realm) => {
                const projectCount = ownedProjects.filter((project) => project.realmId === realm.id).length;
                return (
                  <Link to="/realms" key={realm.id}>
                    <i className={`dashboard-realm-list__status dashboard-realm-list__status--${realm.visibility}`} />
                    <div>
                      <strong>{realm.name}</strong>
                      <small>{projectCount} проектов</small>
                    </div>
                    <code>{realm.visibility}</code>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyPanel title="Создайте свой первый realm" action="Начать" to="/realms" />
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ index, label, value }: { index: string; label: string; value: number }) {
  return (
    <article className="dashboard-stat">
      <span>{index}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </article>
  );
}

function EmptyPanel({ title, action, to }: { title: string; action: string; to: string }) {
  return (
    <div className="dashboard-empty">
      <p>{title}</p>
      <Link to={to}>{action} →</Link>
    </div>
  );
}

function PageState({ children, error = false }: { children: string; error?: boolean }) {
  return <main className={`dashboard-state ${error ? "dashboard-state--error" : ""}`}>{children}</main>;
}
