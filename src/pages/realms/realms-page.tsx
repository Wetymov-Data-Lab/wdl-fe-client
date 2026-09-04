import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { database, project, realm } from "@/entities/schema/api";
import { schemaQueryKeys } from "@/entities/schema/model/query-keys";

type FormState =
  | { entity: "realm"; mode: "create"; name: string; slug: string }
  | { entity: "realm"; mode: "edit"; value: Schema.Realm; name: string; slug: string }
  | { entity: "project"; mode: "create"; realmId: Schema.Id; name: string }
  | { entity: "project"; mode: "edit"; value: Schema.Project; name: string }
  | { entity: "database"; mode: "create"; projectId: Schema.Id; name: string }
  | { entity: "database"; mode: "edit"; value: Schema.Database; name: string };

type DeleteTarget = { entity: "realm" | "project" | "database"; id: Schema.Id; name: string };

const formTitle = {
  realm: { create: "Новый realm", edit: "Редактировать realm" },
  project: { create: "Новый проект", edit: "Редактировать проект" },
  database: { create: "Новая база данных", edit: "Редактировать базу данных" },
} as const;

async function loadWorkspace(): Promise<Schema.Workspace> {
  const [realms, projects, databases] = await Promise.all([realm.list(), project.list(), database.list()]);
  return { realms, projects, databases };
}

