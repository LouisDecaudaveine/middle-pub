/**
 * PubMarkers Component
 * Renders pub markers on the map using Mapbox clustering
 */

'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from './MapContainer';
import type { PubFeatureCollection, PubFeature } from '@/app/types/pub';
import { CLUSTER_CONFIG, MARKER_CONFIG } from '@/app/lib/constants';

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
  sourceId = 'pubs',
}: PubMarkersProps) {
  const { map, isLoaded } = useMap();
  const layersAddedRef = useRef(false);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map || !isLoaded) return;

    const clusteredLayerId = `${sourceId}-clusters`;
    const clusterCountLayerId = `${sourceId}-cluster-count`;
    const unclusteredLayerId = `${sourceId}-unclustered`;

    // Remove existing layers and source if they exist
    const cleanup = () => {
      if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
      if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
      if (map.getLayer(clusteredLayerId)) map.removeLayer(clusteredLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      layersAddedRef.current = false;
    };

    cleanup();

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data,
      cluster: enableClustering,
      clusterMaxZoom: CLUSTER_CONFIG.MAX_ZOOM,
      clusterRadius: CLUSTER_CONFIG.RADIUS,
    });

    if (enableClustering) {
      // Add cluster circle layer
      map.addLayer({
        id: clusteredLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            MARKER_CONFIG.CLUSTER_COLORS.SMALL, // < 10 pubs
            10,
            MARKER_CONFIG.CLUSTER_COLORS.MEDIUM, // 10-50 pubs
            50,
            MARKER_CONFIG.CLUSTER_COLORS.LARGE, // > 50 pubs
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15, // Small clusters
            10,
            20, // Medium clusters
            50,
            25, // Large clusters
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Add cluster count label layer
      map.addLayer({
        id: clusterCountLayerId,
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
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
          const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
          map.easeTo({
            center: coordinates as [number, number],
            zoom: zoom || map.getZoom() + 2,
          });
        });
      };

      map.on('click', clusteredLayerId, handleClusterClick);

      // Change cursor on cluster hover
      map.on('mouseenter', clusteredLayerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', clusteredLayerId, () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // Add unclustered point layer
    map.addLayer({
      id: unclusteredLayerId,
      type: 'circle',
      source: sourceId,
      ...(enableClustering && { filter: ['!', ['has', 'point_count']] }),
      paint: {
        'circle-color': '#8B4513', // Saddle brown / beer color
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Add hover effect for unclustered points
    map.on('mouseenter', unclusteredLayerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', unclusteredLayerId, () => {
      map.getCanvas().style.cursor = '';
    });

    // Handle pub marker clicks
    const handlePubClick = (e: mapboxgl.MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      // Call the callback if provided
      if (onPubClick) {
        onPubClick(feature as unknown as PubFeature);
      }

      // Create and show popup
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const properties = feature.properties;
      
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
      
      const popupContent = `
        <div class="pub-popup" style="color: black;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: black;">${properties?.name || 'Unknown'}</h3>
          <p style="margin-bottom: 4px; color: black;">${properties?.address1 || ''}</p>
          ${properties?.postcode ? `<p style="margin-bottom: 8px; color: black;">${properties.postcode}</p>` : ''}
          <a href="${googleMapsUrl}" target="_blank" rel="noopener" style="color: #1a73e8; text-decoration: underline; display: block; margin-top: 8px;">View on Google Maps</a>
          ${properties?.website ? `<a href="${properties.website}" target="_blank" rel="noopener" style="color: #1a73e8; text-decoration: underline; display: block; margin-top: 4px;">🌐 Visit Website</a>` : ''}
        </div>
      `;

      new mapboxgl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: true,
      })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
    };

    map.on('click', unclusteredLayerId, handlePubClick);

    layersAddedRef.current = true;

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [map, isLoaded, data, enableClustering, sourceId, onPubClick]);

  // This component doesn't render anything visible
  return null;
}
