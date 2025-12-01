/**
 * Application Constants
 * Centralized configuration and constant values
 */

import type { LondonMapBounds } from "../types/map";

/**
 * London GIS API Configuration
 */
export const LONDON_GIS_API = {
  /** Base URL for the Cultural Infrastructure MapServer */
  BASE_URL:
    "https://gis2.london.gov.uk/server/rest/services/apps/Cultural_infrastructure_2023_for_webapp_verified/MapServer",

  /** Pubs layer ID */
  PUBS_LAYER_ID: 29,

  /** Query endpoint for pubs */
  PUBS_QUERY_URL:
    "https://gis2.london.gov.uk/server/rest/services/apps/Cultural_infrastructure_2023_for_webapp_verified/MapServer/29/query",

  /** Maximum records per request */
  MAX_RECORDS: 2000,

  /** Default query parameters */
  DEFAULT_PARAMS: {
    where: "1=1",
    outFields: "*",
    f: "geojson",
    outSR: 4326, // WGS84 spatial reference
  },
} as const;

/**
 * Mapbox Configuration
 */
export const MAPBOX_CONFIG = {
  /** Default map style */
  DEFAULT_STYLE: "mapbox://styles/mapbox/streets-v12",

  /** Available map styles */
  STYLES: {
    STREETS: "mapbox://styles/mapbox/streets-v12",
    LIGHT: "mapbox://styles/mapbox/light-v11",
    DARK: "mapbox://styles/mapbox/dark-v11",
    OUTDOORS: "mapbox://styles/mapbox/outdoors-v12",
    SATELLITE: "mapbox://styles/mapbox/satellite-v9",
    SATELLITE_STREETS: "mapbox://styles/mapbox/satellite-streets-v12",
  },

  /** Directions API profiles */
  DIRECTIONS_PROFILES: {
    DRIVING: "driving",
    WALKING: "walking",
    CYCLING: "cycling",
    DRIVING_TRAFFIC: "driving-traffic",
  },
} as const;

/**
 * London Map Configuration
 */
export const LONDON_MAP_CONFIG = {
  /** Center coordinates [longitude, latitude] */
  CENTER: [-0.1276, 51.5074] as [number, number],

  /** Default zoom level */
  DEFAULT_ZOOM: 10,

  /** Minimum zoom level */
  MIN_ZOOM: 8,

  /** Maximum zoom level */
  MAX_ZOOM: 18,

  /** London boundaries */
  BOUNDS: {
    north: 51.691874,
    south: 51.28676,
    east: 0.334015,
    west: -0.510375,
  } satisfies LondonMapBounds,

  /** Max bounds for map (to keep map centered on London) */
  MAX_BOUNDS: [
    [-0.510375, 51.28676], // Southwest coordinates
    [0.334015, 51.691874], // Northeast coordinates
  ] as [[number, number], [number, number]],
} as const;

/**
 * Clustering Configuration
 */
export const CLUSTER_CONFIG = {
  /** Enable clustering by default */
  ENABLED: true,

  /** Cluster radius in pixels */
  RADIUS: 50,

  /** Maximum zoom level for clustering */
  MAX_ZOOM: 14,

  /** Minimum points to form a cluster */
  MIN_POINTS: 2,
} as const;

/**
 * Marker Configuration
 */
export const MARKER_CONFIG = {
  /** Default marker color (pub/beer themed) */
  DEFAULT_COLOR: "#D4AF37", // Gold color

  /** Marker color when selected */
  SELECTED_COLOR: "#FF6B35", // Orange-red

  /** Marker color for closed pubs */
  CLOSED_COLOR: "#808080", // Gray

  /** Marker size in pixels */
  SIZE: 10,

  /** Cluster circle colors (based on count) */
  CLUSTER_COLORS: {
    SMALL: "#51bbd6", // < 10 pubs
    MEDIUM: "#f1f075", // 10-50 pubs
    LARGE: "#f28cb1", // > 50 pubs
  },
} as const;

/**
 * London Boroughs
 * All 32 London boroughs plus the City of London
 */
export const LONDON_BOROUGHS = [
  "Barking and Dagenham",
  "Barnet",
  "Bexley",
  "Brent",
  "Bromley",
  "Camden",
  "City of London",
  "Croydon",
  "Ealing",
  "Enfield",
  "Greenwich",
  "Hackney",
  "Hammersmith and Fulham",
  "Haringey",
  "Harrow",
  "Havering",
  "Hillingdon",
  "Hounslow",
  "Islington",
  "Kensington and Chelsea",
  "Kingston upon Thames",
  "Lambeth",
  "Lewisham",
  "Merton",
  "Newham",
  "Redbridge",
  "Richmond upon Thames",
  "Southwark",
  "Sutton",
  "Tower Hamlets",
  "Waltham Forest",
  "Wandsworth",
  "Westminster",
] as const;

/**
 * Type for London borough names
 */
export type LondonBorough = (typeof LONDON_BOROUGHS)[number];

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /** Popup max width */
  POPUP_MAX_WIDTH: "300px",

  /** Sidebar width on desktop */
  SIDEBAR_WIDTH: "350px",

  /** Mobile breakpoint (px) */
  // Make sure to update the tailwind breakpoint if this changes
  MOBILE_BREAKPOINT: 768,

  /** Debounce delay for search input (ms) */
  SEARCH_DEBOUNCE: 300,

  /** Animation duration (ms) */
  ANIMATION_DURATION: 300,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  /** Request timeout (ms) */
  TIMEOUT: 10000,

  /** Number of retries for failed requests */
  MAX_RETRIES: 3,

  /** Retry delay (ms) */
  RETRY_DELAY: 1000,
} as const;

/**
 * TanStack Query Configuration
 */
export const QUERY_CONFIG = {
  /** Stale time - how long data is considered fresh (5 minutes) */
  STALE_TIME: 5 * 60 * 1000,

  /** Cache time - how long unused data stays in cache (1 hour) */
  CACHE_TIME: 60 * 60 * 1000,

  /** Retry count for failed queries */
  RETRY: 3,

  /** Retry delay function (exponential backoff) */
  RETRY_DELAY: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),

  /** Refetch on window focus */
  REFETCH_ON_WINDOW_FOCUS: false,

  /** Refetch on reconnect */
  REFETCH_ON_RECONNECT: true,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  /** Enable directions feature */
  ENABLE_DIRECTIONS: true,

  /** Enable clustering */
  ENABLE_CLUSTERING: true,

  /** Enable search */
  ENABLE_SEARCH: true,

  /** Enable filters */
  ENABLE_FILTERS: true,

  /** Enable geolocation */
  ENABLE_GEOLOCATION: true,

  /** Enable dark mode toggle */
  ENABLE_DARK_MODE: false,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  API_FETCH_FAILED: "Failed to fetch pub data. Please try again.",
  API_TIMEOUT: "Request timed out. Please check your connection.",
  GEOLOCATION_DENIED:
    "Location access denied. Please enable location services.",
  GEOLOCATION_UNAVAILABLE: "Location is unavailable.",
  DIRECTIONS_FAILED: "Failed to get directions. Please try again.",
  MAP_LOAD_FAILED: "Failed to load map. Please refresh the page.",
  INVALID_COORDINATES: "Invalid coordinates provided.",
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  DATA_LOADED: "Pub data loaded successfully",
  DIRECTIONS_LOADED: "Directions loaded",
  LOCATION_FOUND: "Your location has been found",
} as const;
