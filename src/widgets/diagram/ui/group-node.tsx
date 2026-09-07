import { NodeResizer, type Node, type NodeProps, type ResizeParams } from "@xyflow/react";

export type GroupFlowNode = Node<
  {
    group: Schema.DiagramGroup;
    editable: boolean;
    onDelete?: (group: Schema.DiagramGroup) => void;
    onResize?: (group: Schema.DiagramGroup, bounds: ResizeParams) => void;
  },
  "diagramGroup"
>;

export function GroupNode({ data, selected }: NodeProps<GroupFlowNode>) {
  const color = data.group.color ?? "#7C8CF8";

  return (
    <div
      className={`group-node ${selected ? "group-node--selected" : ""}`}
      style={{ "--group-color": color } as React.CSSProperties}>
      <NodeResizer
        color={color}
        isVisible={selected && data.editable}
        minWidth={180}
        minHeight={120}
        handleClassName="group-node__resize-handle"
        lineClassName="group-node__resize-line"
        onResizeEnd={(_, bounds) => data.onResize?.(data.group, bounds)}
      />
      <strong>{data.group.name}</strong>
      {data.editable && (
        <button
          type="button"
          className="nodrag nopan"
          title="Удалить область"
          aria-label={`Удалить область ${data.group.name}`}
          onClick={() => data.onDelete?.(data.group)}>
          ×
        </button>
      )}
    </div>
  );
}
