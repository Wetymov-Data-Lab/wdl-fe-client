import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { getCurrentAccountId } from "@/shared/auth/token-storage";

export const tableIndex = {
  listByTable: (tableId: Schema.Id) =>
    request<Array<Parameters<typeof formatter.adapters.index.fromServer>[0]>>(`/indexes/?table_id=${tableId}`).then(
      (dtos) => dtos.map(formatter.adapters.index.fromServer),
    ),

  create: (tableId: Schema.Id, input: Schema.IndexInput) => {
    const dto = formatter.adapters.index.toServer(tableId, input, getCurrentAccountId());
    return request<Parameters<typeof formatter.adapters.index.fromServer>[0]>("/indexes/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.index.fromServer);
  },

  update: (indexId: Schema.Id, input: Schema.IndexInput) =>
    request<Parameters<typeof formatter.adapters.index.fromServer>[0]>(`/indexes/${indexId}`, {
      method: "PUT",
      body: JSON.stringify(formatter.adapters.index.toUpdateServer(input)),
    }).then(formatter.adapters.index.fromServer),

  delete: (indexId: Schema.Id) => request<void>(`/indexes/${indexId}`, { method: "DELETE" }),
};
