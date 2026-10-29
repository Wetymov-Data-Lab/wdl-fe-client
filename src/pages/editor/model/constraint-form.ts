const indexTypeLabels: Record<Schema.IndexType, string> = {
  index: "INDEX",
  unique: "UNIQUE",
  primary: "PRIMARY KEY",
  fulltext: "FULLTEXT",
};

export function formatIndexType(type: Schema.IndexType): string {
  return indexTypeLabels[type];
}

export function readIndexForm(form: FormData): Schema.IndexInput {
  const text = (field: string) => String(form.get(field) ?? "").trim() || null;
  return {
    name: text("indexName"),
    type: String(form.get("indexType")) as Schema.IndexType,
    columns: form.getAll("indexColumns").map((value) => {
      const [columnId, sortOrder] = String(value).split(":");
      return { columnId, sortOrder: sortOrder as Schema.SortOrder };
    }),
    method: text("indexMethod"),
    where: text("indexWhere"),
  };
}

export function readTableChecks(form: FormData): Schema.TableCheck[] {
  const names = form.getAll("checkName");
  return form
    .getAll("checkExpression")
    .map((expression, position) => ({
      name: String(names[position] ?? "").trim() || null,
      expression: String(expression).trim(),
    }))
    .filter((check) => check.expression);
}

const cardinalityLabels: Record<Schema.RelationshipCardinality, string> = {
  zero_or_one: "0..1",
  exactly_one: "1",
  zero_or_many: "0..N",
  one_or_many: "1..N",
};

export function formatCardinality(cardinality: Schema.RelationshipCardinality): string {
  return cardinalityLabels[cardinality];
}

export function formatReferentialAction(action: Schema.ReferentialAction): string {
  return action.replace("_", " ").toUpperCase();
}

export function readRelationshipForm(form: FormData): Schema.UpdateRelationshipInput {
  return {
    name: String(form.get("relationshipName") ?? "").trim() || null,
    sourceCardinality: String(form.get("sourceCardinality")) as Schema.RelationshipCardinality,
    targetCardinality: String(form.get("targetCardinality")) as Schema.RelationshipCardinality,
    onDelete: String(form.get("onDelete")) as Schema.ReferentialAction,
    onUpdate: String(form.get("onUpdate")) as Schema.ReferentialAction,
  };
}
