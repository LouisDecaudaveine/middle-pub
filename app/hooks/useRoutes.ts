/**
 * useRoutes Hook
 * Custom React hook for fetching routes from Google Maps Routes API with TanStack Query
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import type {
  GoogleRouteRequestParams,
  GoogleRouteAPIResponse,
  GoogleComputeRoutesResponse,
  GoogleRouteTravelMode,
  GoogleRoutingPreference,
  GoogleUnits,
} from "@/types/routes";

/**
 * Query keys for TanStack Query
 */
export const routeQueryKeys = {
  all: ["routes"] as const,
  route: (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    travelMode: GoogleRouteTravelMode
  ) =>
    [
      ...routeQueryKeys.all,
      "route",
      originLat,
      originLng,
      destLat,
      destLng,
      travelMode,
    ] as const,
};

interface UseRoutesOptions {
  travelMode?: GoogleRouteTravelMode;
  routingPreference?: GoogleRoutingPreference;
  units?: GoogleUnits;
  computeAlternativeRoutes?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
}

interface RouteParams {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

interface UseRoutesReturn {
  data: GoogleComputeRoutesResponse | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  getRoute: (
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number
  ) => void;
  reset: () => void;
  refetch: () => void;
}

/**
 * Fetch route from our API endpoint
 */
async function fetchRoute(
  params: GoogleRouteRequestParams
): Promise<GoogleComputeRoutesResponse> {
  const response = await fetch("/api/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result: GoogleRouteAPIResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Failed to fetch route");
  }

  return result.data;
}

export function useRoutes(options: UseRoutesOptions = {}): UseRoutesReturn {
  const [routeParams, setRouteParams] = useState<RouteParams | null>(null);

  const {
    travelMode = "WALK",
    routingPreference,
    units = "METRIC",
    computeAlternativeRoutes = false,
    avoidTolls = false,
    avoidHighways = false,
    avoidFerries = false,
  } = options;

  // Build the request params when we have route params
  const requestParams: GoogleRouteRequestParams | null = routeParams
    ? {
        originLat: routeParams.originLat,
        originLng: routeParams.originLng,
        destinationLat: routeParams.destinationLat,
        destinationLng: routeParams.destinationLng,
        travelMode,
        routingPreference,
        units,
        computeAlternativeRoutes,
        avoidTolls,
        avoidHighways,
        avoidFerries,
      }
    : null;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: routeParams
      ? routeQueryKeys.route(
          routeParams.originLat,
          routeParams.originLng,
          routeParams.destinationLat,
          routeParams.destinationLng,
          travelMode
        )
      : routeQueryKeys.all,
    queryFn: () => fetchRoute(requestParams!),
    enabled: routeParams !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes - routes don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  const getRoute = useCallback(
    (
      originLat: number,
      originLng: number,
      destinationLat: number,
      destinationLng: number
    ) => {
      setRouteParams({
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      });
    },
    []
  );

  const reset = useCallback(() => {
    setRouteParams(null);
  }, []);

  return {
    data: data ?? null,
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
    getRoute,
    reset,
    refetch,
  };
}

/**
 * Hook for prefetching route data (useful for performance optimization)
 */
export function usePrefetchRoute() {
  const queryClient = useQueryClient();

  const prefetchRoute = useCallback(
    (
      params: GoogleRouteRequestParams,
      travelMode: GoogleRouteTravelMode = "WALK"
    ) => {
      queryClient.prefetchQuery({
        queryKey: routeQueryKeys.route(
          params.originLat,
          params.originLng,
          params.destinationLat,
          params.destinationLng,
          travelMode
        ),
        queryFn: () => fetchRoute(params),
      });
    },
    [queryClient]
  );

  return { prefetchRoute };
}
