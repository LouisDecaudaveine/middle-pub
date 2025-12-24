"use client";

import { useState, useEffect, useCallback } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { useMap } from "@/providers/MapProvider";
import { Input } from "@/components/ui/atoms";
import { LocationFeature, LocationSuggestion } from "@/lib/utils/mapbox";

import { cn } from "@/lib/utils";
import ComboSearch from "@/components/ui/molecules/ComboSearch";

export default function MapSearch({
  className,
  placeholder,
  onSelect,
  onDeselect,
}: {
  className?: string;
  placeholder?: string;
  onSelect: (newValue: LocationFeature) => void;
  onDeselect: () => void;
}) {
  const { map } = useMap();
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [results, setResults] = useState<
    (LocationSuggestion & { id: string; label: string })[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationFeature | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<LocationFeature[]>(
    []
  );
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const searchLocations = async () => {
      setIsSearching(true);

      try {
        const res = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
            debouncedQuery
          )}&access_token=${
            process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          }&session_token=${process.env.NEXT_PUBLIC_MAPBOX_SESSION_TOKEN}`
          // &country=UK&limit=5&proximity=-122.4194,37.7749`
        );

        const data = await res.json();
        const suggestions = data.suggestions?.map(
          (suggestion: LocationSuggestion) => ({
            ...suggestion,
            id: suggestion.mapbox_id,
            label: suggestion.name,
          })
        );
        setResults(suggestions ?? []);
      } catch (err) {
        console.error("Geocoding error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchLocations();
  }, [debouncedQuery]);

  useEffect(() => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  }, [selectedLocation, onSelect]);

  // Handle input change
  const handleInputChange = (value: string) => {
    console.log("Input changed:", value);
    setQuery(value);
    setDisplayValue(value);
  };

  // Handle location selection
  const handleSelect = async (suggestion: LocationSuggestion) => {
    try {
      setIsSearching(true);

      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&session_token=${process.env.NEXT_PUBLIC_MAPBOX_SESSION_TOKEN}`
      );

      const data = await res.json();
      const featuresData = data?.features;

      if (map && featuresData?.length > 0) {
        const coordinates = featuresData[0]?.geometry?.coordinates;

        map.flyTo({
          center: coordinates,
          zoom: 14,
          speed: 4,
          duration: 1000,
          essential: true,
        });

        setDisplayValue(suggestion.name);

        setSelectedLocations(featuresData);
        setSelectedLocation(featuresData[0]);

        setResults([]);
      }
    } catch (err) {
      console.error("Retrieve error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setDisplayValue("");
    setResults([]);
    setSelectedLocation(null);
    setSelectedLocations([]);
    onDeselect();
  }, [onDeselect]);

  return (
    <ComboSearch
      placeholder={placeholder}
      handleInputChange={handleInputChange}
      onSelectRecommendation={handleSelect}
      inputValue={displayValue}
      recommendations={results}
      isLoading={isSearching}
      clearSearch={clearSearch}
      className={className}
    />
  );
}
