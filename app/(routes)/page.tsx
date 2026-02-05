"use client";

import { use, useCallback, useEffect, useState } from "react";

import { showToast } from "@/lib/toast";
import MapContainer from "@/components/map/MapContainer";
import MapProvider from "@/providers/MapProvider";
import PubMarkers from "@/components/map/PubMarkers";
import RoutePolyline from "@/components/map/RoutePolyline";
import SearchTab from "@/components/ui/layouts/SearchTab";
import { SkeletonLoader } from "@/components/ui";

import { usePubData } from "@/hooks/usePubData";

import { useRoutes } from "@/hooks/useRoutes";
import type { GoogleRouteLegStep, IRouteRequestParams } from "@/types/routes";
import {
  getRouteMidpointByDuration,
  filterPositionsWithinThreshold,
} from "@/lib/utils/coordinates";

const Page = () => {
  const {
    pubs,
    isLoading,
    isError: isPubError,
    filteredCount,
    totalCount,
  } = usePubData();

  const {
    data: routeData,
    isLoading: isRouteLoading,
    isError: isRouteError,
    getRoute,
  } = useRoutes({ travelMode: "TRANSIT" });

  const [routeRequestParams, setRouteRequestParams] = useState<{
    pointA?: [number, number];
    pointB?: [number, number];
    mode: "transit" | "walking" | "cycling";
  }>();

  // Derive route steps directly from routeData instead of storing in state
  const routeSteps = routeData?.routes?.[0]?.legs?.[0]?.steps ?? [];
  const midPoint = getRouteMidpointByDuration(routeSteps);
  const filteredPubsThresholdBool = midPoint
    ? filterPositionsWithinThreshold(
        midPoint,
        pubs.map((pub) => pub.geometry.coordinates),
        400
      )
    : new Array(pubs.length).fill(true);

  const filteredPubs = pubs
    .filter((_, index) => filteredPubsThresholdBool[index])
    .sort((a, b) => {
      const distA = midPoint
        ? Math.hypot(
            a.geometry.coordinates[0] - midPoint[0],
            a.geometry.coordinates[1] - midPoint[1]
          )
        : 0;
      const distB = midPoint
        ? Math.hypot(
            b.geometry.coordinates[0] - midPoint[0],
            b.geometry.coordinates[1] - midPoint[1]
          )
        : 0;
      return distA - distB;
    });

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

  useEffect(() => {
    if (isPubError) showToast(`Error loading pub data`, "error");

    if (isRouteError) showToast(`Error fetching route data`, "error");
  }, [isPubError, isRouteError]);

  const pubCollection = {
    type: "FeatureCollection" as const,
    features: filteredPubs,
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
          <div className="flex-1 desktop:h-full h-screen">
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
            <SearchTab
              onSearchChange={handleRouteRequestChange}
              reccomendedPubs={midPoint && filteredPubs}
            />
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
