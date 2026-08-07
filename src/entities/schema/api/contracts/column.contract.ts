import type { ApiAuditDto, ApiId } from "@/entities/schema/api/contracts/common.contract";

export type ColumnDto = ApiAuditDto & {
  table_id: ApiId;
  name: string;
  type: string;
  custom_type: string | null;
  length: number | null;
  precision: number | null;
  scale: number | null;
  array_dimensions: number;
  nullable: boolean;
  primary_key: boolean;
  unique: boolean;
  auto_increment: boolean;
  unsigned: boolean;
  default: string | null;
  check: string | null;
  enum_values: string[];
  sort_order: number;
  notice: string | null;
};

export type CreateColumnDto = {
  name: string;
  table_id: ApiId;
  type: string;
  custom_type: string | null;
  length: number | null;
  precision: number | null;
  scale: number | null;
  array_dimensions: number;
  nullable: boolean;
  primary_key: boolean;
  unique: boolean;
  auto_increment: boolean;
  unsigned: boolean;
  default: string | null;
  check: string | null;
  enum_values: string[];
  sort_order: number;
  notice: string | null;
  author_id: string;
};
