declare namespace Schema {
  type Id = string;

  type RealmStatus = import("@/shared/api/core-enums").RealmStatus;
  type RealmVisibility = import("@/shared/api/core-enums").RealmVisibility;
  type DatabaseType = import("@/shared/api/core-enums").DatabaseType;
  type ColumnType = import("@/shared/api/core-enums").ColumnType;
  type ReferentialAction = import("@/shared/api/core-enums").ReferentialAction;
  type RelationshipCardinality = import("@/shared/api/core-enums").RelationshipCardinality;

  type EnumCatalog = {
    databaseTypes: DatabaseType[];
    columnTypes: ColumnType[];
    indexTypes: import("@/shared/api/core-enums").IndexType[];
    sortOrders: import("@/shared/api/core-enums").SortOrder[];
    referentialActions: ReferentialAction[];
    relationshipCardinalities: RelationshipCardinality[];
    realmStatuses: RealmStatus[];
    realmVisibilities: RealmVisibility[];
  };

  type Position = { x: number; y: number };

  type Realm = {
    id: Id;
    name: string;
    slug: string;
    status: RealmStatus;
    visibility: RealmVisibility;
    settings: Record<string, unknown>;
    notice: string | null;
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: Id | null;
  };

  type Project = {
    id: Id;
    realmId: Id;
    name: string;
    notice: string | null;
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
  };

  type Database = {
    id: Id;
    projectId: Id;
    name: string;
    type: DatabaseType;
    notice: string | null;
    defaultSchema: string | null;
    charset: string | null;
    collation: string | null;
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
  };

  type Workspace = {
    enums: EnumCatalog;
    realms: Realm[];
    projects: Project[];
    databases: Database[];
  };

  type CreateWorkspaceInput = {
    realmName: string;
    realmSlug: string;
    projectName: string;
    databaseName: string;
  };

  type CreateRealmInput = {
    name: string;
    slug: string;
    status?: RealmStatus;
    visibility?: RealmVisibility;
    settings?: Record<string, unknown>;
    notice?: string | null;
  };

  type CreateProjectInput = {
    realmId: Id;
    name: string;
    notice?: string | null;
  };

  type CreateDatabaseInput = {
    projectId: Id;
    name: string;
    type?: DatabaseType;
    notice?: string | null;
    defaultSchema?: string | null;
    charset?: string | null;
    collation?: string | null;
  };

  type CreateTableInput = {
    databaseId: Id;
    name: string;
    sortOrder: number;
    schemaName?: string | null;
    description?: string | null;
    notice?: string | null;
    color?: string | null;
    position?: Position;
    width?: number | null;
    isCollapsed?: boolean;
  };

  type CreateColumnInput = {
    tableId: Id;
    name: string;
    type: ColumnType;
    sortOrder: number;
    customType?: string | null;
    length?: number | null;
    precision?: number | null;
    scale?: number | null;
    arrayDimensions?: number;
    nullable?: boolean;
    primaryKey?: boolean;
    unique?: boolean;
    autoIncrement?: boolean;
    unsigned?: boolean;
    defaultValue?: string | null;
    check?: string | null;
    enumValues?: string[];
    notice?: string | null;
  };

  type UpdateColumnInput = Omit<TableColumn, "id" | "tableId" | "authorId" | "createdAt" | "updatedAt">;

  type CreateRelationshipInput = {
    databaseId: Id;
    sourceTableId: Id;
    targetTableId: Id;
    sourceColumnId: Id;
    targetColumnId: Id;
    name?: string | null;
    sourceCardinality?: RelationshipCardinality;
    targetCardinality?: RelationshipCardinality;
    onDelete?: ReferentialAction;
    onUpdate?: ReferentialAction;
    waypoints?: Position[];
  };

  type TableColumn = {
    id: Id;
    tableId: Id;
    name: string;
    type: ColumnType;
    customType: string | null;
    length: number | null;
    precision: number | null;
    scale: number | null;
    arrayDimensions: number;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
    autoIncrement: boolean;
    unsigned: boolean;
    defaultValue: string | null;
    check: string | null;
    enumValues: string[];
    sortOrder: number;
    notice: string | null;
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
  };

  type DatabaseTable = {
    id: Id;
    databaseId: Id;
    name: string;
    schemaName: string | null;
    description: string | null;
    notice: string | null;
    color: string | null;
    position: Position;
    width: number | null;
    isCollapsed: boolean;
    sortOrder: number;
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
  };

  type RelationshipColumnPair = {
    sourceColumnId: Id;
    targetColumnId: Id;
  };

  type Relationship = {
    id: Id;
    databaseId: Id;
    name: string | null;
    sourceTableId: Id;
    targetTableId: Id;
    columnPairs: RelationshipColumnPair[];
    sourceCardinality: RelationshipCardinality;
    targetCardinality: RelationshipCardinality;
    onDelete: ReferentialAction;
    onUpdate: ReferentialAction;
    waypoints: Position[];
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
  };

  type DiagramGroup = {
    id: Id;
    databaseId: Id;
    name: string;
    position: Position;
    width: number;
    height: number;
    color: string | null;
    isCollapsed: boolean;
    tableIds: Id[];
  };

  type CreateDiagramGroupInput = Omit<DiagramGroup, "id">;

  type Diagram = {
    databaseId: Id;
    tables: DatabaseTable[];
    columns: TableColumn[];
    relationships: Relationship[];
    groups: DiagramGroup[];
  };
}
