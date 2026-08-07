import type { ApiAuditDto, ApiId, ApiPositionDto } from "@/entities/schema/api/contracts/common.contract";

export type TableDto = ApiAuditDto & {
  database_id: ApiId;
  name: string;
  schema_name: string | null;
  description: string | null;
  notice: string | null;
  color: string | null;
  position: ApiPositionDto;
  width: number | null;
  is_collapsed: boolean;
  sort_order: number;
};

/** Exact body accepted by PUT /tables/{table_id}. */
export type UpdateTableDto = Omit<TableDto, keyof ApiAuditDto | "database_id">;

export type CreateTableDto = {
  name: string;
  database_id: ApiId;
  schema_name: string | null;
  description: string | null;
  notice: string | null;
  color: string | null;
  position: ApiPositionDto;
  width: number | null;
  is_collapsed: boolean;
  sort_order: number;
  author_id: string;
};
