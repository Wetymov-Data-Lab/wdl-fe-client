import type { TableFlowNode } from "@/widgets/diagram/ui/table-node";
import type { Edge } from "@xyflow/react";

export function toFlowNodes(
  diagram: Schema.Diagram,
  onContextMenu?: (table: Schema.DatabaseTable, position: { x: number; y: number }) => void,
  onColumnContextMenu?: (column: Schema.TableColumn, position: { x: number; y: number }) => void,
): TableFlowNode[] {
  return diagram.tables.map((table) => ({
    id: table.id,
    type: "databaseTable",
    position: table.position,
    data: {
      table,
      columns: diagram.columns.filter((column) => column.tableId === table.id),
      onContextMenu,
      onColumnContextMenu,
    },
    style: { width: table.width ?? 290 },
  }));
}

export function toFlowEdges(diagram: Schema.Diagram, showLabels: boolean): Edge[] {
  return diagram.relationships.flatMap((relationship) =>
    relationship.columnPairs.map((column, index) => ({
      id: `${relationship.id}-${index}`,
      source: relationship.sourceTableId,
      target: relationship.targetTableId,
      sourceHandle: `handle-right-${column.sourceColumnId}`,
      targetHandle: `handle-left-${column.targetColumnId}`,
      type: "smoothstep",
      label: showLabels && index === 0 ? (relationship.name ?? undefined) : undefined,
      labelStyle: { fill: "var(--color-muted)", fontSize: "var(--text-small)", fontWeight: 600 },
      labelBgStyle: { fill: "var(--color-surface)", fillOpacity: 0.92 },
      style: { stroke: "var(--color-diagram-edge)", strokeWidth: 1.5 },
      data: { relationshipId: relationship.id },
    })),
  );
}
