export function cardinalityMarkerId(cardinality: Schema.RelationshipCardinality, selected = false): string {
  return `wdl-cardinality-${cardinality}${selected ? "-selected" : ""}`;
}
