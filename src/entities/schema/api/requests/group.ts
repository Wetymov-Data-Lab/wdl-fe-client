import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";

export const group = {
  listByDatabase: (databaseId: Schema.Id) =>
    request<CoreApiGroup[]>(`/canvas/${databaseId}/groups`).then((dtos) => dtos.map(formatter.adapters.group.fromServer)),

  create: (input: Schema.CreateDiagramGroupInput) => {
    const value: Schema.DiagramGroup = { ...input, id: crypto.randomUUID() };
    return request<CoreApiGroup>(`/canvas/${value.databaseId}/groups`, {
      method: "POST",
      body: JSON.stringify(formatter.adapters.group.toServer(value)),
    }).then(formatter.adapters.group.fromServer);
  },

  update: (value: Schema.DiagramGroup) =>
    request<CoreApiGroup>(`/canvas/${value.databaseId}/groups/${value.id}`, {
      method: "PUT",
      body: JSON.stringify(formatter.adapters.group.toServer(value)),
    }).then(formatter.adapters.group.fromServer),

  delete: (value: Schema.DiagramGroup) =>
    request<void>(`/canvas/${value.databaseId}/groups/${value.id}`, { method: "DELETE" }),
};

type CoreApiGroup = Parameters<typeof formatter.adapters.group.fromServer>[0];
