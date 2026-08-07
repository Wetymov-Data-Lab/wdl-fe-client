export function getColumnIdFromHandle(handleId: string): Schema.Id {
  return handleId.replace(/^handle-(?:left|right)-/, "");
}

export function relationshipExists(
  relationships: Schema.Relationship[],
  sourceColumnId: Schema.Id,
  targetColumnId: Schema.Id,
): boolean {
  return relationships.some((relationship) =>
    relationship.columnPairs.some(
      (pair) =>
        (pair.sourceColumnId === sourceColumnId && pair.targetColumnId === targetColumnId) ||
        (pair.sourceColumnId === targetColumnId && pair.targetColumnId === sourceColumnId),
    ),
  );
}
