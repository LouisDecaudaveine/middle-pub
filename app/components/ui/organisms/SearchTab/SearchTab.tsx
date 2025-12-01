"use client";

import { ReactNode, useState } from "react";

import { twMerge } from "tailwind-merge";

import { useDeviceFormat } from "@/hooks/useDeviceFormat";
import { UI_CONFIG } from "@/lib/constants";

import { Bike, BusFront, Footprints } from "lucide-react";
import MapSearchInput from "@/components/ui/MapSearchInput";

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

const SearchTab = ({ className }: { className?: string }) => {
  const { isMobile } = useDeviceFormat();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<
    "transit" | "walking" | "cycling"
  >("walking");

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
            {/* Mobile search UI elements go here */}
            <p className="text-gray-600">Search content goes here...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      style={{ width: UI_CONFIG.SIDEBAR_WIDTH }}
      className={twMerge(
        "p-6 bg-white shadow-lg  h-full flex flex-col gap-4 items-center",
        className
      )}
    >
      <h2 className="text-xl font-bold mb-4">Find Pub</h2>

      <div className="flex gap-2">
        <TransportButton
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
        />
      </div>

      <MapSearchInput />

      <input
        placeholder="Start Point A"
        className="border border-gray-300 rounded-md p-2 w-full"
      />
      <input
        placeholder="Start Point B"
        className="border border-gray-300 rounded-md p-2 w-full"
      />

      {/* Desktop search UI elements go here */}
    </div>
  );
};

export default SearchTab;
