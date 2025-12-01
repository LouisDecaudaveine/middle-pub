"use client";

import dynamic from "next/dynamic";
import { twMerge } from "tailwind-merge";

// Dynamically import SearchBox to prevent SSR issues
const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-10 bg-gray-100 animate-pulse rounded" />
    ),
  }
);

const MapSearchInput = ({
  className,
  onChange,
}: {
  className?: string;
  onChange?: (value: string) => void;
}) => {
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    console.warn("MapSearchInput: NEXT_PUBLIC_MAPBOX_TOKEN is not defined");
    return (
      <div className={twMerge("text-red-500", className)}>
        MapSearchInput: NEXT_PUBLIC_MAPBOX_TOKEN is not defined
      </div>
    );
  }

  return (
    <div className={twMerge("", className)}>
      <SearchBox
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        onChange={onChange}
      />
    </div>
  );
};

export default MapSearchInput;
