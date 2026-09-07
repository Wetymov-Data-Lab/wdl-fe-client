import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Connection, ResizeParams } from "@xyflow/react";
import { column, database, group, loadWorkspace, project, realm, relationship, table } from "@/entities/schema/api";
import { getColumnIdFromHandle, relationshipExists } from "@/entities/schema/model/relationship-rules";
import { schemaQueryKeys } from "@/entities/schema/model/query-keys";
import { useAuth } from "@/features/auth/model/use-auth";
import { readCssColorToken } from "@/shared/lib/css-token";
import { DiagramEditor } from "@/widgets/diagram/ui/diagram-editor";
import { WorkspacePathPicker } from "@/widgets/workspace-path/ui/workspace-path-picker";

async function loadDiagram(databaseId: Schema.Id): Promise<Schema.Diagram> {
  const [tables, groups] = await Promise.all([table.listByDatabase(databaseId), group.listByDatabase(databaseId)]);
  const [columnGroups, relationships] = await Promise.all([
    Promise.all(tables.map((tableItem) => column.listByTable(tableItem.id))),
    relationship.listByDatabase(databaseId),
  ]);
  return { databaseId, tables, columns: columnGroups.flat(), relationships, groups };
}

export function EditorPage() {
  const auth = useAuth();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isTableFormOpen, setTableFormOpen] = useState(false);
  const [isGroupFormOpen, setGroupFormOpen] = useState(false);
  const [columnTable, setColumnTable] = useState<Schema.DatabaseTable | null>(null);
  const [editingTable, setEditingTable] = useState<Schema.DatabaseTable | null>(null);
  const [tableMenu, setTableMenu] = useState<{
    table: Schema.DatabaseTable;
    x: number;
    y: number;
  } | null>(null);
  const [columnMenu, setColumnMenu] = useState<{
    column: Schema.TableColumn;
    x: number;
    y: number;
  } | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);
  const [browserRealmId, setBrowserRealmId] = useState<Schema.Id | null>(null);
  const [browserProjectId, setBrowserProjectId] = useState<Schema.Id | null>(null);
  const requestedDatabaseId = params.get("databaseId");
  const workspaceQuery = useQuery({ queryKey: schemaQueryKeys.workspace, queryFn: loadWorkspace });
  const visibleRealmIds = new Set(workspaceQuery.data?.realms.map((realm) => realm.id) ?? []);
  const visibleProjectIds = new Set(
    workspaceQuery.data?.projects.filter((project) => visibleRealmIds.has(project.realmId)).map((project) => project.id) ??
      [],
  );
  const databaseId = workspaceQuery.data?.databases.find(
    (database) => database.id === requestedDatabaseId && visibleProjectIds.has(database.projectId),
  )?.id;
  const diagramQuery = useQuery({
    queryKey: schemaQueryKeys.diagram(databaseId),
    queryFn: () => loadDiagram(databaseId!),
    enabled: Boolean(databaseId),
  });
  const moveTable = useMutation<Schema.DatabaseTable | undefined, Error, { tableId: string; position: Schema.Position }>({
    mutationFn: ({ tableId, position }) => {
      const databaseTable = diagramQuery.data?.tables.find((item) => item.id === tableId);
      if (!databaseTable) return Promise.resolve<Schema.DatabaseTable | undefined>(undefined);
      return table.update(databaseTable, position);
    },
    onSuccess: (updatedTable) => {
      if (!updatedTable) return;
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              tables: diagram.tables.map((table) => (table.id === updatedTable.id ? updatedTable : table)),
            }
          : diagram,
      );
    },
  });
  const workspaceCreation = useMutation({
    mutationFn: async (input: Schema.CreateWorkspaceInput) => {
      const createdRealm = await realm.create({ name: input.realmName, slug: input.realmSlug });
      const createdProject = await project.create({
        realmId: createdRealm.id,
        name: input.projectName,
      });
      return database.create({ projectId: createdProject.id, name: input.databaseName });
    },
    onSuccess: async (database) => {
      await queryClient.invalidateQueries({ queryKey: schemaQueryKeys.workspace });
      setParams({ databaseId: database.id });
    },
  });
  const tableCreation = useMutation({
    mutationFn: ({ name, sortOrder }: { name: string; sortOrder: number }) =>
      table.create({ databaseId: databaseId!, name, sortOrder }),
    onSuccess: (table) => {
      setTableFormOpen(false);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, tables: [...diagram.tables, table] } : diagram,
      );
    },
  });
  const columnCreation = useMutation({
    mutationFn: ({ name, type }: { name: string; type: string }) =>
      column.create({
        tableId: columnTable!.id,
        name,
        type,
        sortOrder: diagramQuery.data?.columns.filter((columnItem) => columnItem.tableId === columnTable!.id).length ?? 0,
      }),
    onSuccess: (column) => {
      setColumnTable(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, columns: [...diagram.columns, column] } : diagram,
      );
    },
  });
  const tableUpdate = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      table.update({ ...editingTable!, name, color }, editingTable!.position),
    onSuccess: (table) => {
      setEditingTable(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              tables: diagram.tables.map((item) => (item.id === table.id ? table : item)),
            }
          : diagram,
      );
    },
  });
  const relationshipCreation = useMutation({
    mutationFn: (connection: Connection) =>
      relationship.create({
        databaseId: databaseId!,
        sourceTableId: connection.source!,
        targetTableId: connection.target!,
        sourceColumnId: getColumnIdFromHandle(connection.sourceHandle!),
        targetColumnId: getColumnIdFromHandle(connection.targetHandle!),
      }),
    onSuccess: (relationship) => {
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, relationships: [...diagram.relationships, relationship] } : diagram,
      );
    },
  });
  const columnDeletion = useMutation({
    mutationFn: column.delete,
    onSuccess: (_, columnId) => {
      setColumnMenu(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              columns: diagram.columns.filter((column) => column.id !== columnId),
              relationships: diagram.relationships.filter(
                (relationship) =>
                  !relationship.columnPairs.some(
                    (pair) => pair.sourceColumnId === columnId || pair.targetColumnId === columnId,
                  ),
              ),
            }
          : diagram,
      );
    },
  });
  const relationshipDeletion = useMutation({
    mutationFn: relationship.delete,
    onSuccess: (_, relationshipId) =>
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              relationships: diagram.relationships.filter((relationship) => relationship.id !== relationshipId),
            }
          : diagram,
      ),
  });
  const groupCreation = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      group.create({
        databaseId: databaseId!,
        name,
        position: { x: 80 + (diagramQuery.data?.groups.length ?? 0) * 40, y: 80 },
        width: 520,
        height: 340,
        color,
        isCollapsed: false,
        tableIds: [],
      }),
    onSuccess: (createdGroup) => {
      setGroupFormOpen(false);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, groups: [...diagram.groups, createdGroup] } : diagram,
      );
    },
  });
  const groupUpdate = useMutation({
    mutationFn: ({ value, changes }: { value: Schema.DiagramGroup; changes: Partial<Schema.DiagramGroup> }) =>
      group.update({ ...value, ...changes }),
    onSuccess: (updatedGroup) =>
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              groups: diagram.groups.map((item) => (item.id === updatedGroup.id ? updatedGroup : item)),
            }
          : diagram,
      ),
  });
  const groupDeletion = useMutation({
    mutationFn: group.delete,
    onSuccess: (_, deletedGroup) =>
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, groups: diagram.groups.filter((item) => item.id !== deletedGroup.id) } : diagram,
      ),
  });
  const mutateGroupUpdate = groupUpdate.mutate;
  const mutateGroupDeletion = groupDeletion.mutate;
  const moveGroup = useCallback(
    (value: Schema.DiagramGroup, position: Schema.Position) => mutateGroupUpdate({ value, changes: { position } }),
    [mutateGroupUpdate],
  );
  const resizeGroup = useCallback(
    (value: Schema.DiagramGroup, bounds: ResizeParams) =>
      mutateGroupUpdate({
        value,
        changes: {
          position: { x: bounds.x, y: bounds.y },
          width: bounds.width,
          height: bounds.height,
        },
      }),
    [mutateGroupUpdate],
  );
  const deleteGroup = useCallback((value: Schema.DiagramGroup) => mutateGroupDeletion(value), [mutateGroupDeletion]);
  const activeDatabase = workspaceQuery.data?.databases.find((database) => database.id === databaseId);
  const activeProject = workspaceQuery.data?.projects.find((project) => project.id === activeDatabase?.projectId);
  const activeRealm = workspaceQuery.data?.realms.find((realm) => realm.id === activeProject?.realmId);
  const canEdit = activeRealm?.authorId === auth.user?.sub;
  const visibleTables =
    diagramQuery.data?.tables.filter((table) => table.name.toLowerCase().includes(tableSearch.trim().toLowerCase())) ?? [];
  const selectedTable = diagramQuery.data?.tables.find((table) => table.id === selectedTableId) ?? null;
  const selectedColumns = selectedTable
    ? (diagramQuery.data?.columns.filter((column) => column.tableId === selectedTable.id) ?? [])
    : [];

  const selectRealm = (realmId: Schema.Id | null) => {
    setBrowserRealmId(realmId);
    setBrowserProjectId(null);
    setParams({}, { replace: true });
  };
  const selectProject = (projectId: Schema.Id | null) => {
    setBrowserProjectId(projectId);
    setParams({}, { replace: true });
  };
  const selectDatabase = (selectedDatabaseId: Schema.Id | null) => {
    if (selectedDatabaseId) setParams({ databaseId: selectedDatabaseId });
    else setParams({}, { replace: true });
  };
  const pathPicker = workspaceQuery.data ? (
    <WorkspacePathPicker
      workspace={workspaceQuery.data}
      realmId={activeRealm?.id ?? browserRealmId}
      projectId={activeProject?.id ?? browserProjectId}
      databaseId={databaseId ?? null}
      onRealmChange={selectRealm}
      onProjectChange={selectProject}
      onDatabaseChange={selectDatabase}
    />
  ) : null;

  const submitWorkspace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    workspaceCreation.mutate({
      realmName: String(form.get("realmName")),
      realmSlug: String(form.get("realmSlug")),
      projectName: String(form.get("projectName")),
      databaseName: String(form.get("databaseName")),
    });
  };
  const submitTable = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("tableName"));
    tableCreation.mutate({ name, sortOrder: diagramQuery.data?.tables.length ?? 0 });
  };
  const submitColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    columnCreation.mutate({
      name: String(form.get("columnName")),
      type: String(form.get("columnType")),
    });
  };
  const openColumnForm = useCallback((table: Schema.DatabaseTable) => setColumnTable(table), []);
  const openTableMenu = useCallback(
    (table: Schema.DatabaseTable, position: { x: number; y: number }) => setTableMenu({ table, ...position }),
    [],
  );
  const openColumnMenu = useCallback(
    (column: Schema.TableColumn, position: { x: number; y: number }) => setColumnMenu({ column, ...position }),
    [],
  );
  const createRelationshipFromConnection = useCallback(
    (connection: Connection) => {
      if (
        !connection.source ||
        !connection.target ||
        !connection.sourceHandle ||
        !connection.targetHandle ||
        connection.source === connection.target
      )
        return;
      const sourceColumnId = getColumnIdFromHandle(connection.sourceHandle);
      const targetColumnId = getColumnIdFromHandle(connection.targetHandle);
      const hasDuplicateRelationship = relationshipExists(
        diagramQuery.data?.relationships ?? [],
        sourceColumnId,
        targetColumnId,
      );

      if (hasDuplicateRelationship) {
        setConnectionWarning("Такая связь между колонками уже существует.");
        return;
      }
      setConnectionWarning(null);
      relationshipCreation.mutate(connection);
    },
    [diagramQuery.data?.relationships, relationshipCreation],
  );
  const submitTableEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    tableUpdate.mutate({
      name: String(form.get("tableName")),
      color: String(form.get("tableColor")),
    });
  };
  const submitGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    groupCreation.mutate({ name: String(form.get("groupName")), color: String(form.get("groupColor")) });
  };
  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTableMenu(null);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);

  if (workspaceQuery.isLoading && !requestedDatabaseId) {
    return (
      <main className="editor-state">
        <div>
          <span className="editor-state__eyebrow">WDL Core API</span>
          <h1>Загружаем рабочее пространство...</h1>
        </div>
      </main>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <main className="editor-state editor-state--error">
        <div>
          <span className="editor-state__eyebrow">Ошибка подключения</span>
          <h1>Не удалось получить данные Core API</h1>
          <p>
            Проверьте <code>CORE_API_URL</code> и доступность сервиса.
          </p>
        </div>
      </main>
    );
  }

  if (!databaseId && workspaceQuery.data?.realms.length) {
    return (
      <main className="editor-state editor-state--picker">
        <div>
          <span className="editor-state__eyebrow">Навигация по схемам</span>
          <h1>{requestedDatabaseId ? "Схема недоступна" : "Выберите базу данных"}</h1>
          <p>
            {requestedDatabaseId
              ? "Эта база данных отсутствует среди доступных вам realms. Выберите другую схему."
              : "Редактор загрузит диаграмму только после вашего явного выбора."}
          </p>
          {pathPicker}
          <Link className="button button--secondary editor-state__manage-link" to="/realms">
            Управление пространствами
          </Link>
        </div>
      </main>
    );
  }

  if (!databaseId) {
    return (
      <main className="editor-state">
        <div>
          <span className="editor-state__eyebrow">WDL Core API</span>
          <h1>Создайте первое рабочее пространство</h1>
          <p>Будут созданы realm, project и PostgreSQL database.</p>
          <form className="creation-form" onSubmit={submitWorkspace}>
            <input name="realmName" placeholder="Realm, например Acme" required />
            <input name="realmSlug" placeholder="realm-slug" pattern="[a-z0-9-]+" required />
            <input name="projectName" placeholder="Проект" required />
            <input name="databaseName" placeholder="База данных" required />
            <button className="button button--primary" disabled={workspaceCreation.isPending}>
              {workspaceCreation.isPending ? "Создаем..." : "Создать workspace"}
            </button>
            {workspaceCreation.isError && <p className="form-error">{workspaceCreation.error.message}</p>}
          </form>
        </div>
      </main>
    );
  }

  if (diagramQuery.isError) {
    return (
      <main className="editor-state editor-state--error">
        <div>
          <span className="editor-state__eyebrow">Ошибка диаграммы</span>
          <h1>Не удалось получить таблицы и связи</h1>
          <p>База данных выбрана, но Core API не вернул её схему.</p>
        </div>
      </main>
    );
  }

  if (diagramQuery.isLoading || !diagramQuery.data) {
    return (
      <main className="editor-state">
        <div>
          <span className="editor-state__eyebrow">{activeDatabase?.name ?? databaseId}</span>
          <h1>Загружаем диаграмму...</h1>
        </div>
      </main>
    );
  }

  return (
    <main
      className="workspace"
      onClick={() => {
        setTableMenu(null);
        setColumnMenu(null);
      }}>
      <header className="workspace__topbar">
        {pathPicker}
        <div className="workspace__actions">
          <button className="button button--secondary">Экспорт SQL</button>
          {canEdit ? (
            <>
              <button className="button button--secondary" onClick={() => setGroupFormOpen(true)}>
                + Область
              </button>
              <button className="button button--primary" onClick={() => setTableFormOpen(true)}>
                + Таблица
              </button>
            </>
          ) : (
            <span className="demo-badge">ТОЛЬКО ЧТЕНИЕ</span>
          )}
        </div>
      </header>
      <div className="workspace__body">
        <aside className="schema-explorer">
          <div className="schema-explorer__head">
            <span className="schema-explorer__label">СХЕМА</span>
            {canEdit && (
              <button className="icon-button" type="button" title="Добавить таблицу" onClick={() => setTableFormOpen(true)}>
                +
              </button>
            )}
          </div>
          <div className="database-card">
            <span className="database-card__engine">{activeDatabase?.type ?? "database"}</span>
            <strong>{activeDatabase?.name ?? databaseId}</strong>
            <small>{diagramQuery.data.tables.length} таблиц</small>
            {activeDatabase && (
              <small title={activeDatabase.authorId}>
                Автор: {activeDatabase.authorId === auth.user?.sub ? "вы" : `${activeDatabase.authorId.slice(0, 8)}…`}
              </small>
            )}
          </div>
          <label className="table-search">
            <input
              value={tableSearch}
              onChange={(event) => setTableSearch(event.target.value)}
              placeholder="Поиск таблиц"
            />
          </label>
          <div className="schema-explorer__section">
            <span>ТАБЛИЦЫ</span>
            <b>{visibleTables.length}</b>
          </div>
          <div className="table-list">
            {visibleTables.map((table) => (
              <button
                key={table.id}
                className={`table-list__item ${selectedTableId === table.id ? "table-list__item--active" : ""}`}
                type="button"
                onClick={() => setSelectedTableId(table.id)}>
                <i style={{ background: table.color ?? "var(--color-accent)" }} />
                <span>{table.name}</span>
                <small>{diagramQuery.data.columns.filter((column) => column.tableId === table.id).length}</small>
              </button>
            ))}
          </div>
          {selectedTable && (
            <div className="table-inspector">
              <div className="schema-explorer__section">
                <span>ПОЛЯ: {selectedTable.name}</span>
                <button type="button" onClick={() => openColumnForm(selectedTable)}>
                  +
                </button>
              </div>
              {selectedColumns.map((column) => (
                <div className="field-preview" key={column.id}>
                  <span>{column.primaryKey ? `PK ${column.name}` : column.name}</span>
                  <small>{column.type}</small>
                </div>
              ))}
            </div>
          )}
        </aside>
        <section className="workspace__canvas">
          <DiagramEditor
            diagram={diagramQuery.data}
            editable={canEdit}
            onTableMove={canEdit ? (tableId, position) => moveTable.mutate({ tableId, position }) : undefined}
            onTableContextMenu={canEdit ? openTableMenu : undefined}
            onColumnContextMenu={canEdit ? openColumnMenu : undefined}
            onRelationshipCreate={canEdit ? createRelationshipFromConnection : undefined}
            onRelationshipDelete={canEdit ? (relationshipId) => relationshipDeletion.mutate(relationshipId) : undefined}
            onGroupMove={canEdit ? moveGroup : undefined}
            onGroupResize={canEdit ? resizeGroup : undefined}
            onGroupDelete={canEdit ? deleteGroup : undefined}
            onCanvasClick={() => {
              setTableMenu(null);
              setColumnMenu(null);
            }}
          />
        </section>
      </div>
      {isTableFormOpen && (
        <form className="table-create-form" onSubmit={submitTable}>
          <input name="tableName" placeholder="Название таблицы" autoFocus required />
          <button className="button button--primary" disabled={tableCreation.isPending}>
            {tableCreation.isPending ? "Создаем..." : "Создать"}
          </button>
          <button className="button" type="button" onClick={() => setTableFormOpen(false)}>
            Отмена
          </button>
          {tableCreation.isError && <span className="form-error">{tableCreation.error.message}</span>}
        </form>
      )}
      {isGroupFormOpen && (
        <div className="editor-overlay">
          <form className="editor-drawer" onSubmit={submitGroup}>
            <header>
              <div>
                <span>КАНВАС</span>
                <strong>{activeDatabase?.name}</strong>
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setGroupFormOpen(false)}>
                X
              </button>
            </header>
            <h2>Новая цветовая область</h2>
            <label>
              Название области
              <input name="groupName" placeholder="Например, Identity" autoFocus required />
            </label>
            <label className="table-color-control">
              Цвет
              <span>
                <input
                  type="color"
                  name="groupColor"
                  defaultValue={readCssColorToken("--color-accent")}
                  aria-label="Цвет области"
                />
                <small>Область появится позади таблиц; её можно перемещать и менять по размеру.</small>
              </span>
            </label>
            <footer>
              <button className="button" type="button" onClick={() => setGroupFormOpen(false)}>
                Отмена
              </button>
              <button className="button button--primary" disabled={groupCreation.isPending}>
                {groupCreation.isPending ? "Создаем..." : "Создать область"}
              </button>
            </footer>
            {groupCreation.isError && <p className="form-error">{groupCreation.error.message}</p>}
          </form>
        </div>
      )}
      {columnTable && (
        <div className="editor-overlay">
          <form className="editor-drawer" onSubmit={submitColumn}>
            <header>
              <div>
                <span>ТАБЛИЦА</span>
                <strong>{columnTable.name}</strong>
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setColumnTable(null)}>
                X
              </button>
            </header>
            <h2>Новая колонка</h2>
            <label>
              Имя колонки
              <input name="columnName" placeholder="например, account_id" autoComplete="off" autoFocus required />
            </label>
            <label>
              Тип
              <select name="columnType" defaultValue="varchar">
                <option value="varchar">varchar</option>
                <option value="uuid">uuid</option>
                <option value="integer">integer</option>
                <option value="numeric">numeric</option>
                <option value="boolean">boolean</option>
                <option value="timestamptz">timestamptz</option>
              </select>
            </label>
            <footer>
              <button className="button" type="button" onClick={() => setColumnTable(null)}>
                Отмена
              </button>
              <button className="button button--primary" disabled={columnCreation.isPending}>
                {columnCreation.isPending ? "Создаем..." : "Добавить колонку"}
              </button>
            </footer>
            {columnCreation.isError && <p className="form-error">{columnCreation.error.message}</p>}
          </form>
        </div>
      )}
      {editingTable && (
        <div className="editor-overlay">
          <form className="editor-drawer" onSubmit={submitTableEdit}>
            <header>
              <div>
                <span>СХЕМА</span>
                <strong>{activeDatabase?.name}</strong>
              </div>
              <button type="button" aria-label="Закрыть" onClick={() => setEditingTable(null)}>
                X
              </button>
            </header>
            <h2>Редактирование таблицы</h2>
            <label>
              Название таблицы
              <input name="tableName" defaultValue={editingTable.name} autoComplete="off" autoFocus required />
            </label>
            <label className="table-color-control">
              Цвет таблицы
              <span>
                <input
                  type="color"
                  name="tableColor"
                  defaultValue={editingTable.color ?? readCssColorToken("--color-accent")}
                  aria-label="Цвет таблицы"
                />
                <small>Используйте цвет, чтобы обозначить назначение таблицы на схеме.</small>
              </span>
            </label>
            <footer>
              <button className="button" type="button" onClick={() => setEditingTable(null)}>
                Отмена
              </button>
              <button className="button button--primary" disabled={tableUpdate.isPending}>
                {tableUpdate.isPending ? "Сохраняем..." : "Сохранить"}
              </button>
            </footer>
            {tableUpdate.isError && <p className="form-error">{tableUpdate.error.message}</p>}
          </form>
        </div>
      )}
      {tableMenu && (
        <div className="table-context-menu" style={{ left: tableMenu.x, top: tableMenu.y }}>
          <strong>{tableMenu.table.name}</strong>
          <button
            type="button"
            onClick={() => {
              setColumnTable(tableMenu.table);
              setTableMenu(null);
            }}>
            Добавить колонку <kbd>Cmd+Enter</kbd>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTable(tableMenu.table);
              setTableMenu(null);
            }}>
            Редактировать таблицу
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTableId(tableMenu.table.id);
              setTableMenu(null);
            }}>
            Показать поля
          </button>
        </div>
      )}
      {columnMenu && (
        <div className="table-context-menu" style={{ left: columnMenu.x, top: columnMenu.y }}>
          <strong>{columnMenu.column.name}</strong>
          <button type="button" onClick={() => columnDeletion.mutate(columnMenu.column.id)}>
            Удалить колонку <kbd>Backspace</kbd>
          </button>
          {columnDeletion.isError && <p className="form-error">{columnDeletion.error.message}</p>}
        </div>
      )}
      {(relationshipCreation.isError || connectionWarning) && (
        <div className="connection-warning">
          Связь не создана: {connectionWarning ?? relationshipCreation.error?.message}
        </div>
      )}
      {(groupUpdate.isError || groupDeletion.isError) && (
        <div className="connection-warning">
          Область не обновлена: {groupUpdate.error?.message ?? groupDeletion.error?.message}
        </div>
      )}
      <div className="canvas-hint">
        Колесо: масштаб. Space + перетаскивание: панорама. Выберите область, чтобы изменить её размер.
      </div>
    </main>
  );
}
