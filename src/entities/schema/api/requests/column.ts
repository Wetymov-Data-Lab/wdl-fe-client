import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { env } from "@/shared/config/env";

export const column = {
  listByTable: (tableId: Schema.Id) =>
    request<Array<Parameters<typeof formatter.adapters.column.fromServer>[0]>>(`/columns/?table_id=${tableId}`).then(
      (dtos) => dtos.map(formatter.adapters.column.fromServer),
    ),
  create: (input: Schema.CreateColumnInput) => {
    const dto = formatter.adapters.column.toServer(input, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.column.fromServer>[0]>("/columns/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.column.fromServer);
  },
  delete: (columnId: Schema.Id) => request<void>(`/columns/${columnId}`, { method: "DELETE" }),
};
