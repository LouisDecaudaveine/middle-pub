"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/atoms/popover";

import { Input } from "@/components/ui/atoms";
import { cn } from "@/lib/utils";

export interface Recommendation {
  id: string;
  label: string;
}

const ComboSearch = <T extends Recommendation>({
  placeholder,
  inputValue,
  handleInputChange,
  clearSearch,
  className,
  isLoading = false,
  recommendations = [],
  onSelectRecommendation,
}: {
  placeholder?: string;
  inputValue: string;
  handleInputChange: (value: string) => void;
  clearSearch: () => void;
  className?: React.ComponentProps<"div">["className"];
  isLoading?: boolean;
  recommendations?: T[];
  onSelectRecommendation?: (recommendation: T) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const showPopover = isFocused && recommendations.length > 0;

  const handleSelect = (recommendation: T) => {
    onSelectRecommendation?.(recommendation);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={showPopover}>
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            placeholder={placeholder}
            onChange={(e) => handleInputChange(e.target.value)}
            value={inputValue}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              // Delay hiding to allow click on recommendations
              if (
                !e.relatedTarget?.closest("[data-radix-popper-content-wrapper]")
              ) {
                setTimeout(() => setIsFocused(false), 150);
              }
            }}
          />
        </PopoverAnchor>
        {inputValue && (
          <button
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={16} />
          </button>
        )}
        <PopoverContent
          className="bg-white border-gray-200 p-0 w-(--radix-popover-trigger-width)"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : (
            <ul className="flex flex-col py-1">
              {recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => handleSelect(recommendation)}
                  >
                    {recommendation.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ComboSearch;
