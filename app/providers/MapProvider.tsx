/**
 * MapProvider Component
 * Provides map context to all child components, allowing any component
 * in the tree to access the map instance via useMap hook.
 *
 * This separates the context/state management from the actual map rendering,
 * enabling components like SearchTab to access the map even when they're
 * not direct children of the map render component.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import type { Map as MapboxMap } from "mapbox-gl";

/**
 * Map Context Type
 */
interface MapContextType {
  /** The Mapbox map instance */
  map: MapboxMap | null;
  /** Whether the map has finished loading */
  isLoaded: boolean;
  /** Register the map instance (called by MapRender) */
  setMap: (map: MapboxMap | null) => void;
  /** Set the loaded state (called by MapRender) */
  setIsLoaded: (loaded: boolean) => void;
}

const MapContext = createContext<MapContextType | null>(null);

/**
 * Hook to access map instance from any component within MapProvider
 * @throws Error if used outside of MapProvider
 */
export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}

/**
 * MapProvider Props
 */
export interface MapProviderProps {
  /** Child components that need access to the map */
  children: ReactNode;
}

/**
 * MapProvider Component
 * Wrap your application or feature area with this provider to give
 * all child components access to the map instance.
 *
 * @example
 * ```tsx
 * <MapProvider>
 *   <MapRender>
 *     <PubMarkers data={pubs} />
 *   </MapRender>
 *   <SearchTab /> // Can now use useMap() hook!
 * </MapProvider>
 * ```
 */
export default function MapProvider({ children }: MapProviderProps) {
  const [map, setMapState] = useState<MapboxMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const setMap = useCallback((newMap: MapboxMap | null) => {
    setMapState(newMap);
  }, []);

  const setIsLoadedCallback = useCallback((loaded: boolean) => {
    setIsLoaded(loaded);
  }, []);

  const value = useMemo(
    () => ({
      map,
      isLoaded,
      setMap,
      setIsLoaded: setIsLoadedCallback,
    }),
    [map, isLoaded, setMap, setIsLoadedCallback]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

// Re-export the MapboxMap type for convenience
export type { MapboxMap };
