import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type CommandPaletteItem = {
  id: string;
  group: string;
  kind: string;
  label: string;
  hint?: string;
  hotkey?: string;
  disabled?: boolean;
  onSelect: () => void;
};

type Props = {
  items: CommandPaletteItem[];
  onClose: () => void;
};

const resultLimit = 40;

function highlight(text: string, query: string): ReactNode {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <b>{text.slice(index, index + query.length)}</b>
      {text.slice(index + query.length)}
    </>
  );
}

export function CommandPalette({ items, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items
      .filter((item) => !item.disabled)
      .filter(
        (item) =>
          !normalizedQuery ||
          item.label.toLowerCase().includes(normalizedQuery) ||
          item.hint?.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, resultLimit);
  }, [items, query]);

  useEffect(() => {
    listRef.current?.querySelector(".command-palette__item--active")?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = (item: CommandPaletteItem | undefined) => {
    if (!item) return;
    onClose();
    item.onSelect();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(results[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="command-palette-overlay" onMouseDown={onClose}>
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Командная палитра"
        onMouseDown={(event) => event.stopPropagation()}>
        <label className="command-palette__input">
          <span className="command-palette__prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            autoFocus
            value={query}
            placeholder="Найти таблицу, колонку или команду"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={results[activeIndex] ? `command-${results[activeIndex].id}` : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="kbd">esc</kbd>
        </label>
        <div className="command-palette__results" id="command-palette-results" role="listbox" ref={listRef}>
          {results.length === 0 && <p className="command-palette__empty">Ничего не найдено</p>}
          {results.map((item, index) => (
            <div key={item.id}>
              {item.group !== results[index - 1]?.group && <div className="command-palette__group">{item.group}</div>}
              <div
                id={`command-${item.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`command-palette__item ${index === activeIndex ? "command-palette__item--active" : ""}`}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => select(item)}>
                <span className="command-palette__kind">{item.kind}</span>
                <span className="command-palette__label">{highlight(item.label, query.trim())}</span>
                {item.hotkey ? (
                  <kbd className="kbd">{item.hotkey}</kbd>
                ) : (
                  <small className="command-palette__hint">{item.hint}</small>
                )}
              </div>
            </div>
          ))}
        </div>
        <footer className="command-palette__footer">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> выбор
          </span>
          <span>
            <kbd className="kbd">↵</kbd> открыть
          </span>
          <span>
            <kbd className="kbd">esc</kbd> закрыть
          </span>
        </footer>
      </div>
    </div>
  );
}
