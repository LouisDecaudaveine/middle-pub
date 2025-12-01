"use client";

import { useEffect } from "react";

import MapContainer from "@/components/map/MapContainer";
import PubMarkers from "@/components/map/PubMarkers";
import RoutePolyline from "@/components/map/RoutePolyline";
import SearchTab from "@/components/ui/organisms/SearchTab";
import { SkeletonLoader } from "@/components/ui";
import { usePubData } from "@/hooks/usePubData";
import { useRoutes } from "@/hooks/useRoutes";

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

  // Fetch route on mount
  useEffect(() => {
    getRoute(51.566319, -0.273811, 51.558518, -0.176127);
  }, [getRoute]);

  // Log route data for testing
  useEffect(() => {
    if (routeData) {
      console.log("Route data:", routeData);
      if (routeData.routes?.[0]) {
        const route = routeData.routes[0];
        console.log("Distance:", route.distanceMeters, "meters");
        console.log("Duration:", route.duration);
        console.log("Polyline:", route.polyline?.encodedPolyline);
      }
    }
    if (routeError) {
      console.error("Route error:", routeError);
    }
  }, [routeData, routeError]);

  // Get route steps for the RoutePolyline component
  const routeSteps = routeData?.routes?.[0]?.legs?.[0]?.steps;

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
          <SearchTab />
        </div>
      </div>
      {/* <div className="bg-gray-300">
        <div className="p-4">Footer</div>
      </div> */}
    </div>
  );
};

export default Page;
