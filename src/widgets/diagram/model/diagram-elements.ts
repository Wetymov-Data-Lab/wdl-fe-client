import type { TableFlowNode } from "@/widgets/diagram/ui/table-node";
import type { GroupFlowNode } from "@/widgets/diagram/ui/group-node";
import type { Edge, ResizeParams } from "@xyflow/react";

const DEFAULT_TABLE_WIDTH = 290;

type HorizontalTableBounds = {
  position: Schema.Position;
  width: number | null;
};

export type RelationshipHandleSides = {
  source: "left" | "right";
  target: "left" | "right";
};

export type DiagramFlowNode = TableFlowNode | GroupFlowNode;

export function getShortestHandleSides(
  source: HorizontalTableBounds,
  target: HorizontalTableBounds,
): RelationshipHandleSides {
  const sourceLeft = source.position.x;
  const sourceRight = sourceLeft + (source.width ?? DEFAULT_TABLE_WIDTH);
  const targetLeft = target.position.x;
  const targetRight = targetLeft + (target.width ?? DEFAULT_TABLE_WIDTH);

  if (sourceRight <= targetLeft) return { source: "right", target: "left" };
  if (targetRight <= sourceLeft) return { source: "left", target: "right" };

  const leftRouteLength = Math.abs(sourceLeft - targetLeft);
  const rightRouteLength = Math.abs(sourceRight - targetRight);

  return leftRouteLength <= rightRouteLength ? { source: "left", target: "left" } : { source: "right", target: "right" };
}

export function toFlowNodes(
  diagram: Schema.Diagram,
  onContextMenu?: (table: Schema.DatabaseTable, position: { x: number; y: number }) => void,
  onColumnContextMenu?: (column: Schema.TableColumn, position: { x: number; y: number }) => void,
  editable = true,
  onGroupDelete?: (group: Schema.DiagramGroup) => void,
  onGroupResize?: (group: Schema.DiagramGroup, bounds: ResizeParams) => void,
): DiagramFlowNode[] {
  const groups: GroupFlowNode[] = diagram.groups.map((group) => ({
    id: group.id,
    type: "diagramGroup",
    position: group.position,
    data: { group, editable, onDelete: onGroupDelete, onResize: onGroupResize },
    style: { width: group.width, height: group.height, zIndex: 0 },
  }));
  const tables: TableFlowNode[] = diagram.tables.map((table) => ({
    id: table.id,
    type: "databaseTable",
    position: table.position,
    data: {
      table,
      columns: diagram.columns.filter((column) => column.tableId === table.id),
      onContextMenu,
      onColumnContextMenu,
    },
    style: { width: table.width ?? 290, zIndex: 2 },
  }));
  return [...groups, ...tables];
}

export function toFlowEdges(diagram: Schema.Diagram, showLabels: boolean): Edge[] {
  const tablesById = new Map(diagram.tables.map((table) => [table.id, table]));

  return diagram.relationships.flatMap((relationship) =>
    relationship.columnPairs.map((column, index) => {
      const sourceTable = tablesById.get(relationship.sourceTableId);
      const targetTable = tablesById.get(relationship.targetTableId);
      const sides =
        sourceTable && targetTable ? getShortestHandleSides(sourceTable, targetTable) : { source: "right", target: "left" };

      return {
        id: `${relationship.id}-${index}`,
        source: relationship.sourceTableId,
        target: relationship.targetTableId,
        sourceHandle: `handle-${sides.source}-${column.sourceColumnId}`,
        targetHandle: `handle-${sides.target}-${column.targetColumnId}`,
        type: "smoothstep",
        className: "diagram-flow-edge",
        label: showLabels && index === 0 ? (relationship.name ?? undefined) : undefined,
        labelStyle: { fill: "var(--color-muted)", fontSize: "var(--text-small)", fontWeight: 600 },
        labelBgStyle: { fill: "var(--color-surface)", fillOpacity: 0.92 },
        style: { stroke: "var(--color-diagram-edge)", strokeWidth: 1.5 },
        data: { relationshipId: relationship.id },
      } satisfies Edge;
    }),
  );
}
