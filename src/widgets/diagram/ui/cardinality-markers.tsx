import { cardinalityMarkerId } from "@/widgets/diagram/model/cardinality-markers";

const cardinalities: Schema.RelationshipCardinality[] = ["exactly_one", "zero_or_one", "one_or_many", "zero_or_many"];

const crowFoot = "M12 10 L24 3 M12 10 L24 10 M12 10 L24 17";

/**
 * Значки нотации crow's foot. Маркер нарисован так, будто линия приходит слева и упирается
 * в таблицу справа; `auto-start-reverse` разворачивает его на начале линии.
 */
function CardinalitySymbol({ cardinality }: { cardinality: Schema.RelationshipCardinality }) {
  switch (cardinality) {
    case "exactly_one":
      return <path d="M14 4 V16 M18 4 V16" />;
    case "zero_or_one":
      return (
        <>
          <path d="M18 4 V16" />
          <circle cx="10" cy="10" r="3.5" />
        </>
      );
    case "one_or_many":
      return <path d={`M10 4 V16 ${crowFoot}`} />;
    case "zero_or_many":
      return (
        <>
          <path d={crowFoot} />
          <circle cx="7" cy="10" r="3.5" />
        </>
      );
  }
}

export function CardinalityMarkers() {
  return (
    <svg className="cardinality-markers" aria-hidden="true">
      <defs>
        {[false, true].flatMap((selected) =>
          cardinalities.map((cardinality) => (
            <marker
              key={cardinalityMarkerId(cardinality, selected)}
              id={cardinalityMarkerId(cardinality, selected)}
              className={`cardinality-marker ${selected ? "cardinality-marker--selected" : ""}`}
              viewBox="0 0 24 20"
              refX="24"
              refY="10"
              markerWidth="24"
              markerHeight="20"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse">
              <CardinalitySymbol cardinality={cardinality} />
            </marker>
          )),
        )}
      </defs>
    </svg>
  );
}
