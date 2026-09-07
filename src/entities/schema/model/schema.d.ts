declare namespace Schema {
  type Id = string;

  type Position = { x: number; y: number };

  type Realm = {
    id: Id;
    name: string;
    slug: string;
    status: string;
    visibility: string;
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
    type: string;
    notice: string | null;
    defaultSchema: string | null;
    charset: string | null;
    collation: string | null;
    authorId: Id;
    createdAt: string;
    updatedAt: string | null;
  };

  type Workspace = {
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
    status?: string;
    visibility?: string;
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
    type?: string;
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
    type: string;
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

  type CreateRelationshipInput = {
    databaseId: Id;
    sourceTableId: Id;
    targetTableId: Id;
    sourceColumnId: Id;
    targetColumnId: Id;
    name?: string | null;
    sourceCardinality?: string;
    targetCardinality?: string;
    onDelete?: string;
    onUpdate?: string;
    waypoints?: Position[];
  };

  type TableColumn = {
    id: Id;
    tableId: Id;
    name: string;
    type: string;
    length: number | null;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
    sortOrder: number;
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
    sourceCardinality: string;
    targetCardinality: string;
    onDelete: string;
    onUpdate: string;
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
