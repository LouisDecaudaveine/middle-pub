'use client';

/**
 * TanStack Query Provider
 * Wraps the app with React Query for data fetching and caching
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { QUERY_CONFIG } from '../lib/constants';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Creates a new QueryClient instance with app-specific defaults
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.STALE_TIME,
        gcTime: QUERY_CONFIG.CACHE_TIME,
        retry: QUERY_CONFIG.RETRY,
        retryDelay: QUERY_CONFIG.RETRY_DELAY,
        refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
        refetchOnReconnect: QUERY_CONFIG.REFETCH_ON_RECONNECT,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create a QueryClient instance
 * - Server: Always create a new client
 * - Browser: Reuse the same client (singleton)
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Query Provider Component
 * Provides React Query context to the entire app
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
