import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/features/auth/model/auth-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: Number(import.meta.env.CORE_API_RETRY_COUNT),
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
