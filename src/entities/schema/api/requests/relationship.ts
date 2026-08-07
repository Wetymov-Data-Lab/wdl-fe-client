import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { env } from "@/shared/config/env";

export const relationship = {
  listByDatabase: (databaseId: Schema.Id) =>
    request<Array<Parameters<typeof formatter.adapters.relationship.fromServer>[0]>>(
      `/relationships/?database_id=${databaseId}`,
    ).then((dtos) => dtos.map(formatter.adapters.relationship.fromServer)),
  create: (input: Schema.CreateRelationshipInput) => {
    const dto = formatter.adapters.relationship.toServer(input, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.relationship.fromServer>[0]>("/relationships/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.relationship.fromServer);
  },
  delete: (relationshipId: Schema.Id) => request<void>(`/relationships/${relationshipId}`, { method: "DELETE" }),
};
