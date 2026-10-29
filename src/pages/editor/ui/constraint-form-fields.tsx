import { useState } from "react";
import { formatIndexType } from "@/pages/editor/model/constraint-form";

export function IndexFormFields({
  value,
  tableColumns,
  indexTypes,
  sortOrders,
}: {
  value?: Schema.TableIndex;
  tableColumns: Schema.TableColumn[];
  indexTypes: Schema.IndexType[];
  sortOrders: Schema.SortOrder[];
}) {
  const [members, setMembers] = useState<Schema.IndexColumn[]>(value?.columns ?? []);
  const columnsById = new Map(tableColumns.map((column) => [column.id, column]));
  const available = tableColumns.filter((column) => !members.some((member) => member.columnId === column.id));
  const move = (position: number, offset: number) =>
    setMembers((items) => {
      const next = [...items];
      [next[position], next[position + offset]] = [next[position + offset], next[position]];
      return next;
    });

  return (
    <>
      <div className="column-form-grid">
        <label>
          Имя
          <input name="indexName" defaultValue={value?.name ?? ""} placeholder="авто" maxLength={255} autoFocus />
        </label>
        <label>
          Тип
          <select name="indexType" defaultValue={value?.type ?? "index"}>
            {indexTypes.map((type) => (
              <option value={type} key={type}>
                {formatIndexType(type)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Метод
          <input name="indexMethod" defaultValue={value?.method ?? ""} placeholder="btree" maxLength={64} />
        </label>
      </div>
      <fieldset className="constraint-columns">
        <legend>Колонки</legend>
        {members.map((member, position) => (
          <div className="constraint-columns__row" key={member.columnId}>
            <input type="hidden" name="indexColumns" value={`${member.columnId}:${member.sortOrder}`} />
            <span>{columnsById.get(member.columnId)?.name ?? member.columnId}</span>
            <select
              aria-label="Порядок сортировки"
              value={member.sortOrder}
              onChange={(event) =>
                setMembers((items) =>
                  items.map((item, index) =>
                    index === position ? { ...item, sortOrder: event.target.value as Schema.SortOrder } : item,
                  ),
                )
              }>
              {sortOrders.map((order) => (
                <option value={order} key={order}>
                  {order.toUpperCase()}
                </option>
              ))}
            </select>
            <button type="button" title="Выше" disabled={position === 0} onClick={() => move(position, -1)}>
              ↑
            </button>
            <button type="button" title="Ниже" disabled={position === members.length - 1} onClick={() => move(position, 1)}>
              ↓
            </button>
            <button
              type="button"
              title="Убрать"
              onClick={() => setMembers((items) => items.filter((_, index) => index !== position))}>
              X
            </button>
          </div>
        ))}
        {!members.length && <p className="table-inspector__empty">Добавьте хотя бы одну колонку</p>}
        {available.length > 0 && (
          <select
            aria-label="Добавить колонку"
            value=""
            onChange={(event) => setMembers((items) => [...items, { columnId: event.target.value, sortOrder: "asc" }])}>
            <option value="" disabled>
              + Добавить колонку
            </option>
            {available.map((column) => (
              <option value={column.id} key={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        )}
      </fieldset>
      <label>
        Условие WHERE
        <textarea
          name="indexWhere"
          defaultValue={value?.where ?? ""}
          placeholder="deleted_at IS NULL"
          maxLength={4000}
          rows={2}
        />
      </label>
    </>
  );
}

export function TableChecksFields({ value }: { value: Schema.TableCheck[] }) {
  const [rows, setRows] = useState(() => value.map((check, position) => ({ ...check, key: position })));
  const [nextKey, setNextKey] = useState(value.length);

  return (
    <fieldset className="constraint-columns">
      <legend>CHECK-ограничения таблицы</legend>
      {rows.map((row) => (
        <div className="constraint-check" key={row.key}>
          <input name="checkName" defaultValue={row.name ?? ""} placeholder="Имя (авто)" maxLength={255} />
          <textarea
            name="checkExpression"
            defaultValue={row.expression}
            placeholder="starts_at < ends_at"
            maxLength={4000}
            rows={2}
            required
          />
          <button
            type="button"
            title="Удалить ограничение"
            onClick={() => setRows((items) => items.filter((item) => item.key !== row.key))}>
            X
          </button>
        </div>
      ))}
      <button
        className="button button--secondary"
        type="button"
        onClick={() => {
          setRows((items) => [...items, { name: null, expression: "", key: nextKey }]);
          setNextKey((key) => key + 1);
        }}>
        + CHECK
      </button>
    </fieldset>
  );
}
