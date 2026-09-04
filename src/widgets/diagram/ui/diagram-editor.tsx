import { toFlowEdges, toFlowNodes } from "@/widgets/diagram/model/diagram-elements";
import { TableNode, type TableFlowNode } from "@/widgets/diagram/ui/table-node";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  BackgroundVariant,
  ConnectionMode,
  useEdgesState,
  useNodesState,
  Background,
  ReactFlow,
  Controls,
  type Connection,
  type OnNodeDrag,
  type NodeTypes,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getColumnIdFromHandle, relationshipExists } from "@/entities/schema/model/relationship-rules";

type Props = {
  diagram: Schema.Diagram;
  onTableMove?: (tableId: string, position: Schema.Position) => void;
  onTableContextMenu?: (table: Schema.DatabaseTable, position: { x: number; y: number }) => void;
  onColumnContextMenu?: (column: Schema.TableColumn, position: { x: number; y: number }) => void;
  onRelationshipCreate?: (connection: Connection) => void;
  onRelationshipDelete?: (relationshipId: string) => void;
  onCanvasClick?: () => void;
};

export function DiagramEditor({
  diagram,
  onTableMove,
  onTableContextMenu,
  onColumnContextMenu,
  onRelationshipCreate,
  onRelationshipDelete,
  onCanvasClick,
}: Props) {
  const initialNodes = useMemo(
    () => toFlowNodes(diagram, onTableContextMenu, onColumnContextMenu),
    [diagram, onTableContextMenu, onColumnContextMenu],
  );
  const initialEdges = useMemo(
    () => toFlowEdges(diagram, import.meta.env.DIAGRAM_SHOW_RELATIONSHIP_LABELS === "true"),
    [diagram],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<TableFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const pendingConnections = useRef<Connection[]>([]);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);
  useEffect(() => {
    setEdges((currentEdges) => {
      const unmatchedConnections = [...pendingConnections.current];
      const nextEdges = initialEdges.map((edge) => {
        const currentEdge = currentEdges.find((item) => item.id === edge.id);
        if (currentEdge?.sourceHandle && currentEdge.targetHandle) {
          return {
            ...edge,
            sourceHandle: currentEdge.sourceHandle,
            targetHandle: currentEdge.targetHandle,
          };
        }

        const connectionIndex = unmatchedConnections.findIndex(
          (connection) =>
            connection.source === edge.source &&
            connection.target === edge.target &&
            connection.sourceHandle &&
            connection.targetHandle &&
            getColumnIdFromHandle(connection.sourceHandle) === getColumnIdFromHandle(edge.sourceHandle ?? "") &&
            getColumnIdFromHandle(connection.targetHandle) === getColumnIdFromHandle(edge.targetHandle ?? ""),
        );
        if (connectionIndex === -1) return edge;

        const [connection] = unmatchedConnections.splice(connectionIndex, 1);
        return {
          ...edge,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        };
      });

      pendingConnections.current = unmatchedConnections;
      return nextEdges;
    });
  }, [initialEdges, setEdges]);

  const onNodeDragStop = useCallback<OnNodeDrag<TableFlowNode>>(
    (_, node) => {
      onTableMove?.(node.id, node.position);
    },
    [onTableMove],
  );
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      const relationshipIds = new Set(
        deletedEdges.map((edge) => (edge.data as { relationshipId?: string } | undefined)?.relationshipId),
      );
      relationshipIds.forEach((relationshipId) => {
        if (relationshipId) onRelationshipDelete?.(relationshipId);
      });
    },
    [onRelationshipDelete],
  );
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (
        !connection.source ||
        !connection.target ||
        !connection.sourceHandle ||
        !connection.targetHandle ||
        connection.source === connection.target
      ) {
        return false;
      }

      const sourceColumnId = getColumnIdFromHandle(connection.sourceHandle);
      const targetColumnId = getColumnIdFromHandle(connection.targetHandle);
      const isDuplicate = relationshipExists(diagram.relationships, sourceColumnId, targetColumnId);

      return sourceColumnId !== targetColumnId && !isDuplicate;
    },
    [diagram.relationships],
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      pendingConnections.current.push(connection);
      onRelationshipCreate?.(connection);
    },
    [onRelationshipCreate],
  );

  return (
    <section className="diagram-editor" aria-label="Диаграмма базы данных">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ databaseTable: TableNode } as NodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        deleteKeyCode={["Backspace", "Delete"]}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        onPaneClick={onCanvasClick}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        minZoom={Number(import.meta.env.DIAGRAM_MIN_ZOOM)}
        maxZoom={Number(import.meta.env.DIAGRAM_MAX_ZOOM)}
        snapToGrid={import.meta.env.DIAGRAM_SNAP_TO_GRID === "true"}
        snapGrid={[Number(import.meta.env.DIAGRAM_GRID_SIZE), Number(import.meta.env.DIAGRAM_GRID_SIZE)]}
        defaultEdgeOptions={{ type: "smoothstep" }}
        connectionLineStyle={{ stroke: "var(--color-accent)", strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}>
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-diagram-grid)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </section>
  );
}