export function RealmsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const workspaceQuery = useQuery({ queryKey: schemaQueryKeys.workspace, queryFn: loadWorkspace });
  const refreshWorkspace = () => queryClient.invalidateQueries({ queryKey: schemaQueryKeys.workspace });

  const saveMutation = useMutation({
    mutationFn: async (input: FormState) => {
      if (input.entity === "realm") {
        return input.mode === "create"
          ? realm.create({ name: input.name, slug: input.slug })
          : realm.update(input.value, { name: input.name, slug: input.slug });
      }
      if (input.entity === "project") {
        return input.mode === "create"
          ? project.create({ realmId: input.realmId, name: input.name })
          : project.update(input.value, input.name);
      }
      return input.mode === "create"
        ? database.create({ projectId: input.projectId, name: input.name })
        : database.update(input.value, input.name);
    },
    onSuccess: async () => {
      setForm(null);
      await refreshWorkspace();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (target: DeleteTarget) => {
      const cachedWorkspace = queryClient.getQueryData<Schema.Workspace>(schemaQueryKeys.workspace);

      if (target.entity === "realm" && cachedWorkspace) {
        const projectIds = cachedWorkspace.projects
          .filter((project) => project.realmId === target.id)
          .map((project) => project.id);
        const databases = cachedWorkspace.databases.filter((database) => projectIds.includes(database.projectId));

        await Promise.all(databases.map((databaseItem) => database.delete(databaseItem.id)));
        await Promise.all(projectIds.map((projectId) => project.delete(projectId)));
        return realm.delete(target.id);
      }
      if (target.entity === "realm") return realm.delete(target.id);

      if (target.entity === "project") return project.delete(target.id);
      return database.delete(target.id);
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await refreshWorkspace();
    },
  });

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const slug = String(data.get("slug") ?? "").trim();

    if (form.entity === "realm") {
      saveMutation.mutate({ ...form, name, slug });
      return;
    }
    saveMutation.mutate({ ...form, name });
  };

  if (workspaceQuery.isLoading) {
    return <main className="realms-page realms-page--state">Загружаем пространства...</main>;
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return <main className="realms-page realms-page--state">Не удалось загрузить пространства.</main>;
  }

  const workspace = workspaceQuery.data;

  return (
    <main className="realms-page">
      <header className="realms-page__header">
        <div>
          <span>WDL / WORKSPACES</span>
          <h1>Рабочие пространства</h1>
          <p>Организуйте проекты и базы данных по изолированным контурам.</p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={() => setForm({ entity: "realm", mode: "create", name: "", slug: "" })}>
          Добавить пространство
        </button>
      </header>

      {workspace.realms.length ? (
        <div className="realm-list">
          {workspace.realms.map((realm) => {
            const projects = workspace.projects.filter((project) => project.realmId === realm.id);

            return (
              <section className="realm-card" key={realm.id}>
                <header className="realm-card__header">
                  <div>
                    <span>REALM</span>
                    <h2>{realm.name}</h2>
                    <code>{realm.slug}</code>
                  </div>
                  <div className="entity-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          entity: "realm",
                          mode: "edit",
                          value: realm,
                          name: realm.name,
                          slug: realm.slug,
                        })
                      }>
                      Редактировать
                    </button>
                    <button
                      className="entity-actions__danger"
                      type="button"
                      onClick={() => setDeleteTarget({ entity: "realm", id: realm.id, name: realm.name })}>
                      Удалить
                    </button>
                    <button
                      className="button button--secondary"
                      type="button"
                      onClick={() => setForm({ entity: "project", mode: "create", realmId: realm.id, name: "" })}>
                      Добавить проект
                    </button>
                  </div>
                </header>
                <div className="realm-card__projects">
                  {projects.length ? (
                    projects.map((project) => {
                      const databases = workspace.databases.filter((database) => database.projectId === project.id);

                      return (
                        <article className="project-card" key={project.id}>
                          <div className="project-card__title">
                            <span>ПРОЕКТ</span>
                            <h3>{project.name}</h3>
                            <div className="entity-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  setForm({
                                    entity: "project",
                                    mode: "edit",
                                    value: project,
                                    name: project.name,
                                  })
                                }>
                                Редактировать
                              </button>
                              <button
                                className="entity-actions__danger"
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    entity: "project",
                                    id: project.id,
                                    name: project.name,
                                  })
                                }>
                                Удалить
                              </button>
                            </div>
                          </div>
                          <div className="database-list">
                            {databases.map((database) => (
                              <div className="database-row" key={database.id}>
                                <Link className="database-link" to={`/editor?databaseId=${database.id}`}>
                                  <span>{database.type}</span>
                                  <strong>{database.name}</strong>
                                  <b>Открыть ↗</b>
                                </Link>
                                <div className="entity-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setForm({
                                        entity: "database",
                                        mode: "edit",
                                        value: database,
                                        name: database.name,
                                      })
                                    }>
                                    Редактировать
                                  </button>
                                  <button
                                    className="entity-actions__danger"
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget({
                                        entity: "database",
                                        id: database.id,
                                        name: database.name,
                                      })
                                    }>
                                    Удалить
                                  </button>
                                </div>
                              </div>
                            ))}
                            {!databases.length && (
                              <p className="database-list__empty">В этом проекте пока нет баз данных.</p>
                            )}
                            <button
                              className="database-list__add"
                              type="button"
                              onClick={() =>
                                setForm({
                                  entity: "database",
                                  mode: "create",
                                  projectId: project.id,
                                  name: "",
                                })
                              }>
                              + База данных
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="realm-card__empty">В этом realm пока нет проектов.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="realms-page__empty">
          <h2>Пока нет realms</h2>
          <p>Создайте первый realm, затем проект и его базу данных.</p>
        </section>
      )}

      {form && (
        <div className="workspace-dialog" role="presentation" onMouseDown={() => setForm(null)}>
          <form className="workspace-dialog__card" onSubmit={submitForm} onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>{form.entity.toUpperCase()}</span>
                <h2>{formTitle[form.entity][form.mode]}</h2>
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setForm(null)}>
                X
              </button>
            </header>
            <label>
              Название
              <input name="name" defaultValue={form.name} autoFocus required />
            </label>
            {form.entity === "realm" && (
              <label>
                Slug
                <input
                  name="slug"
                  defaultValue={form.slug}
                  placeholder="например, identity"
                  pattern="[a-z0-9-]+"
                  required
                />
              </label>
            )}
            {saveMutation.isError && <p className="form-error">{saveMutation.error.message}</p>}
            <footer>
              <button type="button" className="button" onClick={() => setForm(null)}>
                Отмена
              </button>
              <button className="button button--primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Сохраняем..." : "Сохранить"}
              </button>
            </footer>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="workspace-dialog" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section
            className="workspace-dialog__card workspace-dialog__card--confirm"
            onMouseDown={(event) => event.stopPropagation()}>
            <h2>Удалить "{deleteTarget.name}"?</h2>
            <p>Дочерние сущности также будут удалены. Это действие нельзя отменить.</p>
            {deleteMutation.isError && <p className="form-error">{deleteMutation.error.message}</p>}
            <footer>
              <button type="button" className="button" onClick={() => setDeleteTarget(null)}>
                Отмена
              </button>
              <button
                type="button"
                className="button button--danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget)}>
                {deleteMutation.isPending ? "Удаляем..." : "Удалить"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
