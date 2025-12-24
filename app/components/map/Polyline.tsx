/**
 * Polyline Component
 * Renders a navigation route polyline on the map using Mapbox layers
 */

"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../providers/MapProvider";

export interface PolylineProps {
  /** Route coordinates as an array of [lng, lat] tuples */
  coordinates: [number, number][];
  /** Unique ID for this polyline (allows multiple polylines) */
  id?: string;
  /** Line color */
  color?: string;
  /** Line width */
  width?: number;
  /** Line opacity (0-1) */
  opacity?: number;
  /** Whether to show a dashed line */
  dashed?: boolean;
  /** Dash pattern [dash length, gap length] */
  dashPattern?: [number, number];
  /** Line cap style */
  lineCap?: "butt" | "round" | "square";
  /** Line join style */
  lineJoin?: "bevel" | "round" | "miter";
  /** Whether to fit the map bounds to the polyline */
  fitBounds?: boolean;
  /** Padding when fitting bounds */
  fitBoundsPadding?: number;
  /** Callback when polyline is clicked */
  onClick?: () => void;
}

export default function Polyline({
  coordinates,
  id = "route",
  color = "#3b82f6", // Blue
  width = 4,
  opacity = 0.8,
  dashed = false,
  dashPattern = [2, 2],
  lineCap = "round",
  lineJoin = "round",
  fitBounds = false,
  fitBoundsPadding = 50,
  onClick,
}: PolylineProps) {
  const { map, isLoaded } = useMap();
  const layerAddedRef = useRef(false);
  const onClickRef = useRef(onClick);

  // Keep onClick ref updated
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Add polyline when map is loaded
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (coordinates.length < 2) return;

    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;
    const outlineLayerId = `${id}-outline-layer`;

    // Cleanup function
    const cleanup = () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      layerAddedRef.current = false;
    };

    // Remove existing layers and source if they exist
    cleanup();

    // Create GeoJSON data for the line
    const geojsonData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    };

    // Add source
    map.addSource(sourceId, {
      type: "geojson",
      data: geojsonData,
    });

    // Add outline layer (for better visibility)
    map.addLayer({
      id: outlineLayerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": lineJoin,
        "line-cap": lineCap,
      },
      paint: {
        "line-color": "#ffffff",
        "line-width": width + 2,
        "line-opacity": opacity * 0.5,
      },
    });

    // Add main line layer
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": lineJoin,
        "line-cap": lineCap,
      },
      paint: {
        "line-color": color,
        "line-width": width,
        "line-opacity": opacity,
        ...(dashed && { "line-dasharray": dashPattern }),
      },
    });

    // Handle click events
    const handleClick = () => {
      if (onClickRef.current) {
        onClickRef.current();
      }
    };

    map.on("click", layerId, handleClick);

    // Change cursor on hover
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });

    layerAddedRef.current = true;

    // Fit bounds to the polyline if requested
    if (fitBounds && coordinates.length >= 2) {
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
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
    coordinates,
    id,
    color,
    width,
    opacity,
    dashed,
    dashPattern,
    lineCap,
    lineJoin,
    fitBounds,
    fitBoundsPadding,
  ]);

  // This component doesn't render anything visible
  return null;
}
