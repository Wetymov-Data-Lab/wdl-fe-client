import type { ApiAuditDto, ApiId, ApiPositionDto } from "@/entities/schema/api/contracts/common.contract";

export type RelationshipColumnPairDto = {
  source_column_id: ApiId;
  target_column_id: ApiId;
};

export type RelationshipDto = ApiAuditDto & {
  database_id: ApiId;
  name: string | null;
  source_table_id: ApiId;
  target_table_id: ApiId;
  columns: RelationshipColumnPairDto[];
  source_cardinality: string;
  target_cardinality: string;
  on_delete: string;
  on_update: string;
  waypoints: ApiPositionDto[];
};

export type CreateRelationshipDto = {
  database_id: ApiId;
  name: string | null;
  source_table_id: ApiId;
  target_table_id: ApiId;
  columns: RelationshipColumnPairDto[];
  source_cardinality: string;
  target_cardinality: string;
  on_delete: string;
  on_update: string;
  waypoints: ApiPositionDto[];
  author_id: string;
};
