import type { ApiAuditDto } from "@/entities/schema/api/contracts/common.contract";

export type RealmDto = ApiAuditDto & {
  name: string;
  slug: string;
  status: string;
  visibility: string;
  settings: Record<string, unknown>;
  notice: string | null;
  deleted_at: string | null;
  updated_by: string | null;
};

export type CreateRealmDto = {
  name: string;
  slug: string;
  status: string;
  visibility: string;
  settings: Record<string, unknown>;
  notice: string | null;
  author_id: string;
};

export type UpdateRealmDto = {
  name: string;
  slug: string;
  status: string;
  visibility: string;
  settings: Record<string, unknown>;
  notice: string | null;
  updated_by: string;
};
