"use client";

import { useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";
import { toast } from "@/lib/toast";

const variantStyles = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
};

export const Toaster = () => {
  const toasts = useSyncExternalStore(
    toast.subscribe,
    toast.getSnapshot,
    toast.getSnapshot
  );

  if (toasts.length === 0) return null;

  // Reverse so newest toast appears at top
  const reversedToasts = [...toasts].reverse();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2 z-50">
      {reversedToasts.map((t, index) => (
        <div
          key={t.id}
          style={{
            animation: "slideInFromRight 0.3s ease-out forwards",
            transition: "transform 0.3s ease-out",
          }}
          className={twMerge(
            "p-4 rounded-lg max-w-96 shadow-lg",
            variantStyles[t.variant]
          )}
        >
          {t.message}
        </div>
      ))}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Toaster;
