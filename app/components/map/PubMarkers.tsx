/**
 * PubMarkers Component
 * Renders pub markers on the map using Mapbox clustering
 */

"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "../../providers/MapProvider";
import type { PubFeatureCollection, PubFeature } from "@/types/pub";
import { CLUSTER_CONFIG, MARKER_CONFIG } from "@/lib/constants";
import Popup from "./map-popups";

interface ActivePub {
  coordinates: [number, number];
  properties: {
    name?: string;
    address1?: string;
    postcode?: string;
    website?: string;
  };
}

function PubPopupContent({
  properties,
}: {
  properties: ActivePub["properties"];
}) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${properties.name || ""}, ${properties.address1 || ""}, ${properties.postcode || ""}`
  )}`;

  return (
    <div className="min-w-[200px] max-w-[300px] desktop:max-w-[400px]">
      <h3 className="font-bold text-base mb-2">
        {properties.name || "Unknown"}
      </h3>
      {properties.address1 && (
        <p className="text-sm mb-1">{properties.address1}</p>
      )}
      {properties.postcode && (
        <p className="text-sm mb-3">{properties.postcode}</p>
      )}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline text-sm block"
      >
        Google Maps
      </a>
      {properties.website && (
        <a
          href={properties.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline text-sm block mt-1"
        >
          Website
        </a>
      )}
    </div>
  );
}

export interface PubMarkersProps {
  /** Pub data in GeoJSON format */
  data: PubFeatureCollection;
  /** Whether to enable clustering */
  enableClustering?: boolean;
  /** Callback when a pub marker is clicked */
  onPubClick?: (pub: PubFeature) => void;
  /** Source ID for the markers (allows multiple marker layers) */
  sourceId?: string;
}

export default function PubMarkers({
  data,
  enableClustering = false,
  onPubClick,
  sourceId = "pubs",
}: PubMarkersProps) {
  const { map, isLoaded } = useMap();
  const layersAddedRef = useRef(false);
  const [activePub, setActivePub] = useState<ActivePub | null>(null);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map || !isLoaded) return;

    const clusteredLayerId = `${sourceId}-clusters`;
    const clusterCountLayerId = `${sourceId}-cluster-count`;
    const unclusteredLayerId = `${sourceId}-unclustered`;

    // Remove existing layers and source if they exist
    const cleanup = () => {
      if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
      if (map.getLayer(clusterCountLayerId))
        map.removeLayer(clusterCountLayerId);
      if (map.getLayer(clusteredLayerId)) map.removeLayer(clusteredLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      layersAddedRef.current = false;
    };

    cleanup();

    // Add source
    map.addSource(sourceId, {
      type: "geojson",
      data,
      cluster: enableClustering,
      clusterMaxZoom: CLUSTER_CONFIG.MAX_ZOOM,
      clusterRadius: CLUSTER_CONFIG.RADIUS,
    });

    if (enableClustering) {
      // Add cluster circle layer
      map.addLayer({
        id: clusteredLayerId,
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            MARKER_CONFIG.CLUSTER_COLORS.SMALL, // < 10 pubs
            10,
            MARKER_CONFIG.CLUSTER_COLORS.MEDIUM, // 10-50 pubs
            50,
            MARKER_CONFIG.CLUSTER_COLORS.LARGE, // > 50 pubs
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            15, // Small clusters
            10,
            20, // Medium clusters
            50,
            25, // Large clusters
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Add cluster count label layer
      map.addLayer({
        id: clusterCountLayerId,
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Zoom to cluster on click
      const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [clusteredLayerId],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        if (!clusterId) return;

        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const coordinates = (features[0].geometry as GeoJSON.Point)
            .coordinates;
          map.easeTo({
            center: coordinates as [number, number],
            zoom: zoom || map.getZoom() + 2,
          });
        });
      };

      map.on("click", clusteredLayerId, handleClusterClick);

      // Change cursor on cluster hover
      map.on("mouseenter", clusteredLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", clusteredLayerId, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    // Add unclustered point layer
    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source: sourceId,
      ...(enableClustering && { filter: ["!", ["has", "point_count"]] }),
      paint: {
        "circle-color": "#8B4513", // Saddle brown / beer color
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          4, // At zoom 10 and below, radius is 4
          16,
          8, // At zoom 16 and above, radius is 8
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    // Add hover effect for unclustered points
    map.on("mouseenter", unclusteredLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", unclusteredLayerId, () => {
      map.getCanvas().style.cursor = "";
    });

    // Handle pub marker clicks
    const handlePubClick = (e: mapboxgl.MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      // Call the callback if provided
      if (onPubClick) {
        onPubClick(feature as unknown as PubFeature);
      }

      // Get coordinates and properties for popup
      const coordinates = (
        feature.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number];
      const properties = feature.properties;

      setActivePub({
        coordinates,
        properties: {
          name: properties?.name,
          address1: properties?.address1,
          postcode: properties?.postcode,
          website: properties?.website,
        },
      });
    };

    map.on("click", unclusteredLayerId, handlePubClick);

    layersAddedRef.current = true;

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [map, isLoaded, data, enableClustering, sourceId, onPubClick]);

  return activePub ? (
    <Popup
      longitude={activePub.coordinates[0]}
      latitude={activePub.coordinates[1]}
      offset={15}
      closeButton={true}
      closeOnClick={true}
      onClose={() => setActivePub(null)}
    >
      <PubPopupContent properties={activePub.properties} />
    </Popup>
  ) : null;
}
