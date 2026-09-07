import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadWorkspace } from "@/entities/schema/api";
import { schemaQueryKeys } from "@/entities/schema/model/query-keys";
import { useAuth } from "@/features/auth/model/use-auth";

export function CatalogPage() {
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const workspaceQuery = useQuery({ queryKey: schemaQueryKeys.workspace, queryFn: loadWorkspace });
  const normalizedSearch = search.trim().toLowerCase();
  const publicRealms = useMemo(() => {
    if (!workspaceQuery.data) return [];
    return workspaceQuery.data.realms.filter((realm) => {
      if (realm.visibility !== "public") return false;
      if (!normalizedSearch) return true;
      const projects = workspaceQuery.data.projects.filter((project) => project.realmId === realm.id);
      const projectIds = new Set(projects.map((project) => project.id));
      const databases = workspaceQuery.data.databases.filter((database) => projectIds.has(database.projectId));
      return [realm.name, realm.slug, ...projects.map((item) => item.name), ...databases.map((item) => item.name)].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [normalizedSearch, workspaceQuery.data]);

  if (workspaceQuery.isLoading) return <main className="catalog-state">Загружаем каталог...</main>;
  if (workspaceQuery.isError || !workspaceQuery.data)
    return <main className="catalog-state catalog-state--error">Не удалось загрузить публичные realms.</main>;

  const workspace = workspaceQuery.data;

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <div>
          <span>WDL / DISCOVER</span>
          <h1>Каталог схем</h1>
          <p>Опубликованные realms доступны для просмотра без риска изменить чужую работу.</p>
        </div>
        <label className="catalog-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Realm, проект или БД" />
        </label>
      </header>

      <div className="catalog-summary">
        <strong>{publicRealms.length}</strong>
        <span>{normalizedSearch ? "найдено" : "опубликованных realms"}</span>
      </div>

      {publicRealms.length ? (
        <div className="catalog-grid">
          {publicRealms.map((realm) => {
            const projects = workspace.projects.filter((project) => project.realmId === realm.id);
            const projectIds = new Set(projects.map((project) => project.id));
            const databases = workspace.databases.filter((database) => projectIds.has(database.projectId));
            const isOwner = realm.authorId === auth.user?.sub;
            return (
              <article className="catalog-card" key={realm.id}>
                <header>
                  <span>PUBLIC REALM</span>
                  <small>{isOwner ? "Ваш realm" : `Автор ${shortId(realm.authorId)}`}</small>
                </header>
                <h2>{realm.name}</h2>
                <code>/{realm.slug}</code>
                <div className="catalog-card__counts">
                  <span>{projects.length} проектов</span>
                  <span>{databases.length} баз данных</span>
                </div>
                <div className="catalog-card__databases">
                  {databases.slice(0, 3).map((database) => (
                    <Link to={`/editor?databaseId=${database.id}`} key={database.id}>
                      <span>{database.type}</span>
                      <strong>{database.name}</strong>
                      <b>↗</b>
                    </Link>
                  ))}
                  {!databases.length && <p>Автор ещё не добавил базы данных.</p>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="catalog-empty">
          <h2>{normalizedSearch ? "Ничего не найдено" : "Публичных realms пока нет"}</h2>
          <p>{normalizedSearch ? "Попробуйте изменить поисковый запрос." : "Здесь появятся опубликованные схемы."}</p>
        </section>
      )}
    </main>
  );
}

function shortId(value: string): string {
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}
