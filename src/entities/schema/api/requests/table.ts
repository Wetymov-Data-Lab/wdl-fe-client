import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { env } from "@/shared/config/env";

export const table = {
  listByDatabase: (databaseId: Schema.Id) =>
    request<Array<Parameters<typeof formatter.adapters.table.fromServer>[0]>>(`/tables/?database_id=${databaseId}`).then(
      (dtos) => dtos.map(formatter.adapters.table.fromServer),
    ),

  create: (input: Schema.CreateTableInput) => {
    const dto = formatter.adapters.table.toServer(input, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.table.fromServer>[0]>("/tables/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.table.fromServer);
  },

  update: (value: Schema.DatabaseTable, position: Schema.Position) => {
    const dto = formatter.adapters.table.toServer({ ...value, position }, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.table.fromServer>[0]>(`/tables/${value.id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.table.fromServer);
  },
};
