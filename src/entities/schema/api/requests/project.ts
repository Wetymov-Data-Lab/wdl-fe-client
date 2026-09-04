import { formatter } from "@/entities/schema/api/schema.formatter";
import { request } from "@/shared/api/http";

export const project = {
  list: () =>
    request<Array<Parameters<typeof formatter.adapters.project.fromServer>[0]>>("/projects/").then((dtos) =>
      dtos.map(formatter.adapters.project.fromServer),
    ),

  create: (input: Schema.CreateProjectInput) => {
    const dto = formatter.adapters.project.toServer(input, import.meta.env.DEVELOPMENT_AUTHOR_ID);
    return request<Parameters<typeof formatter.adapters.project.fromServer>[0]>("/projects/", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.project.fromServer);
  },

  update: (value: Schema.Project, name: string) => {
    const dto = formatter.adapters.project.toServer({ ...value, name }, import.meta.env.DEVELOPMENT_AUTHOR_ID);
    return request<Parameters<typeof formatter.adapters.project.fromServer>[0]>(`/projects/${value.id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }).then(formatter.adapters.project.fromServer);
  },

  delete: (projectId: Schema.Id) => request<void>(`/projects/${projectId}`, { method: "DELETE" }),
};
