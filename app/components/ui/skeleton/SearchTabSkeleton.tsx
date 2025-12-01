"use client";

import { useDeviceFormat } from "@/hooks/useDeviceFormat";
import { UI_CONFIG } from "@/lib/constants";

const SearchTabSkeleton = () => {
  const { isMobile } = useDeviceFormat();

  return (
    <div
      className="bg-white"
      style={{
        width: isMobile ? "100%" : UI_CONFIG.SIDEBAR_WIDTH,
      }}
    >
      <div className="p-4 space-y-4">
        {/* Search Bar Skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>

        {/* Filter Options Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-20"></div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 rounded-full w-16"></div>
          </div>
        </div>

        {/* Pub Cards Skeleton */}
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              {/* Title */}
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>

              {/* Address */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Tags/Badges */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchTabSkeleton;
