const historyActionLabels: Record<string, string> = {
  "table.create": "создание таблицы",
  "table.update": "изменение таблицы",
  "table.delete": "удаление таблицы",
  "column.create": "создание колонки",
  "column.update": "изменение колонки",
  "column.delete": "удаление колонки",
  "index.create": "создание индекса",
  "index.update": "изменение индекса",
  "index.delete": "удаление индекса",
  "relationship.create": "создание связи",
  "relationship.update": "изменение связи",
  "relationship.delete": "удаление связи",
  "group.create": "создание области",
  "group.update": "изменение области",
  "group.delete": "удаление области",
  "note.create": "создание заметки",
  "note.update": "изменение заметки",
  "note.delete": "удаление заметки",
};

export function formatHistoryAction(action: string): string {
  return historyActionLabels[action] ?? action;
}
