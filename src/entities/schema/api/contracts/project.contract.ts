import type { ApiAuditDto, ApiId } from "@/entities/schema/api/contracts/common.contract";

export type ProjectDto = ApiAuditDto & {
  realm_id: ApiId;
  name: string;
  notice: string | null;
};

export type CreateProjectDto = {
  name: string;
  realm_id: ApiId;
  notice: string | null;
  author_id: string;
};

export type UpdateProjectDto = {
  name: string;
  notice: string | null;
};
