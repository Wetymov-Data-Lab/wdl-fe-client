import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { getCurrentAccountId } from "@/shared/auth/token-storage";

export const column = {
  listByTable: (tableId: Schema.Id) =>
    request<Array<Parameters<typeof formatter.adapters.column.fromServer>[0]>>(`/columns/?table_id=${tableId}`).then(
      (dtos) => dtos.map(formatter.adapters.column.fromServer),
    ),

  create: (input: Schema.CreateColumnInput) => {
    const dto = formatter.adapters.column.toServer(input, getCurrentAccountId());
    return request<Parameters<typeof formatter.adapters.column.fromServer>[0]>("/columns/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.column.fromServer);
  },

  update: (columnId: Schema.Id, input: Schema.UpdateColumnInput) =>
    request<Parameters<typeof formatter.adapters.column.fromServer>[0]>(`/columns/${columnId}`, {
      method: "PUT",
      body: JSON.stringify(formatter.adapters.column.toUpdateServer(input)),
    }).then(formatter.adapters.column.fromServer),

  delete: (columnId: Schema.Id) => request<void>(`/columns/${columnId}`, { method: "DELETE" }),
};
