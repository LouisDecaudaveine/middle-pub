import { twMerge } from "tailwind-merge";

interface MapSkeletonProps {
  className?: string;
}

const MapSkeleton = ({ className }: MapSkeletonProps) => {
  return (
    <div className={twMerge("flex-1 min-h-[400px] relative", className)}>
      <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <div className="h-4 bg-gray-400 rounded w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default MapSkeleton;
