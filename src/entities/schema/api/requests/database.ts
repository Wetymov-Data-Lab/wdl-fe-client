import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { env } from "@/shared/config/env";

export const database = {
  list: () =>
    request<Array<Parameters<typeof formatter.adapters.database.fromServer>[0]>>("/databases/").then((dtos) =>
      dtos.map(formatter.adapters.database.fromServer),
    ),

  create: (input: Schema.CreateDatabaseInput) => {
    const dto = formatter.adapters.database.toServer(input, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.database.fromServer>[0]>("/databases/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.database.fromServer);
  },

  update: (value: Schema.Database, name: string) => {
    const dto = formatter.adapters.database.toServer({ ...value, name }, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.database.fromServer>[0]>(`/databases/${value.id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.database.fromServer);
  },

  delete: (databaseId: Schema.Id) => request<void>(`/databases/${databaseId}`, { method: "DELETE" }),
};
