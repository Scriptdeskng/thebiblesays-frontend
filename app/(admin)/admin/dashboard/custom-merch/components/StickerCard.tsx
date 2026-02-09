/* eslint-disable @next/next/no-img-element */
"use client";

import { Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Sticker } from "../types";

interface StickerCardProps {
  sticker: Sticker;
  onToggleEnabled: (sticker: Sticker) => void;
  onDelete: (sticker: Sticker) => void;
}

export default function StickerCard({
  sticker,
  onToggleEnabled,
  onDelete,
}: StickerCardProps) {
  return (
    <div
      className={clsx(
        "border border-[#1A1A1A12] rounded-xl overflow-hidden",
        "bg-[#EEEEEE0A]"
      )}
    >
      <div
        className={clsx(
          "relative aspect-square bg-[#FFFFFF] flex items-center justify-center",
          "w-full h-[220px]"
        )}
      >
        {sticker.image ? (
          <img
            src={sticker.image}
            alt={sticker.name}
            className="w-full h-full object-contain object-center p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-admin-primary/40 text-sm">
            No image
          </div>
        )}

        <div className="bg-white">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleEnabled(sticker);
            }}
            className={`absolute top-[10px] right-2 px-2 py-[2px] rounded-[2px] text-[10px] text-white border shadow-2xl ${
              !sticker.is_active
                ? "bg-[#3291FF] border-[#3291FF4D]"
                : "bg-[#626262] border-[#62626233]"
            }`}
          >
            {sticker.is_active ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="max-w-[80%] font-semibold text-admin-primary truncate">
            {sticker.name}
          </h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sticker);
            }}
            className="p-1 rounded bg-white hover:bg-red-50 shrink-0"
            aria-label="Delete"
          >
            <Trash2 size={16} className="text-[#CA0F04]" />
          </button>
        </div>
      </div>
    </div>
  );
}
