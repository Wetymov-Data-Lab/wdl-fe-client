export const schemaQueryKeys = {
  workspace: ["workspace"] as const,
  diagram: (databaseId: Schema.Id | undefined) => ["diagram", databaseId] as const,
  history: (databaseId: Schema.Id | undefined) => ["diagram-history", databaseId] as const,
};
