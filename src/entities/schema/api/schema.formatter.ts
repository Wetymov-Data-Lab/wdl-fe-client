import type { CoreApi } from "@/shared/api/contracts";

// TODO: zod shemas
// TODO: это не адаптер, больше по смыслу маппер
export const formatter = {
  adapters: {
    realm: {
      fromServer: (dto: CoreApi.Realm): Schema.Realm => ({
        id: dto.id,
        name: dto.name,
        slug: dto.slug,
        status: dto.status,
        visibility: dto.visibility,
        settings: dto.settings,
        notice: dto.notice,
        authorId: dto.author_id,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
        updatedBy: dto.updated_by,
      }),
      toServer: (value: Schema.CreateRealmInput | Schema.Realm): CoreApi.CreateRealm | CoreApi.UpdateRealm => {
        if ("id" in value) {
          return {
            name: value.name,
            slug: value.slug,
            status: value.status,
            visibility: value.visibility,
            settings: value.settings,
            notice: value.notice,
          };
        }

        return {
          name: value.name,
          slug: value.slug,
          status: value.status ?? "active",
          visibility: value.visibility ?? "private",
          settings: value.settings ?? {},
          notice: value.notice ?? null,
        };
      },
    },
    project: {
      fromServer: (dto: CoreApi.Project): Schema.Project => ({
        id: dto.id,
        realmId: dto.realm_id,
        name: dto.name,
        notice: dto.notice,
        authorId: dto.author_id,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
      }),
      toServer: (
        value: Schema.CreateProjectInput | Schema.Project,
        authorId: string,
      ): CoreApi.CreateProject | CoreApi.UpdateProject => {
        if ("id" in value) {
          return { name: value.name, notice: value.notice };
        }

        return {
          name: value.name,
          realm_id: value.realmId,
          notice: value.notice ?? null,
          author_id: authorId,
        };
      },
    },
    database: {
      fromServer: (dto: CoreApi.Database): Schema.Database => ({
        id: dto.id,
        projectId: dto.project_id,
        name: dto.name,
        type: dto.type,
        notice: dto.notice,
        defaultSchema: dto.default_schema,
        charset: dto.charset,
        collation: dto.collation,
        authorId: dto.author_id,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
      }),
      toServer: (
        value: Schema.CreateDatabaseInput | Schema.Database,
        authorId: string,
      ): CoreApi.CreateDatabase | CoreApi.UpdateDatabase => {
        if ("id" in value) {
          return {
            name: value.name,
            type: value.type,
            notice: value.notice,
            default_schema: value.defaultSchema,
            charset: value.charset,
            collation: value.collation,
          };
        }

        return {
          name: value.name,
          project_id: value.projectId,
          type: value.type ?? "psql",
          notice: value.notice ?? null,
          default_schema: value.defaultSchema ?? "public",
          charset: value.charset ?? "UTF8",
          collation: value.collation ?? null,
          author_id: authorId,
        };
      },
    },
    table: {
      fromServer: (dto: CoreApi.Table): Schema.DatabaseTable => ({
        id: dto.id,
        databaseId: dto.database_id,
        name: dto.name,
        schemaName: dto.schema_name,
        description: dto.description,
        notice: dto.notice,
        color: dto.color,
        position: dto.position,
        width: dto.width,
        isCollapsed: dto.is_collapsed,
        sortOrder: dto.sort_order,
        authorId: dto.author_id,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
      }),
      toServer: (
        value: Schema.CreateTableInput | Schema.DatabaseTable,
        authorId: string,
      ): CoreApi.CreateTable | CoreApi.UpdateTable => {
        if ("id" in value) {
          return {
            name: value.name,
            schema_name: value.schemaName,
            description: value.description,
            notice: value.notice,
            color: value.color,
            position: value.position,
            width: value.width,
            is_collapsed: value.isCollapsed,
            sort_order: value.sortOrder,
          };
        }

        return {
          name: value.name,
          database_id: value.databaseId,
          schema_name: value.schemaName ?? "public",
          description: value.description ?? null,
          notice: value.notice ?? null,
          color: value.color ?? null,
          position: value.position ?? {
            x: 100 + value.sortOrder * 40,
            y: 100 + value.sortOrder * 40,
          },
          width: value.width ?? null,
          is_collapsed: value.isCollapsed ?? false,
          sort_order: value.sortOrder,
          author_id: authorId,
        };
      },
    },
    column: {
      fromServer: (dto: CoreApi.Column): Schema.TableColumn => ({
        id: dto.id,
        tableId: dto.table_id,
        name: dto.name,
        type: dto.type,
        length: dto.length,
        nullable: dto.nullable,
        primaryKey: dto.primary_key,
        unique: dto.unique,
        sortOrder: dto.sort_order,
        authorId: dto.author_id,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
      }),
      toServer: (value: Schema.CreateColumnInput, authorId: string): CoreApi.CreateColumn => ({
        name: value.name,
        table_id: value.tableId,
        type: value.type,
        custom_type: value.customType ?? null,
        length: value.length ?? null,
        precision: value.precision ?? null,
        scale: value.scale ?? null,
        array_dimensions: value.arrayDimensions ?? 0,
        nullable: value.nullable ?? true,
        primary_key: value.primaryKey ?? false,
        unique: value.unique ?? false,
        auto_increment: value.autoIncrement ?? false,
        unsigned: value.unsigned ?? false,
        default: value.defaultValue ?? null,
        check: value.check ?? null,
        enum_values: value.enumValues ?? [],
        sort_order: value.sortOrder,
        notice: value.notice ?? null,
        author_id: authorId,
      }),
    },
    relationship: {
      fromServer: (dto: CoreApi.Relationship): Schema.Relationship => ({
        id: dto.id,
        databaseId: dto.database_id,
        name: dto.name,
        sourceTableId: dto.source_table_id,
        targetTableId: dto.target_table_id,
        columnPairs: dto.columns.map((column) => ({
          sourceColumnId: column.source_column_id,
          targetColumnId: column.target_column_id,
        })),
        sourceCardinality: dto.source_cardinality,
        targetCardinality: dto.target_cardinality,
        onDelete: dto.on_delete,
        onUpdate: dto.on_update,
        waypoints: dto.waypoints,
        authorId: dto.author_id,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
      }),
      toServer: (value: Schema.CreateRelationshipInput, authorId: string): CoreApi.CreateRelationship => ({
        database_id: value.databaseId,
        name: value.name ?? null,
        source_table_id: value.sourceTableId,
        target_table_id: value.targetTableId,
        columns: [
          {
            source_column_id: value.sourceColumnId,
            target_column_id: value.targetColumnId,
          },
        ],
        source_cardinality: value.sourceCardinality ?? "zero_or_many",
        target_cardinality: value.targetCardinality ?? "exactly_one",
        on_delete: value.onDelete ?? "no_action",
        on_update: value.onUpdate ?? "no_action",
        waypoints: value.waypoints ?? [],
        author_id: authorId,
      }),
    },
    group: {
      fromServer: (dto: CoreApi.DiagramGroup): Schema.DiagramGroup => ({
        id: dto.id,
        databaseId: dto.database_id,
        name: dto.name,
        position: dto.position,
        width: dto.width,
        height: dto.height,
        color: dto.color,
        isCollapsed: dto.is_collapsed,
        tableIds: dto.table_ids,
      }),
      toServer: (value: Schema.DiagramGroup): CoreApi.DiagramGroup => ({
        id: value.id,
        database_id: value.databaseId,
        name: value.name,
        position: value.position,
        width: value.width,
        height: value.height,
        color: value.color,
        is_collapsed: value.isCollapsed,
        table_ids: value.tableIds,
      }),
    },
    workspace: {
      fromServer: (
        realms: CoreApi.Realm[],
        projects: CoreApi.Project[],
        databases: CoreApi.Database[],
      ): Schema.Workspace => ({
        realms: realms.map(formatter.adapters.realm.fromServer),
        projects: projects.map(formatter.adapters.project.fromServer),
        databases: databases.map(formatter.adapters.database.fromServer),
      }),
    },
    diagram: {
      fromServer: (
        databaseId: Schema.Id,
        tables: CoreApi.Table[],
        columns: CoreApi.Column[],
        relationships: CoreApi.Relationship[],
      ): Schema.Diagram => ({
        databaseId,
        tables: tables.map(formatter.adapters.table.fromServer),
        columns: columns.map(formatter.adapters.column.fromServer),
        relationships: relationships.map(formatter.adapters.relationship.fromServer),
        groups: [],
      }),
    },
  },
};
