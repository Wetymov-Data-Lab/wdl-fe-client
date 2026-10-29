import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Connection, ResizeParams } from "@xyflow/react";
import {
  column,
  database,
  group,
  history,
  loadWorkspace,
  project,
  realm,
  relationship,
  table,
  tableIndex,
} from "@/entities/schema/api";
import { formatHistoryAction } from "@/entities/schema/model/history-actions";
import { getColumnIdFromHandle, relationshipExists } from "@/entities/schema/model/relationship-rules";
import { schemaQueryKeys } from "@/entities/schema/model/query-keys";
import { useAuth } from "@/features/auth/model/use-auth";
import { ProfileLink } from "@/entities/identity/ui/profile-link";
import {
  clearLastSelectedDatabaseId,
  readLastSelectedDatabaseId,
  writeLastSelectedDatabaseId,
} from "@/pages/editor/model/editor-selection-storage";
import {
  formatCardinality,
  formatIndexType,
  formatReferentialAction,
  readIndexForm,
  readRelationshipForm,
  readTableChecks,
} from "@/pages/editor/model/constraint-form";
import { IndexFormFields, TableChecksFields } from "@/pages/editor/ui/constraint-form-fields";
import { readCssColorToken } from "@/shared/lib/css-token";
import { isTypingTarget } from "@/shared/lib/is-typing-target";
import { ErrorNotification } from "@/shared/ui/error-notification";
import { DiagramEditor, type TableFocusRequest } from "@/widgets/diagram/ui/diagram-editor";
import { CommandPalette, type CommandPaletteItem } from "@/widgets/command-palette/ui/command-palette";
import { SearchIcon } from "@/shared/ui/icons";
import { WorkspacePathPicker } from "@/widgets/workspace-path/ui/workspace-path-picker";

const sidebarMinWidth = 360;
const sidebarMaxWidth = 640;

function optionalString(form: FormData, field: string): string | null {
  const value = String(form.get(field) ?? "").trim();
  return value || null;
}

function optionalNumber(form: FormData, field: string): number | null {
  const value = optionalString(form, field);
  return value === null ? null : Number(value);
}

function readColumnForm(form: FormData): Schema.UpdateColumnInput {
  return {
    name: String(form.get("columnName")).trim(),
    type: String(form.get("columnType")) as Schema.ColumnType,
    customType: optionalString(form, "customType"),
    length: optionalNumber(form, "length"),
    precision: optionalNumber(form, "precision"),
    scale: optionalNumber(form, "scale"),
    arrayDimensions: Number(form.get("arrayDimensions")),
    nullable: form.has("nullable"),
    primaryKey: form.has("primaryKey"),
    unique: form.has("unique"),
    autoIncrement: form.has("autoIncrement"),
    unsigned: form.has("unsigned"),
    defaultValue: optionalString(form, "defaultValue"),
    check: optionalString(form, "check"),
    enumValues: String(form.get("enumValues") ?? "")
      .split(/[,\n]/)
      .map((value) => value.trim())
      .filter(Boolean),
    sortOrder: Number(form.get("sortOrder")),
    notice: optionalString(form, "notice"),
  };
}

