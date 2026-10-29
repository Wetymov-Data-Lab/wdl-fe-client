import { createContext } from "react";

/** Роль колонки в выделенной связи: источник внешнего ключа или колонка, на которую он ссылается. */
export type LinkedColumnRole = "source" | "target";

export const LinkedColumnsContext = createContext<ReadonlyMap<Schema.Id, LinkedColumnRole>>(new Map());

export function getLinkedColumns(
  relationships: Schema.Relationship[],
  selectedRelationshipIds: ReadonlySet<Schema.Id>,
): Map<Schema.Id, LinkedColumnRole> {
  const linked = new Map<Schema.Id, LinkedColumnRole>();
  for (const relationship of relationships) {
    if (!selectedRelationshipIds.has(relationship.id)) continue;
    for (const pair of relationship.columnPairs) {
      linked.set(pair.sourceColumnId, "source");
      linked.set(pair.targetColumnId, "target");
    }
  }
  return linked;
}
