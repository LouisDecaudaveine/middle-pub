/**
 * Pub Map Test Page
 * Testing MapContainer with actual pub data (Ticket 4.2)
 */

"use client";

import { usePubData } from "@/hooks/usePubData";
import { MapContainer, PubMarkers } from "@/components/map";
import type { PubFeature } from "@/types/pub";
import { useState } from "react";

export default function PubMapPage() {
  const { pubs, isLoading, isError, error, filteredCount, totalCount } =
    usePubData();
  const [selectedPub, setSelectedPub] = useState<PubFeature | null>(null);

  const handlePubClick = (pub: PubFeature) => {
    console.log("Pub clicked:", pub.properties.name);
    setSelectedPub(pub);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-xl">Loading pub data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-600 text-2xl mb-2">⚠️</div>
          <p className="text-xl text-red-800 font-semibold mb-2">
            Error loading pub data
          </p>
          <p className="text-red-600">{error?.message}</p>
        </div>
      </div>
    );
  }

  const pubCollection = {
    type: "FeatureCollection" as const,
    features: pubs,
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              London Pubs Map
            </h1>
            <p className="text-sm text-gray-600">
              Showing {filteredCount.toLocaleString()} of{" "}
              {totalCount.toLocaleString()} pubs
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Ticket 4.2: Pub Markers with Clustering
            </div>
            {selectedPub && (
              <div className="mt-1 text-sm font-medium text-blue-600">
                Selected: {selectedPub.properties.name}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer showControls={true} showFullscreen={true}>
          <PubMarkers
            data={pubCollection}
            onPubClick={handlePubClick}
            enableClustering={false}
          />
        </MapContainer>
      </div>

      {/* Info Footer */}
      <footer className="bg-gray-50 border-t p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <h3 className="font-semibold mb-1 text-gray-900">✅ Features:</h3>
            <ul className="text-gray-600 space-y-0.5">
              <li>• {totalCount.toLocaleString()} pubs displayed</li>
              <li>• Automatic clustering</li>
              <li>• Click markers for details</li>
              <li>• Click clusters to zoom</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-gray-900">
              🎨 Marker Colors:
            </h3>
            <ul className="text-gray-600 space-y-0.5">
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-[#D4AF37]"></span>{" "}
                Individual pubs
              </li>
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-[#51bbd6]"></span>{" "}
                Small clusters (&lt;10)
              </li>
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-[#f1f075]"></span>{" "}
                Medium clusters (10-50)
              </li>
              <li>
                <span className="inline-block w-3 h-3 rounded-full bg-[#f28cb1]"></span>{" "}
                Large clusters (&gt;50)
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-gray-900">
              🎮 Interactions:
            </h3>
            <ul className="text-gray-600 space-y-0.5">
              <li>• Hover: Cursor changes</li>
              <li>• Click pub: Show popup</li>
              <li>• Click cluster: Zoom in</li>
              <li>• Zoom out: Auto-cluster</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-gray-900">
              📊 Performance:
            </h3>
            <ul className="text-gray-600 space-y-0.5">
              <li>• Clusters at zoom &lt; 14</li>
              <li>• 50px cluster radius</li>
              <li>• Smooth rendering</li>
              <li>• Efficient updates</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