function ColumnFormFields({
  value,
  columnTypes,
  defaultSortOrder,
}: {
  value?: Schema.TableColumn;
  columnTypes: Schema.ColumnType[];
  defaultSortOrder: number;
}) {
  return (
    <>
      <div className="column-form-grid">
        <label>
          Имя колонки
          <input
            name="columnName"
            defaultValue={value?.name ?? ""}
            placeholder="например, account_id"
            autoComplete="off"
            autoFocus
            required
          />
        </label>
        <label>
          Тип
          <select name="columnType" defaultValue={value?.type ?? "varchar"}>
            {columnTypes.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Пользовательский тип
          <input name="customType" defaultValue={value?.customType ?? ""} maxLength={255} />
        </label>
        <label>
          Длина
          <input name="length" type="number" min="1" defaultValue={value?.length ?? ""} />
        </label>
        <label>
          Точность
          <input name="precision" type="number" min="1" defaultValue={value?.precision ?? ""} />
        </label>
        <label>
          Масштаб
          <input name="scale" type="number" min="0" defaultValue={value?.scale ?? ""} />
        </label>
        <label>
          Размерность массива
          <input name="arrayDimensions" type="number" min="0" max="8" defaultValue={value?.arrayDimensions ?? 0} required />
        </label>
        <label>
          Порядок
          <input name="sortOrder" type="number" min="0" defaultValue={value?.sortOrder ?? defaultSortOrder} required />
        </label>
      </div>
      <fieldset className="column-form-flags">
        <legend>Ограничения</legend>
        <label>
          <input name="nullable" type="checkbox" defaultChecked={value?.nullable ?? true} /> NULL
        </label>
        <label>
          <input name="primaryKey" type="checkbox" defaultChecked={value?.primaryKey ?? false} /> Primary key
        </label>
        <label>
          <input name="unique" type="checkbox" defaultChecked={value?.unique ?? false} /> Unique
        </label>
        <label>
          <input name="autoIncrement" type="checkbox" defaultChecked={value?.autoIncrement ?? false} /> Auto increment
        </label>
        <label>
          <input name="unsigned" type="checkbox" defaultChecked={value?.unsigned ?? false} /> Unsigned
        </label>
      </fieldset>
      <label>
        Значение по умолчанию
        <input name="defaultValue" defaultValue={value?.defaultValue ?? ""} maxLength={2000} />
      </label>
      <label>
        CHECK-выражение
        <textarea name="check" defaultValue={value?.check ?? ""} maxLength={4000} rows={3} />
      </label>
      <label>
        Значения enum
        <textarea
          name="enumValues"
          defaultValue={value?.enumValues.join(", ") ?? ""}
          placeholder="draft, active, archived"
          rows={2}
        />
      </label>
      <label>
        Примечание
        <input name="notice" defaultValue={value?.notice ?? ""} maxLength={255} />
      </label>
    </>
  );
}

async function loadDiagram(databaseId: Schema.Id): Promise<Schema.Diagram> {
  const [tables, groups] = await Promise.all([table.listByDatabase(databaseId), group.listByDatabase(databaseId)]);
  const [columnGroups, indexGroups, relationships] = await Promise.all([
    Promise.all(tables.map((tableItem) => column.listByTable(tableItem.id))),
    Promise.all(tables.map((tableItem) => tableIndex.listByTable(tableItem.id))),
    relationship.listByDatabase(databaseId),
  ]);
  return { databaseId, tables, columns: columnGroups.flat(), indexes: indexGroups.flat(), relationships, groups };
}

export function EditorPage() {
  const auth = useAuth();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isTableFormOpen, setTableFormOpen] = useState(false);
  const [isGroupFormOpen, setGroupFormOpen] = useState(false);
  const [columnTable, setColumnTable] = useState<Schema.DatabaseTable | null>(null);
  const [editingColumn, setEditingColumn] = useState<Schema.TableColumn | null>(null);
  const [editingTable, setEditingTable] = useState<Schema.DatabaseTable | null>(null);
  const [editingRelationshipId, setEditingRelationshipId] = useState<Schema.Id | null>(null);
  const [indexForm, setIndexForm] = useState<{ table: Schema.DatabaseTable; index?: Schema.TableIndex } | null>(null);
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
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [tableFocusRequest, setTableFocusRequest] = useState<TableFocusRequest | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [browserRealmId, setBrowserRealmId] = useState<Schema.Id | null>(null);
  const [browserProjectId, setBrowserProjectId] = useState<Schema.Id | null>(null);
  const requestedDatabaseId = params.get("databaseId");
  const [restoredDatabaseId, setRestoredDatabaseId] = useState<Schema.Id | null>(() =>
    requestedDatabaseId ? null : readLastSelectedDatabaseId(),
  );
  const workspaceQuery = useQuery({ queryKey: schemaQueryKeys.workspace, queryFn: loadWorkspace });
  const visibleRealmIds = new Set(workspaceQuery.data?.realms.map((realm) => realm.id) ?? []);
  const visibleProjectIds = new Set(
    workspaceQuery.data?.projects.filter((project) => visibleRealmIds.has(project.realmId)).map((project) => project.id) ??
      [],
  );
  const databaseId = workspaceQuery.data?.databases.find(
    (database) => database.id === (requestedDatabaseId ?? restoredDatabaseId) && visibleProjectIds.has(database.projectId),
  )?.id;
  const diagramQuery = useQuery({
    queryKey: schemaQueryKeys.diagram(databaseId),
    queryFn: () => loadDiagram(databaseId!),
    enabled: Boolean(databaseId),
  });
  const historyQuery = useQuery({
    queryKey: schemaQueryKeys.history(databaseId),
    queryFn: () => history.get(databaseId!),
    enabled: Boolean(databaseId),
  });
  const historyStep = useMutation({
    mutationFn: (direction: "undo" | "redo") =>
      direction === "undo" ? history.undo(databaseId!) : history.redo(databaseId!),
    onSuccess: async (state) => {
      queryClient.setQueryData(schemaQueryKeys.history(databaseId), state);
      await queryClient.invalidateQueries({ queryKey: schemaQueryKeys.diagram(databaseId) });
    },
  });
  const moveTable = useMutation<Schema.DatabaseTable | undefined, Error, { tableId: string; position: Schema.Position }>({
    mutationFn: ({ tableId, position }) => {
      const databaseTable = diagramQuery.data?.tables.find((item) => item.id === tableId);
      if (!databaseTable) return Promise.resolve<Schema.DatabaseTable | undefined>(undefined);
      return table.update(databaseTable, position);
    },
    // Сразу кладём позицию в кэш: иначе ответ по одной таблице перерисует канвас
    // и вернёт остальные перемещённые таблицы на старые места до их собственных ответов.
    onMutate: ({ tableId, position }) =>
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? { ...diagram, tables: diagram.tables.map((item) => (item.id === tableId ? { ...item, position } : item)) }
          : diagram,
      ),
    onError: () => queryClient.invalidateQueries({ queryKey: schemaQueryKeys.diagram(databaseId) }),
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
  const sqlExport = useMutation({
    mutationFn: async (selectedDatabaseId: Schema.Id) => {
      const blob = await database.exportSql(selectedDatabaseId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wdl-${selectedDatabaseId}.sql`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  });
  const resetSqlExport = sqlExport.reset;
  useEffect(() => {
    resetSqlExport();
  }, [databaseId, resetSqlExport]);
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
    mutationFn: column.create,
    onSuccess: (column) => {
      setColumnTable(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, columns: [...diagram.columns, column] } : diagram,
      );
    },
  });
  const tableUpdate = useMutation({
    mutationFn: ({ name, color, checks }: { name: string; color: string; checks: Schema.TableCheck[] }) =>
      table.update({ ...editingTable!, name, color, checks }, editingTable!.position),
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
              indexes: diagram.indexes.map((index) => ({
                ...index,
                columns: index.columns.filter((member) => member.columnId !== columnId),
              })),
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
  const columnUpdate = useMutation({
    mutationFn: ({ columnId, input }: { columnId: Schema.Id; input: Schema.UpdateColumnInput }) =>
      column.update(columnId, input),
    onSuccess: (updatedColumn) => {
      setEditingColumn(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              columns: diagram.columns.map((item) => (item.id === updatedColumn.id ? updatedColumn : item)),
            }
          : diagram,
      );
    },
  });
  const indexSave = useMutation({
    mutationFn: ({ tableId, indexId, input }: { tableId: Schema.Id; indexId?: Schema.Id; input: Schema.IndexInput }) =>
      indexId ? tableIndex.update(indexId, input) : tableIndex.create(tableId, input),
    onSuccess: (savedIndex) => {
      setIndexForm(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              indexes: diagram.indexes.some((item) => item.id === savedIndex.id)
                ? diagram.indexes.map((item) => (item.id === savedIndex.id ? savedIndex : item))
                : [...diagram.indexes, savedIndex],
            }
          : diagram,
      );
    },
  });
  const indexDeletion = useMutation({
    mutationFn: tableIndex.delete,
    onSuccess: (_, indexId) =>
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram ? { ...diagram, indexes: diagram.indexes.filter((item) => item.id !== indexId) } : diagram,
      ),
  });
  const relationshipUpdate = useMutation({
    mutationFn: ({ value, input }: { value: Schema.Relationship; input: Schema.UpdateRelationshipInput }) =>
      relationship.update(value, input),
    onSuccess: (updatedRelationship) => {
      setEditingRelationshipId(null);
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? {
              ...diagram,
              relationships: diagram.relationships.map((item) =>
                item.id === updatedRelationship.id ? updatedRelationship : item,
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
    onMutate: ({ value, changes }) =>
      queryClient.setQueryData<Schema.Diagram>(schemaQueryKeys.diagram(databaseId), (diagram) =>
        diagram
          ? { ...diagram, groups: diagram.groups.map((item) => (item.id === value.id ? { ...item, ...changes } : item)) }
          : diagram,
      ),
    onError: () => queryClient.invalidateQueries({ queryKey: schemaQueryKeys.diagram(databaseId) }),
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
  const hasPendingChanges = [
    moveTable,
    workspaceCreation,
    tableCreation,
    columnCreation,
    tableUpdate,
    relationshipCreation,
    columnDeletion,
    columnUpdate,
    indexSave,
    indexDeletion,
    relationshipUpdate,
    relationshipDeletion,
    groupCreation,
    groupUpdate,
    groupDeletion,
  ].some((mutation) => mutation.isPending);
  const hadPendingChanges = useRef(false);
  useEffect(() => {
    // Каждое сохранённое изменение может добавить шаг в историю или очистить redo.
    if (hadPendingChanges.current && !hasPendingChanges) {
      void queryClient.invalidateQueries({ queryKey: schemaQueryKeys.history(databaseId) });
    }
    hadPendingChanges.current = hasPendingChanges;
  }, [databaseId, hasPendingChanges, queryClient]);
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
  const selectedIndexes = selectedTable
    ? (diagramQuery.data?.indexes.filter((index) => index.tableId === selectedTable.id) ?? [])
    : [];
  const columnNamesById = new Map(diagramQuery.data?.columns.map((column) => [column.id, column.name]) ?? []);
  const isOverlayOpen =
    isTableFormOpen ||
    isGroupFormOpen ||
    isCommandPaletteOpen ||
    Boolean(columnTable || editingTable || editingColumn || indexForm || editingRelationshipId);
  const canStepHistory = canEdit && !hasPendingChanges && !historyStep.isPending && !isOverlayOpen;
  const undoAction = historyQuery.data?.undoAction ?? null;
  const redoAction = historyQuery.data?.redoAction ?? null;
  const canUndo = canStepHistory && undoAction !== null;
  const canRedo = canStepHistory && redoAction !== null;
  const undoTitle = undoAction ? `Отменить: ${formatHistoryAction(undoAction)}` : "Нечего отменять";
  const redoTitle = redoAction ? `Повторить: ${formatHistoryAction(redoAction)}` : "Нечего повторять";
  const stepHistory = historyStep.mutate;
  const resetHistoryStep = historyStep.reset;
  useEffect(() => {
    const handleHistoryHotkey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "z" || !(event.metaKey || event.ctrlKey) || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      if (event.shiftKey ? canRedo : canUndo) stepHistory(event.shiftKey ? "redo" : "undo");
    };
    window.addEventListener("keydown", handleHistoryHotkey);
    return () => window.removeEventListener("keydown", handleHistoryHotkey);
  }, [canRedo, canUndo, stepHistory]);

  useEffect(() => {
    if (!workspaceQuery.data) return;

    if (requestedDatabaseId && databaseId) {
      writeLastSelectedDatabaseId(databaseId);
      return;
    }

    if (!requestedDatabaseId && restoredDatabaseId) {
      if (databaseId) {
        setParams({ databaseId }, { replace: true });
      } else {
        clearLastSelectedDatabaseId();
      }
    }
  }, [databaseId, requestedDatabaseId, restoredDatabaseId, setParams, workspaceQuery.data]);

  const selectRealm = (realmId: Schema.Id | null) => {
    setRestoredDatabaseId(null);
    setBrowserRealmId(realmId);
    setBrowserProjectId(null);
    setParams({}, { replace: true });
  };
  const selectProject = (projectId: Schema.Id | null) => {
    setRestoredDatabaseId(null);
    setBrowserProjectId(projectId);
    setParams({}, { replace: true });
  };
  const selectDatabase = (selectedDatabaseId: Schema.Id | null) => {
    setRestoredDatabaseId(null);
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
      tableId: columnTable!.id,
      ...readColumnForm(form),
    });
  };
  const submitColumnEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    columnUpdate.mutate({
      columnId: editingColumn!.id,
      input: readColumnForm(form),
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
      checks: readTableChecks(form),
    });
  };
  const submitRelationship = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    relationshipUpdate.mutate({
      value: editingRelationship!,
      input: readRelationshipForm(new FormData(event.currentTarget)),
    });
  };
  const submitIndex = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    indexSave.mutate({
      tableId: indexForm!.table.id,
      indexId: indexForm!.index?.id,
      input: readIndexForm(new FormData(event.currentTarget)),
    });
  };
  const submitGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    groupCreation.mutate({ name: String(form.get("groupName")), color: String(form.get("groupColor")) });
  };
  useEffect(() => {
    const closeOverlays = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setTableFormOpen(false);
      setGroupFormOpen(false);
      setColumnTable(null);
      setEditingTable(null);
      setEditingColumn(null);
      setIndexForm(null);
      setEditingRelationshipId(null);
      setTableMenu(null);
      setColumnMenu(null);
    };
    window.addEventListener("keydown", closeOverlays);
    return () => window.removeEventListener("keydown", closeOverlays);
  }, []);
  useEffect(() => {
    const toggleCommandPalette = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setCommandPaletteOpen((isOpen) => !isOpen);
    };
    window.addEventListener("keydown", toggleCommandPalette);
    return () => window.removeEventListener("keydown", toggleCommandPalette);
  }, []);
  const focusTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setTableFocusRequest((request) => ({ tableId, requestId: (request?.requestId ?? 0) + 1 }));
  }, []);
  const openTableForm = useCallback(() => setTableFormOpen(true), []);
  const openGroupForm = useCallback(() => setGroupFormOpen(true), []);

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
          <h1>{requestedDatabaseId ? "Схема недоступна" : "Выберите базу данных"}</h1>
          <p>
            {requestedDatabaseId ? "Эта база данных отсутствует среди доступных вам realms. Выберите другую схему." : ""}
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

  const enumCatalog = workspaceQuery.data!.enums;
  const diagramTables = diagramQuery.data?.tables ?? [];
  const tableNamesById = new Map(diagramTables.map((table) => [table.id, table.name]));
  const editingRelationship = diagramQuery.data.relationships.find((item) => item.id === editingRelationshipId) ?? null;
  const commandPaletteItems: CommandPaletteItem[] = [
    ...diagramTables.map((table) => ({
      id: `table-${table.id}`,
      group: "Таблицы",
      kind: "TBL",
      label: table.name,
      hint: table.schemaName ?? undefined,
      onSelect: () => focusTable(table.id),
    })),
    ...(diagramQuery.data?.columns ?? []).map((column) => ({
      id: `column-${column.id}`,
      group: "Колонки",
      kind: "COL",
      label: `${tableNamesById.get(column.tableId) ?? "?"}.${column.name}`,
      hint: column.type,
      onSelect: () => focusTable(column.tableId),
    })),
    {
      id: "command-create-table",
      group: "Команды",
      kind: "CMD",
      label: "Создать таблицу",
      hotkey: "T",
      disabled: !canEdit,
      onSelect: openTableForm,
    },
    {
      id: "command-create-group",
      group: "Команды",
      kind: "CMD",
      label: "Создать область",
      hotkey: "A",
      disabled: !canEdit,
      onSelect: openGroupForm,
    },
    {
      id: "command-undo",
      group: "Команды",
      kind: "CMD",
      label: undoTitle,
      disabled: !undoAction || !canEdit || hasPendingChanges || historyStep.isPending,
      onSelect: () => stepHistory("undo"),
    },
    {
      id: "command-redo",
      group: "Команды",
      kind: "CMD",
      label: redoTitle,
      disabled: !redoAction || !canEdit || hasPendingChanges || historyStep.isPending,
      onSelect: () => stepHistory("redo"),
    },
    {
      id: "command-export-sql",
      group: "Команды",
      kind: "CMD",
      label: "Экспорт SQL",
      disabled: sqlExport.isPending || hasPendingChanges || activeDatabase?.type !== "psql",
      onSelect: () => sqlExport.mutate(databaseId),
    },
  ];

  return (
    <>
      {sqlExport.isError && (
        <ErrorNotification
          title="Не удалось экспортировать SQL"
          message={sqlExport.error.message}
          onClose={resetSqlExport}
        />
      )}
      {historyStep.isError && (
        <ErrorNotification
          title={historyStep.variables === "redo" ? "Не удалось повторить действие" : "Не удалось отменить действие"}
          message={historyStep.error.message}
          onClose={resetHistoryStep}
        />
      )}
      {isCommandPaletteOpen && <CommandPalette items={commandPaletteItems} onClose={() => setCommandPaletteOpen(false)} />}
      <main
        className="workspace"
        onClick={() => {
          if (isTableFormOpen) setTableFormOpen(false);
          setTableMenu(null);
          setColumnMenu(null);
        }}>
        <header className="workspace__topbar">
          {pathPicker}
          <div className="workspace__actions">
            <button className="workspace__search" type="button" onClick={() => setCommandPaletteOpen(true)}>
              <SearchIcon />
              <span>Поиск</span>
              <kbd className="kbd">⌘K</kbd>
            </button>
            <button
              className="button button--secondary"
              type="button"
              disabled={sqlExport.isPending || hasPendingChanges || activeDatabase?.type !== "psql"}
              title={activeDatabase?.type !== "psql" ? "Экспорт SQL пока доступен для PostgreSQL" : undefined}
              onClick={() => sqlExport.mutate(databaseId)}>
              {sqlExport.isPending ? "Генерируем SQL…" : "Экспорт SQL"}
            </button>
            {canEdit ? (
              <>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={!canUndo}
                  title={`${undoTitle} (Ctrl+Z)`}
                  aria-label={undoTitle}
                  onClick={() => stepHistory("undo")}>
                  Отменить
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={!canRedo}
                  title={`${redoTitle} (Ctrl+Shift+Z)`}
                  aria-label={redoTitle}
                  onClick={() => stepHistory("redo")}>
                  Повторить
                </button>
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
          <aside className="schema-explorer" style={{ width: sidebarWidth }}>
            <div className="schema-explorer__head">
              <span className="schema-explorer__label">СХЕМА</span>
              {canEdit && (
                <button
                  className="icon-button"
                  type="button"
                  title="Добавить таблицу"
                  onClick={() => setTableFormOpen(true)}>
                  +
                </button>
              )}
            </div>
            <div className="database-card">
              <div className="database-card__topline">
                <span className="database-card__engine">{activeDatabase?.type ?? "database"}</span>
                <small>{diagramQuery.data.tables.length} таблиц</small>
              </div>
              <strong title={activeDatabase?.name ?? databaseId}>{activeDatabase?.name ?? databaseId}</strong>
              {activeDatabase && (
                <small>
                  Автор:{" "}
                  <ProfileLink
                    accountId={activeDatabase.authorId}
                    currentAccountId={auth.user?.sub}
                    className="profile-link">
                    {activeDatabase.authorId === auth.user?.sub ? "вы" : `${activeDatabase.authorId.slice(0, 8)}…`}
                  </ProfileLink>
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
            <div className="schema-explorer__content">
              <div className="schema-explorer__section">
                <span>ТАБЛИЦЫ</span>
                <b>{visibleTables.length}</b>
              </div>
              <div className="table-list">
                {visibleTables.map((table) => {
                  const columnsCount = diagramQuery.data.columns.filter((column) => column.tableId === table.id).length;
                  return (
                    <button
                      key={table.id}
                      className={`table-list__item ${selectedTableId === table.id ? "table-list__item--active" : ""}`}
                      type="button"
                      title={table.name}
                      onClick={() => setSelectedTableId(table.id)}>
                      <i style={{ background: table.color ?? "var(--color-accent)" }} />
                      <span>{table.name}</span>
                      <small>{columnsCount}</small>
                    </button>
                  );
                })}
              </div>
              {selectedTable && (
                <div className="table-inspector">
                  <div className="table-inspector__head">
                    <div>
                      <span>ПОЛЯ</span>
                      <strong title={selectedTable.name}>{selectedTable.name}</strong>
                    </div>
                    {canEdit && (
                      <button type="button" title="Добавить колонку" onClick={() => openColumnForm(selectedTable)}>
                        +
                      </button>
                    )}
                  </div>
                  <div className="field-preview-list">
                    {selectedColumns.map((column) => (
                      <div className="field-preview" key={column.id}>
                        <div className="field-preview__main">
                          <span title={column.name}>{column.name}</span>
                          <small>
                            {column.type}
                            {column.length ? `(${column.length})` : ""}
                            {column.arrayDimensions ? `${"[]".repeat(column.arrayDimensions)}` : ""}
                          </small>
                        </div>
                        <div className="field-preview__details">
                          {column.primaryKey && <b>PK</b>}
                          {column.unique && <b>UQ</b>}
                          {!column.nullable && <b>NN</b>}
                          {column.autoIncrement && <b>AI</b>}
                          {column.defaultValue && <span title={column.defaultValue}>default: {column.defaultValue}</span>}
                        </div>
                        {canEdit && (
                          <button
                            className="field-preview__edit"
                            type="button"
                            title={`Редактировать ${column.name}`}
                            aria-label={`Редактировать колонку ${column.name}`}
                            onClick={() => setEditingColumn(column)}>
                            ✎
                          </button>
                        )}
                      </div>
                    ))}
                    {!selectedColumns.length && <p className="table-inspector__empty">В таблице пока нет колонок</p>}
                  </div>
                  <div className="table-inspector__head">
                    <div>
                      <span>ИНДЕКСЫ И КЛЮЧИ</span>
                    </div>
                    {canEdit && (
                      <button type="button" title="Добавить индекс" onClick={() => setIndexForm({ table: selectedTable })}>
                        +
                      </button>
                    )}
                  </div>
                  <div className="field-preview-list">
                    {selectedIndexes.map((index) => (
                      <div className="field-preview" key={index.id}>
                        <div className="field-preview__main">
                          <span title={index.name ?? undefined}>{index.name ?? "без имени"}</span>
                          <small>{index.method ?? ""}</small>
                        </div>
                        <div className="field-preview__details">
                          <b>{formatIndexType(index.type)}</b>
                          <span
                            title={index.columns.map((member) => columnNamesById.get(member.columnId) ?? "?").join(", ")}>
                            (
                            {index.columns
                              .map(
                                (member) =>
                                  `${columnNamesById.get(member.columnId) ?? "?"}${member.sortOrder === "desc" ? " DESC" : ""}`,
                              )
                              .join(", ")}
                            ){index.where ? ` WHERE ${index.where}` : ""}
                          </span>
                        </div>
                        {canEdit && (
                          <button
                            className="field-preview__edit"
                            type="button"
                            title={`Редактировать ${index.name ?? "индекс"}`}
                            aria-label={`Редактировать индекс ${index.name ?? ""}`}
                            onClick={() => setIndexForm({ table: selectedTable, index })}>
                            ✎
                          </button>
                        )}
                      </div>
                    ))}
                    {selectedTable.checks.map((check, position) => (
                      <div className="field-preview" key={`check-${position}`}>
                        <div className="field-preview__main">
                          <span title={check.name ?? undefined}>{check.name ?? "без имени"}</span>
                        </div>
                        <div className="field-preview__details">
                          <b>CHECK</b>
                          <span title={check.expression}>{check.expression}</span>
                        </div>
                      </div>
                    ))}
                    {!selectedIndexes.length && !selectedTable.checks.length && (
                      <p className="table-inspector__empty">Индексов и ограничений пока нет</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
          <button
            className="schema-explorer-resizer"
            type="button"
            role="separator"
            aria-label="Изменить ширину панели схемы"
            aria-orientation="vertical"
            aria-valuemin={sidebarMinWidth}
            aria-valuemax={sidebarMaxWidth}
            aria-valuenow={sidebarWidth}
            title="Потяните, чтобы изменить ширину"
            onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              setSidebarWidth(Math.min(sidebarMaxWidth, Math.max(sidebarMinWidth, event.clientX)));
            }}
            onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const direction = event.key === "ArrowLeft" ? -24 : 24;
              setSidebarWidth((width) => Math.min(sidebarMaxWidth, Math.max(sidebarMinWidth, width + direction)));
            }}>
            <span />
          </button>
          <section className="workspace__canvas">
            <DiagramEditor
              diagram={diagramQuery.data}
              editable={canEdit}
              onTableMove={canEdit ? (tableId, position) => moveTable.mutate({ tableId, position }) : undefined}
              onTableContextMenu={canEdit ? openTableMenu : undefined}
              onColumnContextMenu={canEdit ? openColumnMenu : undefined}
              onRelationshipCreate={canEdit ? createRelationshipFromConnection : undefined}
              onRelationshipDelete={canEdit ? (relationshipId) => relationshipDeletion.mutate(relationshipId) : undefined}
              onRelationshipEdit={canEdit ? setEditingRelationshipId : undefined}
              onGroupMove={canEdit ? moveGroup : undefined}
              onGroupResize={canEdit ? resizeGroup : undefined}
              onGroupDelete={canEdit ? deleteGroup : undefined}
              onCanvasClick={() => {
                setTableMenu(null);
                setColumnMenu(null);
              }}
              onAddTable={canEdit ? openTableForm : undefined}
              onAddGroup={canEdit ? openGroupForm : undefined}
              focusRequest={tableFocusRequest}
            />
          </section>
        </div>
        {isTableFormOpen && (
          <form className="table-create-form" onSubmit={submitTable} onClick={(event) => event.stopPropagation()}>
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
          <div
            className="editor-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setGroupFormOpen(false);
            }}>
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
          <div
            className="editor-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setColumnTable(null);
            }}>
            <form className="editor-drawer editor-drawer--column" onSubmit={submitColumn}>
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
              <ColumnFormFields
                columnTypes={enumCatalog.columnTypes}
                defaultSortOrder={
                  diagramQuery.data.columns.filter((columnItem) => columnItem.tableId === columnTable.id).length
                }
              />
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
          <div
            className="editor-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditingTable(null);
            }}>
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
              <TableChecksFields value={editingTable.checks} />
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
        {indexForm && (
          <div
            className="editor-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIndexForm(null);
            }}>
            <form className="editor-drawer editor-drawer--column" onSubmit={submitIndex}>
              <header>
                <div>
                  <span>ТАБЛИЦА</span>
                  <strong>{indexForm.table.name}</strong>
                </div>
                <button type="button" aria-label="Закрыть" onClick={() => setIndexForm(null)}>
                  X
                </button>
              </header>
              <h2>{indexForm.index ? "Редактирование индекса" : "Новый индекс"}</h2>
              <IndexFormFields
                value={indexForm.index}
                tableColumns={diagramQuery.data.columns
                  .filter((columnItem) => columnItem.tableId === indexForm.table.id)
                  .sort((left, right) => left.sortOrder - right.sortOrder)}
                indexTypes={enumCatalog.indexTypes}
                sortOrders={enumCatalog.sortOrders}
              />
              <footer>
                {indexForm.index && (
                  <button
                    className="button"
                    type="button"
                    disabled={indexDeletion.isPending}
                    onClick={() => indexDeletion.mutate(indexForm.index!.id, { onSuccess: () => setIndexForm(null) })}>
                    {indexDeletion.isPending ? "Удаляем..." : "Удалить"}
                  </button>
                )}
                <button className="button" type="button" onClick={() => setIndexForm(null)}>
                  Отмена
                </button>
                <button className="button button--primary" disabled={indexSave.isPending}>
                  {indexSave.isPending ? "Сохраняем..." : "Сохранить"}
                </button>
              </footer>
              {indexSave.isError && <p className="form-error">{indexSave.error.message}</p>}
              {indexDeletion.isError && <p className="form-error">{indexDeletion.error.message}</p>}
            </form>
          </div>
        )}
        {editingRelationship && (
          <div
            className="editor-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditingRelationshipId(null);
            }}>
            <form className="editor-drawer" onSubmit={submitRelationship}>
              <header>
                <div>
                  <span>СВЯЗЬ</span>
                  <strong>
                    {tableNamesById.get(editingRelationship.sourceTableId) ?? "?"} →{" "}
                    {tableNamesById.get(editingRelationship.targetTableId) ?? "?"}
                  </strong>
                </div>
                <button type="button" aria-label="Закрыть" onClick={() => setEditingRelationshipId(null)}>
                  X
                </button>
              </header>
              <h2>Редактирование связи</h2>
              <label>
                Название
                <input
                  name="relationshipName"
                  defaultValue={editingRelationship.name ?? ""}
                  placeholder="авто"
                  maxLength={255}
                  autoComplete="off"
                  autoFocus
                />
              </label>
              <fieldset className="constraint-columns">
                <legend>Колонки</legend>
                {editingRelationship.columnPairs.map((pair) => (
                  <div className="constraint-columns__pair" key={`${pair.sourceColumnId}-${pair.targetColumnId}`}>
                    {tableNamesById.get(editingRelationship.sourceTableId)}.
                    {columnNamesById.get(pair.sourceColumnId) ?? "?"}
                    {" → "}
                    {tableNamesById.get(editingRelationship.targetTableId)}.
                    {columnNamesById.get(pair.targetColumnId) ?? "?"}
                  </div>
                ))}
              </fieldset>
              <div className="column-form-grid">
                <label>
                  Кардинальность источника
                  <select name="sourceCardinality" defaultValue={editingRelationship.sourceCardinality}>
                    {enumCatalog.relationshipCardinalities.map((value) => (
                      <option value={value} key={value}>
                        {formatCardinality(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Кардинальность цели
                  <select name="targetCardinality" defaultValue={editingRelationship.targetCardinality}>
                    {enumCatalog.relationshipCardinalities.map((value) => (
                      <option value={value} key={value}>
                        {formatCardinality(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ON DELETE
                  <select name="onDelete" defaultValue={editingRelationship.onDelete}>
                    {enumCatalog.referentialActions.map((value) => (
                      <option value={value} key={value}>
                        {formatReferentialAction(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ON UPDATE
                  <select name="onUpdate" defaultValue={editingRelationship.onUpdate}>
                    {enumCatalog.referentialActions.map((value) => (
                      <option value={value} key={value}>
                        {formatReferentialAction(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <footer>
                <button
                  className="button"
                  type="button"
                  disabled={relationshipDeletion.isPending}
                  onClick={() =>
                    relationshipDeletion.mutate(editingRelationship.id, {
                      onSuccess: () => setEditingRelationshipId(null),
                    })
                  }>
                  {relationshipDeletion.isPending ? "Удаляем..." : "Удалить"}
                </button>
                <button className="button" type="button" onClick={() => setEditingRelationshipId(null)}>
                  Отмена
                </button>
                <button className="button button--primary" disabled={relationshipUpdate.isPending}>
                  {relationshipUpdate.isPending ? "Сохраняем..." : "Сохранить"}
                </button>
              </footer>
              {relationshipUpdate.isError && <p className="form-error">{relationshipUpdate.error.message}</p>}
              {relationshipDeletion.isError && <p className="form-error">{relationshipDeletion.error.message}</p>}
            </form>
          </div>
        )}
        {editingColumn && (
          <div
            className="editor-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditingColumn(null);
            }}>
            <form className="editor-drawer editor-drawer--column" onSubmit={submitColumnEdit}>
              <header>
                <div>
                  <span>КОЛОНКА</span>
                  <strong>{editingColumn.name}</strong>
                </div>
                <button type="button" aria-label="Закрыть" onClick={() => setEditingColumn(null)}>
                  X
                </button>
              </header>
              <h2>Редактирование колонки</h2>
              <ColumnFormFields
                value={editingColumn}
                columnTypes={enumCatalog.columnTypes}
                defaultSortOrder={editingColumn.sortOrder}
              />
              <footer>
                <button className="button" type="button" onClick={() => setEditingColumn(null)}>
                  Отмена
                </button>
                <button className="button button--primary" disabled={columnUpdate.isPending}>
                  {columnUpdate.isPending ? "Сохраняем..." : "Сохранить"}
                </button>
              </footer>
              {columnUpdate.isError && <p className="form-error">{columnUpdate.error.message}</p>}
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
                setIndexForm({ table: tableMenu.table });
                setTableMenu(null);
              }}>
              Добавить индекс
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
            <button
              type="button"
              onClick={() => {
                setEditingColumn(columnMenu.column);
                setColumnMenu(null);
              }}>
              Редактировать колонку
            </button>
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
      </main>
    </>
  );
}
