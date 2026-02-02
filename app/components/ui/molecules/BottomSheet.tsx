"use client";

import { ReactNode, useCallback, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Title shown in the peek header */
  title: string;
  /** Content to render inside the sheet */
  children: ReactNode;
  /** Height of the sheet when open (default: 90vh) */
  sheetHeight?: string;
  /** Height of the peek header (default: 80px) */
  peekHeight?: number;
  /** Custom class for the sheet container */
  className?: string;
}

/**
 * BottomSheet - A draggable, toggleable slide-up panel for mobile
 * Supports touch gestures to open/close
 */
const BottomSheet = ({
  isOpen,
  onOpenChange,
  title,
  children,
  sheetHeight = "90vh",
  peekHeight = 80,
  className,
}: BottomSheetProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [wasOpenOnDragStart, setWasOpenOnDragStart] = useState(false);
  const dragStartY = useRef(0);

  // Drag handlers for swipe gesture
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      dragStartY.current = e.touches[0].clientY;
      setWasOpenOnDragStart(isOpen);
      setIsDragging(true);
    },
    [isOpen]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - dragStartY.current;

      // Limit drag range
      if (wasOpenOnDragStart) {
        // If open, only allow dragging down (positive diff)
        setDragOffset(Math.max(0, Math.min(diff, window.innerHeight * 0.9)));
      } else {
        // If closed, only allow dragging up (negative diff)
        setDragOffset(Math.min(0, Math.max(diff, -window.innerHeight * 0.9)));
      }
    },
    [isDragging, wasOpenOnDragStart]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    const threshold = 50; // pixels needed to trigger open/close

    if (wasOpenOnDragStart) {
      // Was open - close if dragged down enough
      if (dragOffset > threshold) {
        onOpenChange(false);
      }
    } else {
      // Was closed - open if dragged up enough
      if (dragOffset < -threshold) {
        onOpenChange(true);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, wasOpenOnDragStart, onOpenChange]);

  const handleClick = useCallback(() => {
    if (!isDragging) {
      onOpenChange(!isOpen);
    }
  }, [isDragging, isOpen, onOpenChange]);

  // Calculate transform based on drag state
  const getTransform = () => {
    if (isDragging) {
      if (wasOpenOnDragStart) {
        // Currently open, dragging down
        return `translateY(${dragOffset}px)`;
      } else {
        // Currently closed, dragging up
        return `translateY(calc(${sheetHeight} - ${peekHeight}px + ${dragOffset}px))`;
      }
    }
    return isOpen
      ? "translateY(0)"
      : `translateY(calc(${sheetHeight} - ${peekHeight}px))`;
  };

  // Calculate backdrop opacity
  const getBackdropOpacity = () => {
    if (isDragging) {
      if (wasOpenOnDragStart) {
        return Math.max(0, 1 - dragOffset / (window.innerHeight * 0.5));
      } else {
        return Math.min(1, Math.abs(dragOffset) / (window.innerHeight * 0.3));
      }
    }
    return isOpen ? 1 : 0;
  };

  return (
    <>
      {/* Backdrop */}
      {(isOpen || isDragging) && (
        <div
          className={twMerge(
            "fixed inset-0 bg-black/50 z-40",
            isDragging ? "" : "transition-opacity"
          )}
          style={{
            opacity: getBackdropOpacity(),
            pointerEvents: isOpen || isDragging ? "auto" : "none",
          }}
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sliding Sheet */}
      <div
        className={twMerge(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-white rounded-t-2xl shadow-2xl",
          isDragging ? "" : "transition-transform duration-300 ease-out",
          className
        )}
        style={{
          height: sheetHeight,
          transform: getTransform(),
        }}
      >
        {/* Peek Header - Draggable */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
          className="w-full flex flex-col items-center pt-3 pb-4 px-4 cursor-pointer touch-none"
        >
          {/* Handle Bar */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mb-3" />

          {/* Peek Content */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-bold">{title}</h2>
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
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Content */}
        <div
          className="overflow-y-auto p-4"
          style={{ height: `calc(${sheetHeight} - ${peekHeight}px)` }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
