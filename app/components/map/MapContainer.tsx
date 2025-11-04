/**
 * MapContainer Component
 * Main Mapbox map container for displaying London pubs
 * Using Mapbox GL JS v3.x directly for maximum control and performance
 * 
 * Uses compound component pattern with context to pass map instance to children
 */

'use client';

import { useEffect, useRef, useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import mapboxgl from 'mapbox-gl';
import type { Map as MapboxMap } from 'mapbox-gl';
import { twMerge } from 'tailwind-merge';

import { MAPBOX_CONFIG, LONDON_MAP_CONFIG } from '@/app/lib/constants';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * Map Context for sharing map instance with child components
 */
interface MapContextType {
  map: MapboxMap | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextType | null>(null);

/**
 * Hook to access map instance from child components
 */
export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapContainer');
  }
  return context;
}

/**
 * MapContainer Props
 */
export interface MapContainerProps {
  /** Custom CSS class name */
  className?: string;
  /** Initial center coordinates [lng, lat] */
  initialCenter?: [number, number];
  /** Initial zoom level */
  initialZoom?: number;
  /** Map style URL */
  style?: string;
  /** Callback when map is loaded */
  onLoad?: (map: MapboxMap) => void;
  /** Callback when map is clicked */
  onClick?: (e: mapboxgl.MapMouseEvent) => void;
  /** Whether to show navigation controls */
  showControls?: boolean;
  /** Whether to show fullscreen control */
  showFullscreen?: boolean;
  /** Child components that need access to map instance */
  children?: ReactNode;
}

/**
 * MapContainer Component
 */
export default function MapContainer({
  className = '',
  initialCenter = LONDON_MAP_CONFIG.CENTER,
  initialZoom = LONDON_MAP_CONFIG.DEFAULT_ZOOM,
  style = MAPBOX_CONFIG.STYLES.STREETS,
  onLoad,
  onClick,
  showControls = true,
  showFullscreen = false,
  children,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store callbacks in refs to avoid re-initializing map
  const onLoadRef = useRef(onLoad);
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Initialize map only once on mount
  useEffect(() => {
    // Check if Mapbox token is available
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    // Check if container exists
    if (!mapContainerRef.current) {
      return;
    }

    // Prevent double initialization
    if (mapRef.current) {
      return;
    }

    // Set Mapbox access token
    mapboxgl.accessToken = token;

    try {
      // Initialize map
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style,
        center: initialCenter,
        zoom: initialZoom,
        pitch: 0,
        bearing: 0,
        antialias: true,
        // Set bounds to London area to prevent excessive panning
        maxBounds: LONDON_MAP_CONFIG.MAX_BOUNDS as mapboxgl.LngLatBoundsLike,
      });

      // Store map instance
      mapRef.current = map;

      // Add navigation controls (zoom, rotation)
      if (showControls) {
        const nav = new mapboxgl.NavigationControl({
          visualizePitch: true,
        });
        map.addControl(nav, 'top-right');
      }

      // Add fullscreen control
      if (showFullscreen) {
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      }

      // Add scale control
      map.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: 'metric',
        }),
        'bottom-right'
      );

      // Handle map load event
      map.on('load', () => {
        console.log('Map loaded successfully');
        setIsLoading(false);
        setIsMapLoaded(true);
        setError(null);
        
        // Call onLoad callback if provided
        if (onLoadRef.current) {
          onLoadRef.current(map);
        }
      });

      // Handle map errors
      map.on('error', (e) => {
        console.error('Map error:', e.error);
        setError(e.error.message || 'Map loading error');
        setIsLoading(false);
      });

      // Handle map click events - use wrapper to always call latest callback
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        if (onClickRef.current) {
          onClickRef.current(e);
        }
      };
      map.on('click', handleClick);

      // Handle resize
      const handleResize = () => {
        map.resize();
      };
      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        map.off('click', handleClick);
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - map should only initialize once

  // Update map style when style prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(style);
  }, [style]);

  // Update map center when initialCenter prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(initialCenter);
  }, [initialCenter]);

  // Update map zoom when initialZoom prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(initialZoom);
  }, [initialZoom]);

  return (
    <MapContext.Provider value={{ map: mapRef.current, isLoaded: isMapLoaded }}>
      <div className={twMerge(`relative w-full h-full min-h-[400px] min-w-[300px] flex flex-col`, className)}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-4">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <p className="text-red-800 font-semibold mb-1">Map Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="flex-1 w-full"
        />

        {/* Child components that need access to map */}
        {children}
      </div>
    </MapContext.Provider>
  );
}

// Export the getMap function type for parent components
export type { MapboxMap };
