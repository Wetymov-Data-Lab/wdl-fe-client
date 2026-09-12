export type RealmStatus = "active" | "archived" | "disabled";
export type RealmVisibility = "private" | "internal" | "public";

export type DatabaseType =
  "psql" | "mongodb" | "mysql" | "redis" | "maria_db" | "sqlite" | "sql_server" | "oracle" | "cockroachdb";

export type ColumnType =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "date"
  | "datetime"
  | "time"
  | "timestamp"
  | "uuid"
  | "text"
  | "char"
  | "varchar"
  | "smallint"
  | "bigint"
  | "decimal"
  | "numeric"
  | "double"
  | "json"
  | "jsonb"
  | "binary"
  | "blob"
  | "enum"
  | "array"
  | "geometry"
  | "custom";

export type IndexType = "index" | "unique" | "primary" | "fulltext";
export type SortOrder = "asc" | "desc";
export type ReferentialAction = "no_action" | "restrict" | "cascade" | "set_null" | "set_default";
export type RelationshipCardinality = "zero_or_one" | "exactly_one" | "zero_or_many" | "one_or_many";

export type CoreEnumCatalogDto = {
  database_types: DatabaseType[];
  column_types: ColumnType[];
  index_types: IndexType[];
  sort_orders: SortOrder[];
  referential_actions: ReferentialAction[];
  relationship_cardinalities: RelationshipCardinality[];
  realm_statuses: RealmStatus[];
  realm_visibilities: RealmVisibility[];
};

export type AccountSubject = "user" | "service";
export type AccountStatus = "pending" | "active" | "deactivated" | "suspended";
