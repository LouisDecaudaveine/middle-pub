"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";

import { twMerge } from "tailwind-merge";

import { useDeviceFormat } from "@/hooks/useDeviceFormat";
import { UI_CONFIG } from "@/lib/constants";
import { IRouteRequestParams } from "@/types/routes";

import { Bike, BusFront, Footprints, ExternalLink } from "lucide-react";
import MapSearchInput from "@/components/ui/organisms/MapSearchInput";
import { PubFeature } from "@/types";
import Link from "next/link";

const TransportButton = ({
  onClick,
  isSelected,
  Icon,
}: {
  onClick: () => void;
  isSelected: boolean;
  Icon: ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border border-transparent",
        isSelected ? "bg-gray-100 border-gray-400 " : "bg-white text-black"
      )}
    >
      {Icon}
    </button>
  );
};

const SearchTabContent = ({
  className,
  onSearchChange,
  reccomendedPubs,
}: {
  className?: string;
  onSearchChange: (req: IRouteRequestParams) => void;
  reccomendedPubs: PubFeature[] | null;
}) => {
  const [selectedTransport, setSelectedTransport] = useState<
    "transit" | "walking" | "cycling"
  >("walking");
  const [pointA, setPointA] = useState<[number, number]>();
  const [pointB, setPointB] = useState<[number, number]>();

  useEffect(() => {
    if (!pointA || !pointB) return;

    onSearchChange({ pointA, pointB, mode: selectedTransport });
  }, [pointA, pointB, selectedTransport, onSearchChange]);

  return (
    <>
      <div className="flex gap-2">
        {/* <TransportButton
          onClick={() => setSelectedTransport("cycling")}
          isSelected={selectedTransport === "cycling"}
          Icon={<Bike className="w-6 h-6 text-gray-600" />}
        />
        <TransportButton
          onClick={() => setSelectedTransport("walking")}
          isSelected={selectedTransport === "walking"}
          Icon={<Footprints className="w-6 h-6 text-gray-600" />}
        />
        <TransportButton
          onClick={() => setSelectedTransport("transit")}
          isSelected={selectedTransport === "transit"}
          Icon={<BusFront className="w-6 h-6 text-gray-600" />}
        /> */}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <MapSearchInput
          className="w-full"
          placeholder="Search point A"
          onSelect={(location) => setPointA(location.geometry.coordinates)}
          onDeselect={() => setPointA(undefined)}
          hideSelectedPin={Boolean(pointA) && Boolean(pointB)}
        />
        <MapSearchInput
          className="w-full"
          placeholder="Search point B"
          onSelect={(location) => setPointB(location.geometry.coordinates)}
          onDeselect={() => setPointB(undefined)}
          hideSelectedPin={Boolean(pointA) && Boolean(pointB)}
        />
      </div>

      <div className="grow w-full gap-2 overflow-y-auto min-h-0">
        <ul>
          {reccomendedPubs?.map((pub) => (
            <li
              key={pub.properties.objectid}
              className="p-2 border-b flex justify-between gap-4"
            >
              <div className="grow">
                <h3 className="font-semibold">{pub.properties.name}</h3>
                <p className="text-sm text-gray-600">
                  {pub.properties.address1}
                </p>
                <p className="text-sm text-gray-600">
                  {pub.properties.postcode}
                </p>
              </div>
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${pub.properties.name}, ${pub.properties.address1}, ${pub.properties.postcode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="my-auto"
              >
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop search UI elements go here */}
    </>
  );
};

const SearchTab = ({
  className,
  onSearchChange,
  reccomendedPubs,
}: {
  className?: string;
  onSearchChange: (req: IRouteRequestParams) => void;
  reccomendedPubs: PubFeature[] | null;
}) => {
  const { isMobile } = useDeviceFormat();
  const [isOpen, setIsOpen] = useState(false);

  const mobileOnSearchChange = useCallback(
    (req: IRouteRequestParams) => {
      setIsOpen(false);
      onSearchChange(req);
    },
    [onSearchChange]
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sliding Overlay */}
        <div
          className={twMerge(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-white rounded-t-2xl shadow-2xl",
            "transition-transform duration-300 ease-out",
            isOpen ? "translate-y-0" : "translate-y-[calc(90vh-80px)]"
          )}
          style={{ height: "90vh" }}
        >
          {/* Peek Header - Always visible at bottom */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex flex-col items-center pt-3 pb-4 px-4 cursor-pointer"
          >
            {/* Handle Bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mb-3" />

            {/* Peek Content */}
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-bold">Find Pubs</h2>
              <svg
                className={twMerge(
                  "w-5 h-5 transition-transform duration-300",
                  isOpen ? "rotate-180" : "rotate-0"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </div>
          </button>

          {/* Divider */}
          <div className="border-t" />

          {/* Content */}
          <div
            className="overflow-y-auto p-4"
            style={{ height: "calc(90vh - 80px)" }}
          >
            <SearchTabContent
              className={className}
              onSearchChange={mobileOnSearchChange}
              reccomendedPubs={reccomendedPubs}
            />
          </div>
        </div>
      </>
    );
  }

  //

  return (
    <div
      style={{ width: UI_CONFIG.SIDEBAR_WIDTH }}
      className={twMerge(
        "p-6 bg-white shadow-lg  h-full flex flex-col gap-4 items-center max-h-screen",
        className
      )}
    >
      <h2 className="text-xl font-bold mb-4">Find Pubs</h2>

      <SearchTabContent
        className={className}
        onSearchChange={onSearchChange}
        reccomendedPubs={reccomendedPubs}
      />
    </div>
  );
};

export default SearchTab;
