/**
 * Map Components
 * Barrel export for all map-related components
 */

export { default as MapProvider, useMap } from "../../providers/MapProvider";
export type { MapProviderProps, MapboxMap } from "../../providers/MapProvider";

export { default as MapContainer } from "./MapContainer";
export type { MapContainerProps } from "./MapContainer";

export { default as PubMarkers } from "./PubMarkers";
export type { PubMarkersProps } from "./PubMarkers";

export { default as Polyline } from "./Polyline";
export type { PolylineProps } from "./Polyline";

export {
  default as RoutePolyline,
  TRANSPORT_MODE_STYLES,
} from "./RoutePolyline";
export type {
  RoutePolylineProps,
  RouteSegment,
  TransitionPoint,
  TransportModeStyle,
} from "./RoutePolyline";

// TODO: Export other map components as they're implemented
// export { default as NavigationControls } from './NavigationControls';
