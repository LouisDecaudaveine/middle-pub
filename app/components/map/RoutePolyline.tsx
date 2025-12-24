/**
 * RoutePolyline Component
 * Renders a multi-segment navigation route with different styles for each transport mode
 */

"use client";

import { useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../providers/MapProvider";
import { decodePolyline } from "@/lib/utils/coordinates";
import type { GoogleRouteLegStep } from "@/types/routes";

/**
 * Transport mode styling configuration
 */
export interface TransportModeStyle {
  color: string;
  width: number;
  dashed: boolean;
  dashPattern?: [number, number];
}

/**
 * Default styles for different transport modes
 */
export const TRANSPORT_MODE_STYLES: Record<string, TransportModeStyle> = {
  WALK: {
    color: "#3b82f6", // Blue
    width: 4,
    dashed: true,
    dashPattern: [2, 4],
  },
  TRANSIT: {
    color: "#6b7280", // Gray (default for transit)
    width: 5,
    dashed: false,
  },
  BUS: {
    color: "#ef4444", // Red
    width: 5,
    dashed: false,
  },
  TRAIN: {
    color: "#6b7280", // Gray
    width: 5,
    dashed: false,
  },
  SUBWAY: {
    color: "#6b7280", // Gray
    width: 5,
    dashed: false,
  },
  RAIL: {
    color: "#6b7280", // Gray
    width: 5,
    dashed: false,
  },
  DRIVE: {
    color: "#10b981", // Green
    width: 5,
    dashed: false,
  },
  BICYCLE: {
    color: "#8b5cf6", // Purple
    width: 4,
    dashed: false,
  },
  DEFAULT: {
    color: "#6b7280", // Gray
    width: 4,
    dashed: false,
  },
};

/**
 * Parsed segment from route steps
 */
export interface RouteSegment {
  coordinates: [number, number][];
  travelMode: string;
  style: TransportModeStyle;
  instruction?: string;
}

/**
 * Transition point between segments
 */
export interface TransitionPoint {
  coordinates: [number, number];
  fromMode: string;
  toMode: string;
}

export interface RoutePolylineProps {
  /** Route steps from Google Routes API */
  steps: GoogleRouteLegStep[];
  /** Unique ID prefix for this route */
  id?: string;
  /** Custom style overrides for transport modes */
  styleOverrides?: Partial<Record<string, Partial<TransportModeStyle>>>;
  /** Whether to show transition markers between segments */
  showTransitionMarkers?: boolean;
  /** Transition marker radius */
  transitionMarkerRadius?: number;
  /** Whether to fit the map bounds to the route */
  fitBounds?: boolean;
  /** Padding when fitting bounds */
  fitBoundsPadding?: number;
  /** Callback when a segment is clicked */
  onSegmentClick?: (segment: RouteSegment, index: number) => void;
}

/**
 * Detect transport mode from step data
 * Google Routes API may include mode info in navigationInstruction
 */
function detectTransportMode(step: GoogleRouteLegStep): string {
  // First check explicit travelMode
  if (step.travelMode) {
    return step.travelMode;
  }

  // Check navigation instruction for hints
  const instruction =
    step.navigationInstruction?.instructions?.toLowerCase() || "";

  if (instruction.includes("walk") || instruction.includes("turn")) {
    return "WALK";
  }
  if (instruction.includes("bus")) {
    return "BUS";
  }
  if (
    instruction.includes("train") ||
    instruction.includes("rail") ||
    instruction.includes("tube") ||
    instruction.includes("underground")
  ) {
    return "TRAIN";
  }
  if (instruction.includes("subway") || instruction.includes("metro")) {
    return "SUBWAY";
  }

  // Default based on maneuver
  const maneuver = step.navigationInstruction?.maneuver;
  if (
    maneuver === "DEPART" ||
    maneuver === "TURN_LEFT" ||
    maneuver === "TURN_RIGHT" ||
    maneuver === "STRAIGHT"
  ) {
    return "WALK";
  }

  return "TRANSIT";
}

/**
 * Get style for a transport mode
 */
function getStyleForMode(
  mode: string,
  overrides?: Partial<Record<string, Partial<TransportModeStyle>>>
): TransportModeStyle {
  const baseStyle =
    TRANSPORT_MODE_STYLES[mode] || TRANSPORT_MODE_STYLES.DEFAULT;
  const override = overrides?.[mode];

  if (override) {
    return { ...baseStyle, ...override };
  }

  return baseStyle;
}

export default function RoutePolyline({
  steps,
  id = "route",
  styleOverrides,
  showTransitionMarkers = true,
  transitionMarkerRadius = 6,
  fitBounds = false,
  fitBoundsPadding = 50,
  onSegmentClick,
}: RoutePolylineProps) {
  const { map, isLoaded } = useMap();
  const layersAddedRef = useRef(false);
  const onSegmentClickRef = useRef(onSegmentClick);

  useEffect(() => {
    onSegmentClickRef.current = onSegmentClick;
  }, [onSegmentClick]);

  // Parse steps into segments
  const { segments, transitionPoints, allCoordinates } = useMemo(() => {
    const segments: RouteSegment[] = [];
    const transitionPoints: TransitionPoint[] = [];
    const allCoordinates: [number, number][] = [];

    steps.forEach((step, index) => {
      const encodedPolyline = step.polyline?.encodedPolyline;
      if (!encodedPolyline) return;

      const coordinates = decodePolyline(encodedPolyline);
      if (coordinates.length === 0) return;

      const travelMode = detectTransportMode(step);
      const style = getStyleForMode(travelMode, styleOverrides);

      segments.push({
        coordinates,
        travelMode,
        style,
        instruction: step.navigationInstruction?.instructions,
      });

      allCoordinates.push(...coordinates);

      // Add transition point if this is not the last segment
      if (index < steps.length - 1) {
        const nextStep = steps[index + 1];
        const nextMode = detectTransportMode(nextStep);
        const lastCoord = coordinates[coordinates.length - 1];

        // Only add transition if modes are different
        if (travelMode !== nextMode) {
          transitionPoints.push({
            coordinates: lastCoord,
            fromMode: travelMode,
            toMode: nextMode,
          });
        }
      }
    });

    return { segments, transitionPoints, allCoordinates };
  }, [steps, styleOverrides]);

  // Add route layers when map is loaded
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (segments.length === 0) return;

    const layerIds: string[] = [];
    const sourceIds: string[] = [];

    // Cleanup function
    const cleanup = () => {
      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });
      sourceIds.forEach((sourceId) => {
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
      layersAddedRef.current = false;
    };

    cleanup();

    // Add each segment as a separate layer
    segments.forEach((segment, index) => {
      const sourceId = `${id}-segment-${index}-source`;
      const outlineLayerId = `${id}-segment-${index}-outline`;
      const layerId = `${id}-segment-${index}-layer`;

      sourceIds.push(sourceId);
      layerIds.push(outlineLayerId, layerId);

      const geojsonData: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {
          travelMode: segment.travelMode,
          instruction: segment.instruction,
        },
        geometry: {
          type: "LineString",
          coordinates: segment.coordinates,
        },
      };

      map.addSource(sourceId, {
        type: "geojson",
        data: geojsonData,
      });

      // Add outline layer
      map.addLayer({
        id: outlineLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": segment.style.width + 2,
          "line-opacity": 0.4,
        },
      });

      // Add main line layer
      const paintConfig: mapboxgl.LinePaint = {
        "line-color": segment.style.color,
        "line-width": segment.style.width,
        "line-opacity": 0.9,
      };

      if (segment.style.dashed && segment.style.dashPattern) {
        paintConfig["line-dasharray"] = segment.style.dashPattern;
      }

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": segment.style.dashed ? "butt" : "round",
        },
        paint: paintConfig,
      });

      // Handle click events
      map.on("click", layerId, () => {
        if (onSegmentClickRef.current) {
          onSegmentClickRef.current(segment, index);
        }
      });

      // Change cursor on hover
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    // Add transition markers
    if (showTransitionMarkers && transitionPoints.length > 0) {
      const markersSourceId = `${id}-transition-markers-source`;
      const markersLayerId = `${id}-transition-markers-layer`;
      const markersBorderLayerId = `${id}-transition-markers-border`;

      sourceIds.push(markersSourceId);
      layerIds.push(markersBorderLayerId, markersLayerId);

      const markersGeojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: "FeatureCollection",
        features: transitionPoints.map((point, index) => ({
          type: "Feature",
          properties: {
            fromMode: point.fromMode,
            toMode: point.toMode,
            index,
          },
          geometry: {
            type: "Point",
            coordinates: point.coordinates,
          },
        })),
      };

      map.addSource(markersSourceId, {
        type: "geojson",
        data: markersGeojson,
      });

      // Add border circle
      map.addLayer({
        id: markersBorderLayerId,
        type: "circle",
        source: markersSourceId,
        paint: {
          "circle-radius": transitionMarkerRadius + 2,
          "circle-color": "#ffffff",
          "circle-opacity": 1,
        },
      });

      // Add inner circle
      map.addLayer({
        id: markersLayerId,
        type: "circle",
        source: markersSourceId,
        paint: {
          "circle-radius": transitionMarkerRadius,
          "circle-color": "#1f2937", // Dark gray
          "circle-opacity": 1,
        },
      });
    }

    // Add start and end markers
    if (allCoordinates.length >= 2) {
      const startEndSourceId = `${id}-start-end-source`;
      const startEndBorderLayerId = `${id}-start-end-border`;
      const startEndLayerId = `${id}-start-end-layer`;

      sourceIds.push(startEndSourceId);
      layerIds.push(startEndBorderLayerId, startEndLayerId);

      const startEndGeojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { type: "start" },
            geometry: {
              type: "Point",
              coordinates: allCoordinates[0],
            },
          },
          {
            type: "Feature",
            properties: { type: "end" },
            geometry: {
              type: "Point",
              coordinates: allCoordinates[allCoordinates.length - 1],
            },
          },
        ],
      };

      map.addSource(startEndSourceId, {
        type: "geojson",
        data: startEndGeojson,
      });

      // Add border circle
      map.addLayer({
        id: startEndBorderLayerId,
        type: "circle",
        source: startEndSourceId,
        paint: {
          "circle-radius": 10,
          "circle-color": "#ffffff",
          "circle-opacity": 1,
        },
      });

      // Add inner circle with color based on type
      map.addLayer({
        id: startEndLayerId,
        type: "circle",
        source: startEndSourceId,
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "type"],
            "start",
            "#22c55e", // Green for start
            "end",
            "#ef4444", // Red for end
            "#6b7280", // Default gray
          ],
          "circle-opacity": 1,
        },
      });
    }

    layersAddedRef.current = true;

    // Fit bounds to the route if requested
    if (fitBounds && allCoordinates.length >= 2) {
      const bounds = allCoordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0])
      );

      map.fitBounds(bounds, {
        padding: fitBoundsPadding,
        duration: 500,
      });
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [
    map,
    isLoaded,
    segments,
    transitionPoints,
    allCoordinates,
    id,
    showTransitionMarkers,
    transitionMarkerRadius,
    fitBounds,
    fitBoundsPadding,
  ]);

  // This component doesn't render anything visible
  return null;
}
