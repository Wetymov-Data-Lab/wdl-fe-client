const source = import.meta.env;

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(value: string | undefined, fallback: boolean): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function urlValue(value: string | undefined, fallback: string): string {
  return (value ?? fallback).replace(/\/$/, "");
}

export const env = {
  app: {
    name: source.SERVICE_NAME ?? "wdl-fe-client",
    version: source.APP_VERSION ?? "1.0.0",
    url: urlValue(source.APP_URL, "http://localhost:3000"),
  },
  coreApi: {
    url: urlValue(source.CORE_API_URL, "http://localhost:8000"),
    timeoutMs: numberValue(source.CORE_API_TIMEOUT_MS, 10_000),
    retryCount: numberValue(source.CORE_API_RETRY_COUNT, 1),
    developmentAuthorId: source.DEVELOPMENT_AUTHOR_ID ?? "00000000-0000-4000-8000-000000000001",
  },
  identity: {
    enabled: booleanValue(source.AUTH_ENABLED, false),
    url: urlValue(source.IDENTITY_SERVICE_URL, "http://localhost:5001"),
    apiVersion: source.IDENTITY_API_VERSION ?? "1",
  },
  diagram: {
    gridSize: numberValue(source.DIAGRAM_GRID_SIZE, 20),
    snapToGrid: booleanValue(source.DIAGRAM_SNAP_TO_GRID, true),
    showRelationshipLabels: booleanValue(source.DIAGRAM_SHOW_RELATIONSHIP_LABELS, true),
    minZoom: numberValue(source.DIAGRAM_MIN_ZOOM, 0.25),
    maxZoom: numberValue(source.DIAGRAM_MAX_ZOOM, 1.8),
  },
} as const;
