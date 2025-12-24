"use client";

import { useCallback, useEffect, useState } from "react";

import MapContainer from "@/components/map/MapContainer";
import MapProvider from "@/providers/MapProvider";
import PubMarkers from "@/components/map/PubMarkers";
import RoutePolyline from "@/components/map/RoutePolyline";
import SearchTab from "@/components/ui/layouts/SearchTab";
import { SkeletonLoader } from "@/components/ui";
import { usePubData } from "@/hooks/usePubData";
import { useRoutes } from "@/hooks/useRoutes";
import type { GoogleRouteLegStep, IRouteRequestParams } from "@/types/routes";

const Page = () => {
  const { pubs, isLoading, isError, error, filteredCount, totalCount } =
    usePubData();
  const {
    data: routeData,
    isLoading: isRouteLoading,
    isError: isRouteError,
    error: routeError,
    getRoute,
  } = useRoutes({ travelMode: "TRANSIT" });

  const [routeRequestParams, setRouteRequestParams] = useState<{
    pointA?: [number, number];
    pointB?: [number, number];
    mode: "transit" | "walking" | "cycling";
  }>();

  // Derive route steps directly from routeData instead of storing in state
  const routeSteps = routeData?.routes?.[0]?.legs?.[0]?.steps ?? [];

  console.log("Route Steps:", routeSteps);

  const handleRouteRequestChange = useCallback((req: IRouteRequestParams) => {
    setRouteRequestParams(req);
  }, []);

  // Fetch route on mount
  useEffect(() => {
    if (routeRequestParams?.pointA && routeRequestParams?.pointB && getRoute) {
      const [startLng, startLat] = routeRequestParams.pointA;
      const [endLng, endLat] = routeRequestParams.pointB;
      getRoute(startLat, startLng, endLat, endLng);
    }
  }, [getRoute, routeRequestParams]);

  const pubCollection = {
    type: "FeatureCollection" as const,
    features: pubs,
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* <div className="bg-gray-300">
        <div className="p-4">Header</div>
      </div> */}
      <MapProvider>
        <div className="bg-gray-400 flex-1 flex flex-col desktop:flex-row">
          <div className="flex-1 h-full">
            <MapContainer showControls={true} showFullscreen={true}>
              <PubMarkers data={pubCollection} enableClustering={false} />
              {routeSteps && routeSteps.length > 0 && (
                <RoutePolyline
                  steps={routeSteps}
                  showTransitionMarkers={true}
                  fitBounds
                />
              )}
            </MapContainer>
          </div>
          <div>
            <SearchTab onSearchChange={handleRouteRequestChange} />
          </div>
        </div>
      </MapProvider>
      {/* <div className="bg-gray-300">
        <div className="p-4">Footer</div>
      </div> */}
    </div>
  );
};

export default Page;
