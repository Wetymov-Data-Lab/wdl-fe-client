import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

export type TableNodeData = {
  table: Schema.DatabaseTable;
  columns: Schema.TableColumn[];
  onContextMenu?: (table: Schema.DatabaseTable, position: { x: number; y: number }) => void;
  onColumnContextMenu?: (column: Schema.TableColumn, position: { x: number; y: number }) => void;
};
export type TableFlowNode = Node<TableNodeData, "databaseTable">;

export function TableNode({ data, selected }: NodeProps<TableFlowNode>) {
  const { table, columns } = data;

  return (
    <article
      className={`table-node ${selected ? "table-node--selected" : ""}`}
      style={{ "--table-color": table.color ?? "var(--color-accent)" } as React.CSSProperties}
      onContextMenu={(event) => {
        event.preventDefault();
        data.onContextMenu?.(table, { x: event.clientX, y: event.clientY });
      }}>
      <header className="table-node__header">
        <strong>{table.name}</strong>
        <span className="table-node__count">{columns.length}</span>
      </header>
      {!table.isCollapsed && (
        <div className="table-node__fields">
          {columns.map((column) => (
            <div
              className="table-node__field"
              key={column.id}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                data.onColumnContextMenu?.(column, { x: event.clientX, y: event.clientY });
              }}>
              <Handle
                className="table-node__handle"
                type="source"
                position={Position.Left}
                id={`handle-left-${column.id}`}
              />
              <span className="table-node__field-name">
                {column.primaryKey && (
                  <span className="key-icon" title="Primary key">
                    PK
                  </span>
                )}
                {column.name}
              </span>
              <span className="table-node__type">
                {column.type}
                {column.length ? `(${column.length})` : ""}
              </span>
              <Handle
                className="table-node__handle"
                type="source"
                position={Position.Right}
                id={`handle-right-${column.id}`}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
