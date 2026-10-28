import { useEffect, type ReactNode } from "react";
import { Panel, useReactFlow, useViewport } from "@xyflow/react";
import { isTypingTarget } from "@/shared/lib/is-typing-target";
import { AreaIcon, FitIcon, HandIcon, MinusIcon, PlusIcon, PointerIcon, TableIcon } from "@/shared/ui/icons";

export type CanvasTool = "pointer" | "hand";

type Props = {
  tool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  onAddTable?: () => void;
  onAddGroup?: () => void;
};

type ToolButtonProps = {
  label: string;
  hotkey: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
};

const fitViewOptions = { padding: 0.24, duration: 240 };

function ToolButton({ label, hotkey, active = false, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={`canvas-tool ${active ? "canvas-tool--active" : ""}`}
      title={`${label} (${hotkey})`}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}>
      {children}
      <span className="canvas-tool__key">{hotkey}</span>
    </button>
  );
}

export function CanvasToolbar({ tool, onToolChange, onAddTable, onAddGroup }: Props) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === "v") onToolChange("pointer");
      else if (key === "h") onToolChange("hand");
      else if (key === "t" && onAddTable) onAddTable();
      else if (key === "a" && onAddGroup) onAddGroup();
      else if (key === "=" || key === "+") void zoomIn({ duration: 160 });
      else if (key === "-") void zoomOut({ duration: 160 });
      else if (key === "!" || (event.shiftKey && key === "1")) void fitView(fitViewOptions);
      else return;

      event.preventDefault();
    };

    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, [fitView, onAddGroup, onAddTable, onToolChange, zoomIn, zoomOut]);

  return (
    <>
      <Panel position="top-left" className="canvas-toolbar" role="toolbar" aria-label="Инструменты холста">
        <ToolButton label="Выделение" hotkey="V" active={tool === "pointer"} onClick={() => onToolChange("pointer")}>
          <PointerIcon />
        </ToolButton>
        <ToolButton label="Рука" hotkey="H" active={tool === "hand"} onClick={() => onToolChange("hand")}>
          <HandIcon />
        </ToolButton>
        {(onAddTable || onAddGroup) && <span className="canvas-toolbar__separator" />}
        {onAddTable && (
          <ToolButton label="Таблица" hotkey="T" onClick={onAddTable}>
            <TableIcon />
          </ToolButton>
        )}
        {onAddGroup && (
          <ToolButton label="Область" hotkey="A" onClick={onAddGroup}>
            <AreaIcon />
          </ToolButton>
        )}
      </Panel>
      <Panel position="bottom-right" className="canvas-toolbar canvas-toolbar--row" role="toolbar" aria-label="Масштаб">
        <ToolButton label="Отдалить" hotkey="−" onClick={() => void zoomOut({ duration: 160 })}>
          <MinusIcon />
        </ToolButton>
        <span className="canvas-toolbar__zoom">{Math.round(zoom * 100)}%</span>
        <ToolButton label="Приблизить" hotkey="+" onClick={() => void zoomIn({ duration: 160 })}>
          <PlusIcon />
        </ToolButton>
        <span className="canvas-toolbar__separator" />
        <ToolButton label="Вписать" hotkey="⇧1" onClick={() => void fitView(fitViewOptions)}>
          <FitIcon />
        </ToolButton>
      </Panel>
    </>
  );
}
