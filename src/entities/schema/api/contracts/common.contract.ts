/** Shared transport declarations returned by wdl-be-core. Never import these into UI/model code. */
export type ApiId = string;

export type ApiPositionDto = {
  x: number;
  y: number;
};

export type ApiAuditDto = {
  id: ApiId;
  author_id: ApiId;
  created_at: string;
  updated_at: string;
};
