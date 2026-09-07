import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { fileURLToPath } from "node:url";

const { parsed } = loadEnv();
const developmentPort = Number(parsed.APP_PORT ?? 3000);
const sourceDirectory = fileURLToPath(new URL("./src", import.meta.url));
const clientEnvironmentKeys = [
  "SERVICE_NAME",
  "APP_VERSION",
  "APP_URL",
  "CORE_API_URL",
  "CORE_API_TIMEOUT_MS",
  "CORE_API_RETRY_COUNT",
  "AUTH_ENABLED",
  "IDENTITY_SERVICE_URL",
  "IDENTITY_API_VERSION",
  "DIAGRAM_GRID_SIZE",
  "DIAGRAM_SNAP_TO_GRID",
  "DIAGRAM_SHOW_RELATIONSHIP_LABELS",
  "DIAGRAM_MIN_ZOOM",
  "DIAGRAM_MAX_ZOOM",
] as const;
const clientEnvironmentDefinitions = Object.fromEntries(
  clientEnvironmentKeys.flatMap((key) => {
    const value = parsed[key];
    return value === undefined ? [] : [[`import.meta.env.${key}`, JSON.stringify(value)]];
  }),
);

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "WDL — Database Designer",
    tags: [
      {
        tag: "link",
        attrs: { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        append: true,
      },
    ],
  },
  source: {
    alias: {
      "@": sourceDirectory,
    },
    define: clientEnvironmentDefinitions,
  },
  server: {
    host: parsed.APP_HOST ?? "0.0.0.0",
    port: Number.isFinite(developmentPort) ? developmentPort : 3000,
  },
});
