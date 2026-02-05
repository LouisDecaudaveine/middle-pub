"use client";

import { useCallback, useEffect, useState } from "react";

import { twMerge } from "tailwind-merge";

import { useDeviceFormat } from "@/hooks/useDeviceFormat";
import { UI_CONFIG } from "@/lib/constants";
import { IRouteRequestParams } from "@/types/routes";

import { ExternalLink } from "lucide-react";
import MapSearchInput from "@/components/ui/organisms/MapSearchInput";
import BottomSheet from "@/components/ui/molecules/BottomSheet";
import { PubFeature } from "@/types";
import Link from "next/link";

const SearchTabContent = ({
  onSearchChange,
  reccomendedPubs,
}: {
  onSearchChange: (req: IRouteRequestParams) => void;
  reccomendedPubs: PubFeature[] | null;
}) => {
  const [selectedTransport] = useState<"transit" | "walking" | "cycling">(
    "walking"
  );
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
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title="Find Pubs">
        <SearchTabContent
          onSearchChange={mobileOnSearchChange}
          reccomendedPubs={reccomendedPubs}
        />
      </BottomSheet>
    );
  }

  return (
    <div
      style={{ width: UI_CONFIG.SIDEBAR_WIDTH }}
      className={twMerge(
        "p-6 bg-white shadow-lg h-full flex flex-col gap-4 items-center max-h-screen",
        className
      )}
    >
      <h2 className="text-xl font-bold mb-4">Find Pubs</h2>

      <SearchTabContent
        onSearchChange={onSearchChange}
        reccomendedPubs={reccomendedPubs}
      />
    </div>
  );
};

export default SearchTab;
