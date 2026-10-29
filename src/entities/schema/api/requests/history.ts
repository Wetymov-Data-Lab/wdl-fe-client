import { formatter } from "@/entities/schema/api/schema.formatter";
import type { CoreApi } from "@/shared/api/contracts";
import { request } from "@/shared/api/http";

export const history = {
  get: (databaseId: Schema.Id) =>
    request<CoreApi.DiagramHistory>(`/databases/${databaseId}/history`).then(formatter.adapters.history.fromServer),

  undo: (databaseId: Schema.Id) =>
    request<CoreApi.DiagramHistory>(`/databases/${databaseId}/history/undo`, { method: "POST" }).then(
      formatter.adapters.history.fromServer,
    ),

  redo: (databaseId: Schema.Id) =>
    request<CoreApi.DiagramHistory>(`/databases/${databaseId}/history/redo`, { method: "POST" }).then(
      formatter.adapters.history.fromServer,
    ),
};
