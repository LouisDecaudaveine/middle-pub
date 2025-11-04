/**
 * Map-related Types
 * TypeScript interfaces for Mapbox and map configurations
 * 
 * NOTE: This file extends Mapbox GL JS types rather than recreating them.
 * We import and re-export Mapbox types, only defining custom types specific to our app.
 */

import type {
  Map as MapboxMap,
  MapboxOptions,
  PopupOptions,
  LngLatLike,
  LngLatBoundsLike,
  MapLayerMouseEvent,
  MapLayerTouchEvent,
  GeoJSONSource,
  AnySourceData,
} from 'mapbox-gl';

// Re-export commonly used Mapbox types for convenience
export type {
  MapboxMap,
  MapboxOptions,
  PopupOptions,
  LngLatLike,
  LngLatBoundsLike,
  MapLayerMouseEvent,
  MapLayerTouchEvent,
  GeoJSONSource,
  AnySourceData,
};

/**
 * Application-specific map configuration
 * Extends MapboxOptions with app-specific settings
 */
export interface AppMapConfig extends Partial<MapboxOptions> {
  /** Whether to show navigation controls */
  showNavigationControl?: boolean;
  
  /** Whether to show scale control */
  showScaleControl?: boolean;
  
  /** Whether to show geolocation control */
  showGeolocateControl?: boolean;
  
  /** Whether to enable marker clustering */
  enableClustering?: boolean;
}

/**
 * Map view state for our application
 */
export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

/**
 * London-specific map bounds
 */
export interface LondonMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Clustering configuration for pub markers
 */
export interface ClusterConfig {
  /** Whether to enable clustering */
  enabled: boolean;
  
  /** Cluster radius in pixels */
  clusterRadius?: number;
  
  /** Maximum zoom level for clustering */
  clusterMaxZoom?: number;
  
  /** Minimum number of points to form a cluster */
  clusterMinPoints?: number;
}

/**
 * Navigation/Directions types
 * These are custom types for our app's navigation features using Mapbox Directions API
 */

/**
 * Travel mode for directions
 */
export type TravelMode = 'driving' | 'walking' | 'cycling' | 'driving-traffic';

/**
 * Waypoint for directions
 */
export interface Waypoint {
  longitude: number;
  latitude: number;
  name?: string;
}

/**
 * Route step/instruction
 */
export interface RouteStep {
  /** Distance in meters */
  distance: number;
  
  /** Duration in seconds */
  duration: number;
  
  /** Instruction text */
  instruction: string;
  
  /** Maneuver type */
  maneuver?: string;
  
  /** Street/road name */
  name?: string;
  
  /** Coordinate of the step [lng, lat] */
  location: [number, number];
}

/**
 * Route leg (segment between waypoints)
 */
export interface RouteLeg {
  /** Distance in meters */
  distance: number;
  
  /** Duration in seconds */
  duration: number;
  
  /** Array of steps in this leg */
  steps: RouteStep[];
  
  /** Summary text */
  summary?: string;
}

/**
 * Complete route information from Mapbox Directions API
 */
export interface Route {
  /** Total distance in meters */
  distance: number;
  
  /** Total duration in seconds */
  duration: number;
  
  /** Route geometry as GeoJSON LineString */
  geometry: {
    type: 'LineString';
    coordinates: Array<[number, number]>;
  };
  
  /** Array of route legs */
  legs: RouteLeg[];
  
  /** Travel mode used */
  mode: TravelMode;
  
  /** Starting waypoint */
  origin: Waypoint;
  
  /** Ending waypoint */
  destination: Waypoint;
}

/**
 * Directions API response
 */
export interface DirectionsResponse {
  /** Array of possible routes */
  routes: Route[];
  
  /** Array of waypoints */
  waypoints: Waypoint[];
  
  /** Response code */
  code: string;
  
  /** Error message if any */
  message?: string;
}
