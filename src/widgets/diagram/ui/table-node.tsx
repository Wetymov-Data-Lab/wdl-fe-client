import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { useContext } from "react";
import { LinkedColumnsContext } from "@/widgets/diagram/model/linked-columns";

export type TableNodeData = {
  table: Schema.DatabaseTable;
  columns: Schema.TableColumn[];
  onContextMenu?: (table: Schema.DatabaseTable, position: { x: number; y: number }) => void;
  onColumnContextMenu?: (column: Schema.TableColumn, position: { x: number; y: number }) => void;
};
export type TableFlowNode = Node<TableNodeData, "databaseTable">;

export function TableNode({ data, selected }: NodeProps<TableFlowNode>) {
  const { table, columns } = data;
  const linkedColumns = useContext(LinkedColumnsContext);

  return (
    <article
      className={`table-node ${selected ? "table-node--selected" : ""}`}
      style={{ "--table-color": table.color ?? "var(--color-accent)" } as React.CSSProperties}
      onContextMenu={(event) => {
        event.preventDefault();
        data.onContextMenu?.(table, { x: event.clientX, y: event.clientY });
      }}>
      <header className="table-node__header">
        <span className="table-node__swatch" />
        <span className="table-node__titles">
          {table.schemaName && <span className="table-node__schema">{table.schemaName}</span>}
          <strong>{table.name}</strong>
        </span>
        <span className="table-node__count">{columns.length} COL</span>
      </header>
      {!table.isCollapsed && (
        <div className="table-node__fields">
          {columns.map((column) => {
            const linkRole = linkedColumns.get(column.id);
            return (
              <div
                className={`table-node__field ${column.primaryKey ? "table-node__field--pk" : ""} ${linkRole ? "table-node__field--linked" : ""}`}
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
                  {linkRole && (
                    <span
                      className="table-node__link-badge"
                      title={
                        linkRole === "source" ? "Внешний ключ выделенной связи" : "Колонка, на которую ссылается связь"
                      }>
                      {linkRole === "source" ? "FK" : "REF"}
                    </span>
                  )}
                </span>
                <span className="table-node__type">
                  {column.type}
                  {column.length ? `(${column.length})` : ""}
                  {column.nullable && (
                    <span className="table-node__nullable" title="Nullable">
                      ?
                    </span>
                  )}
                </span>
                <Handle
                  className="table-node__handle"
                  type="source"
                  position={Position.Right}
                  id={`handle-right-${column.id}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
