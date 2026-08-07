import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { env } from "@/shared/config/env";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: env.coreApi.retryCount, refetchOnWindowFocus: false } },
});

export function AppProviders({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
