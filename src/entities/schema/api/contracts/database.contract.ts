import type { ApiAuditDto, ApiId } from "@/entities/schema/api/contracts/common.contract";

export type DatabaseDto = ApiAuditDto & {
  project_id: ApiId;
  name: string;
  type: string;
  notice: string | null;
  default_schema: string | null;
  charset: string | null;
  collation: string | null;
};

export type CreateDatabaseDto = {
  name: string;
  project_id: ApiId;
  type: string;
  notice: string | null;
  default_schema: string | null;
  charset: string | null;
  collation: string | null;
  author_id: string;
};

export type UpdateDatabaseDto = {
  name: string;
  type: string;
  notice: string | null;
  default_schema: string | null;
  charset: string | null;
  collation: string | null;
};
