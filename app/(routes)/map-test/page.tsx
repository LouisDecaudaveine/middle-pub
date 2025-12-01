/**
 * Map Test Page
 * Testing the MapContainer component
 */

'use client';

import MapContainer from '../components/map/MapContainer';
import mapboxgl from 'mapbox-gl';
import type { Map as MapboxMap } from 'mapbox-gl';

export default function MapTestPage() {
  const handleMapLoad = (map: MapboxMap) => {
    console.log('Map loaded! Map instance:', map);
    
    // Example: Add a marker at London center
    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat([-0.1276, 51.5074])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<h3>London</h3><p>Center of London</p>')
      )
      .addTo(map);
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    console.log('Map clicked at:', e.lngLat);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">Map Test - Ticket 4.1</h1>
        <p className="text-gray-600">Testing MapContainer component with Mapbox GL JS</p>
      </header>

      {/* Map Container */}
      <div className="flex-1 p-4">
        <div className="h-full min-h-[600px] border rounded-lg overflow-hidden shadow-lg">
          <MapContainer
            onLoad={handleMapLoad}
            onClick={handleMapClick}
            showControls={true}
            showFullscreen={true}
            className='min-h-[600px]'
          />
        </div>
      </div>

      {/* Info Panel */}
      <footer className="bg-gray-50 border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">✅ Features Implemented:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Map initialization with Mapbox GL JS</li>
              <li>• Centered on London with appropriate zoom</li>
              <li>• Navigation controls (zoom, rotation)</li>
              <li>• Fullscreen control</li>
              <li>• Scale control</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">🎮 Controls:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Scroll to zoom</li>
              <li>• Click + drag to pan</li>
              <li>• Ctrl + drag to rotate</li>
              <li>• Right click + drag to pitch</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">📊 Map Info:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Style: Mapbox Streets</li>
              <li>• Center: London [-0.1276, 51.5074]</li>
              <li>• Zoom: 10</li>
              <li>• Bounds: Constrained to London</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
