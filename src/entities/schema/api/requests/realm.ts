import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";

export const realm = {
  list: () =>
    request<Array<Parameters<typeof formatter.adapters.realm.fromServer>[0]>>("/realms/").then((dtos) =>
      dtos.map(formatter.adapters.realm.fromServer),
    ),

  create: (input: Schema.CreateRealmInput) => {
    const dto = formatter.adapters.realm.toServer(input, import.meta.env.DEVELOPMENT_AUTHOR_ID);
    return request<Parameters<typeof formatter.adapters.realm.fromServer>[0]>("/realms/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.realm.fromServer);
  },

  update: (value: Schema.Realm, input: Schema.CreateRealmInput) => {
    const dto = formatter.adapters.realm.toServer(
      { ...value, name: input.name, slug: input.slug },
      import.meta.env.DEVELOPMENT_AUTHOR_ID,
    );
    return request<Parameters<typeof formatter.adapters.realm.fromServer>[0]>(`/realms/${value.id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.realm.fromServer);
  },

  delete: (realmId: Schema.Id) =>
    request<void>(`/realms/${realmId}?updated_by=${import.meta.env.DEVELOPMENT_AUTHOR_ID}`, {
      method: "DELETE",
    }),
};
