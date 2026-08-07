export const schemaQueryKeys = {
  workspace: ["workspace"] as const,
  diagram: (databaseId: Schema.Id | undefined) => ["diagram", databaseId] as const,
};
