import {
  HeaderSkeleton,
  FooterSkeleton,
  MapSkeleton,
  SearchTabSkeleton,
} from "./skeleton";

const SkeletonLoader = () => {
  return (
    <div className="w-full h-screen flex flex-col animate-pulse">
      <HeaderSkeleton />

      {/* Main Content Skeleton */}
      <div className="bg-gray-400 flex-1 flex flex-col desktop:flex-row">
        <MapSkeleton />
        <SearchTabSkeleton />
      </div>

      <FooterSkeleton />
    </div>
  );
};

export default SkeletonLoader;
