// Google Maps Routes API Types
// Prefixed with "Google" to avoid conflicts with Mapbox types in map.ts

export interface GoogleLatLng {
  latitude: number;
  longitude: number;
}

export interface GoogleLocation {
  latLng: GoogleLatLng;
}

export interface GoogleWaypoint {
  location: GoogleLocation;
}

export type GoogleRouteTravelMode =
  | "TRAVEL_MODE_UNSPECIFIED"
  | "DRIVE"
  | "BICYCLE"
  | "WALK"
  | "TWO_WHEELER"
  | "TRANSIT";

export type GoogleRoutingPreference =
  | "ROUTING_PREFERENCE_UNSPECIFIED"
  | "TRAFFIC_UNAWARE"
  | "TRAFFIC_AWARE"
  | "TRAFFIC_AWARE_OPTIMAL";

export type GooglePolylineQuality =
  | "POLYLINE_QUALITY_UNSPECIFIED"
  | "HIGH_QUALITY"
  | "OVERVIEW";

export type GooglePolylineEncoding =
  | "POLYLINE_ENCODING_UNSPECIFIED"
  | "ENCODED_POLYLINE"
  | "GEO_JSON_LINESTRING";

export type GoogleUnits = "UNITS_UNSPECIFIED" | "METRIC" | "IMPERIAL";

export interface GoogleRouteModifiers {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  avoidIndoor?: boolean;
}

// Request types
export interface GoogleComputeRoutesRequest {
  origin: GoogleWaypoint;
  destination: GoogleWaypoint;
  intermediates?: GoogleWaypoint[];
  travelMode?: GoogleRouteTravelMode;
  routingPreference?: GoogleRoutingPreference;
  polylineQuality?: GooglePolylineQuality;
  polylineEncoding?: GooglePolylineEncoding;
  departureTime?: string;
  arrivalTime?: string;
  computeAlternativeRoutes?: boolean;
  routeModifiers?: GoogleRouteModifiers;
  languageCode?: string;
  regionCode?: string;
  units?: GoogleUnits;
}

// Response types
export interface GoogleLocalizedText {
  text: string;
  languageCode?: string;
}

export interface GooglePolyline {
  encodedPolyline?: string;
  geoJsonLinestring?: object;
}

export interface GoogleViewport {
  low: GoogleLatLng;
  high: GoogleLatLng;
}

export interface GoogleNavigationInstruction {
  maneuver: GoogleManeuver;
  instructions: string;
}

export type GoogleManeuver =
  | "MANEUVER_UNSPECIFIED"
  | "TURN_SLIGHT_LEFT"
  | "TURN_SHARP_LEFT"
  | "UTURN_LEFT"
  | "TURN_LEFT"
  | "TURN_SLIGHT_RIGHT"
  | "TURN_SHARP_RIGHT"
  | "UTURN_RIGHT"
  | "TURN_RIGHT"
  | "STRAIGHT"
  | "RAMP_LEFT"
  | "RAMP_RIGHT"
  | "MERGE"
  | "FORK_LEFT"
  | "FORK_RIGHT"
  | "FERRY"
  | "FERRY_TRAIN"
  | "ROUNDABOUT_LEFT"
  | "ROUNDABOUT_RIGHT"
  | "DEPART"
  | "NAME_CHANGE";

export interface GoogleRouteLegStepLocalizedValues {
  distance?: GoogleLocalizedText;
  staticDuration?: GoogleLocalizedText;
}

export interface GoogleRouteLegStep {
  distanceMeters?: number;
  staticDuration?: string;
  polyline?: GooglePolyline;
  startLocation?: GoogleLocation;
  endLocation?: GoogleLocation;
  navigationInstruction?: GoogleNavigationInstruction;
  localizedValues?: GoogleRouteLegStepLocalizedValues;
  travelMode?: GoogleRouteTravelMode;
}

export interface GoogleRouteLegLocalizedValues {
  distance?: GoogleLocalizedText;
  duration?: GoogleLocalizedText;
  staticDuration?: GoogleLocalizedText;
}

export interface GoogleRouteLeg {
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
  polyline?: GooglePolyline;
  startLocation?: GoogleLocation;
  endLocation?: GoogleLocation;
  steps?: GoogleRouteLegStep[];
  localizedValues?: GoogleRouteLegLocalizedValues;
}

export interface GoogleRouteLocalizedValues {
  distance?: GoogleLocalizedText;
  duration?: GoogleLocalizedText;
  staticDuration?: GoogleLocalizedText;
  transitFare?: GoogleLocalizedText;
}

export type GoogleRouteLabel =
  | "ROUTE_LABEL_UNSPECIFIED"
  | "DEFAULT_ROUTE"
  | "DEFAULT_ROUTE_ALTERNATE"
  | "FUEL_EFFICIENT"
  | "SHORTER_DISTANCE";

export interface GoogleRoute {
  routeLabels?: GoogleRouteLabel[];
  legs?: GoogleRouteLeg[];
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
  polyline?: GooglePolyline;
  description?: string;
  warnings?: string[];
  viewport?: GoogleViewport;
  localizedValues?: GoogleRouteLocalizedValues;
  routeToken?: string;
}

export interface GoogleFallbackInfo {
  routingMode?: string;
  reason?: string;
}

export interface GoogleGeocodedWaypoint {
  geocoderStatus?: object;
  type?: string[];
  partialMatch?: boolean;
  placeId?: string;
  intermediateWaypointRequestIndex?: number;
}

export interface GoogleGeocodingResults {
  origin?: GoogleGeocodedWaypoint;
  destination?: GoogleGeocodedWaypoint;
  intermediates?: GoogleGeocodedWaypoint[];
}

export interface GoogleComputeRoutesResponse {
  routes?: GoogleRoute[];
  fallbackInfo?: GoogleFallbackInfo;
  geocodingResults?: GoogleGeocodingResults;
}

// Simplified request/response for our API
export interface GoogleRouteRequestParams {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  travelMode?: GoogleRouteTravelMode;
  routingPreference?: GoogleRoutingPreference;
  units?: GoogleUnits;
  computeAlternativeRoutes?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
}

export interface GoogleRouteAPIResponse {
  success: boolean;
  data?: GoogleComputeRoutesResponse;
  error?: string;
}

export interface IRouteRequestParams {
  pointA: [number, number];
  pointB: [number, number];
  mode: "transit" | "walking" | "cycling";
}
