/**
 * usePubData Hook
 * Custom React hook for fetching and managing pub data with TanStack Query
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  fetchAllPubs,
  fetchPubById,
  fetchPubsByBorough,
} from '../lib/services/londonGIS';
import type { PubFeature } from '../types/pub';

/**
 * Query keys for TanStack Query
 */
export const pubQueryKeys = {
  all: ['pubs'] as const,
  lists: () => [...pubQueryKeys.all, 'list'] as const,
  list: (filters?: PubFilters) => [...pubQueryKeys.lists(), filters] as const,
  details: () => [...pubQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...pubQueryKeys.details(), id] as const,
  borough: (borough: string) => [...pubQueryKeys.all, 'borough', borough] as const,
};

/**
 * Filter options for pubs
 */
export interface PubFilters {
  borough?: string;
  openStatus?: number;
  searchQuery?: string;
}

/**
 * Hook return type
 */
export interface UsePubDataReturn {
  // Data
  pubs: PubFeature[];
  allPubs: PubFeature[];
  filteredCount: number;
  totalCount: number;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filter state
  filters: PubFilters;
  setFilters: (filters: PubFilters) => void;
  clearFilters: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  refetch: () => void;
}

/**
 * Main hook for fetching all pubs with filtering and search
 */
export function usePubData(): UsePubDataReturn {
  const [filters, setFilters] = useState<PubFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all pubs using TanStack Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: pubQueryKeys.list(filters),
    queryFn: async () => {
      // If borough filter is set, fetch by borough for efficiency
      if (filters.borough) {
        return fetchPubsByBorough(filters.borough);
      }
      return fetchAllPubs();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (from QUERY_CONFIG)
    gcTime: 60 * 60 * 1000, // 1 hour cache (from QUERY_CONFIG)
  });

  const allPubs = useMemo(() => data?.features || [], [data]);

  // Client-side filtering and search
  const pubs = useMemo(() => {
    let filtered = allPubs;

    // Filter by open status
    if (filters.openStatus !== undefined) {
      filtered = filtered.filter(
        (pub) => pub.properties.open_status === filters.openStatus
      );
    }

    // Search by name, address, or postcode
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((pub) => {
        const { name, address1, address2, postcode, borough_name } = pub.properties;
        return (
          name.toLowerCase().includes(query) ||
          address1.toLowerCase().includes(query) ||
          address2?.toLowerCase().includes(query) ||
          postcode.toLowerCase().includes(query) ||
          borough_name.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [allPubs, filters.openStatus, searchQuery]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return {
    // Data
    pubs,
    allPubs,
    filteredCount: pubs.length,
    totalCount: allPubs.length,

    // Loading states
    isLoading,
    isError,
    error: error as Error | null,

    // Filter state
    filters,
    setFilters,
    clearFilters,

    // Search
    searchQuery,
    setSearchQuery,

    // Actions
    refetch,
  };
}

/**
 * Hook for fetching a single pub by ID
 */
export function usePub(id: number | null) {
  return useQuery({
    queryKey: pubQueryKeys.detail(id!),
    queryFn: () => fetchPubById(id!),
    enabled: id !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes (single pub data rarely changes)
  });
}

/**
 * Hook for fetching pubs by borough
 */
export function usePubsByBorough(borough: string | null) {
  return useQuery({
    queryKey: pubQueryKeys.borough(borough!),
    queryFn: () => fetchPubsByBorough(borough!),
    enabled: borough !== null && borough.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for prefetching pub data (useful for performance optimization)
 */
export function usePrefetchPubs() {
  const queryClient = useQueryClient();

  const prefetchAllPubs = () => {
    queryClient.prefetchQuery({
      queryKey: pubQueryKeys.list(),
      queryFn: fetchAllPubs,
    });
  };

  const prefetchPub = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: pubQueryKeys.detail(id),
      queryFn: () => fetchPubById(id),
    });
  };

  const prefetchBorough = (borough: string) => {
    queryClient.prefetchQuery({
      queryKey: pubQueryKeys.borough(borough),
      queryFn: () => fetchPubsByBorough(borough),
    });
  };

  return {
    prefetchAllPubs,
    prefetchPub,
    prefetchBorough,
  };
}
