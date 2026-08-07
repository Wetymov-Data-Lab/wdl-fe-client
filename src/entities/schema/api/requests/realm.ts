import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";
import { env } from "@/shared/config/env";

export const realm = {
  list: () =>
    request<Array<Parameters<typeof formatter.adapters.realm.fromServer>[0]>>("/realms/").then((dtos) =>
      dtos.map(formatter.adapters.realm.fromServer),
    ),
  create: (input: Schema.CreateRealmInput) => {
    const dto = formatter.adapters.realm.toServer(input, env.coreApi.developmentAuthorId);
    return request<Parameters<typeof formatter.adapters.realm.fromServer>[0]>("/realms/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.realm.fromServer);
  },
  update: (value: Schema.Realm, input: Schema.CreateRealmInput) => {
    const dto = formatter.adapters.realm.toServer(
      { ...value, name: input.name, slug: input.slug },
      env.coreApi.developmentAuthorId,
    );
    return request<Parameters<typeof formatter.adapters.realm.fromServer>[0]>(`/realms/${value.id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.realm.fromServer);
  },
  delete: (realmId: Schema.Id) =>
    request<void>(`/realms/${realmId}?updated_by=${env.coreApi.developmentAuthorId}`, {
      method: "DELETE",
    }),
};
