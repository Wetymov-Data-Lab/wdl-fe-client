declare module "*.svg?react" {
  import type React from "react";

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

type PublicEnvironment = {
  // ---------------------------------------------------------------------------
  // App
  // ---------------------------------------------------------------------------

  SERVICE_NAME: string;
  APP_ENV: "development" | "production" | "test";
  APP_VERSION: string;
  APP_HOST: string;
  APP_PORT: `${number}`;
  APP_URL: string;
  API_VERSION: `${number}`;

  // ---------------------------------------------------------------------------
  // WDL Core API
  // ---------------------------------------------------------------------------

  CORE_API_URL: string;
  CORE_API_TIMEOUT_MS: `${number}`;
  CORE_API_RETRY_COUNT: `${number}`;

  // ---------------------------------------------------------------------------
  // Identity service
  // ---------------------------------------------------------------------------

  AUTH_ENABLED: "true" | "false";
  IDENTITY_SERVICE_URL: string;
  IDENTITY_API_VERSION: `${number}`;

  // ---------------------------------------------------------------------------
  // Diagram editor
  // ---------------------------------------------------------------------------

  DIAGRAM_GRID_SIZE: `${number}`;
  DIAGRAM_SNAP_TO_GRID: "true" | "false";
  DIAGRAM_SHOW_RELATIONSHIP_LABELS: "true" | "false";
  DIAGRAM_MIN_ZOOM: `${number}`;
  DIAGRAM_MAX_ZOOM: `${number}`;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends PublicEnvironment {}
  }

  interface ImportMetaEnv extends PublicEnvironment {}

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
