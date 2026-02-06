/* eslint-disable @next/next/no-img-element */
"use client";

import { Trash2 } from "lucide-react";
import type { CustomMerch } from "@/types/admin.types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import clsx from "clsx";

interface AssetCardProps {
  merch: CustomMerch;
  categoryLabel: string;
  enabled: boolean;
  onView: (merch: CustomMerch) => void;
  onToggleEnabled: (merch: CustomMerch) => void;
  onDelete: (merch: CustomMerch) => void;
}

export default function AssetCard({
  merch,
  categoryLabel,
  enabled,
  onView,
  onToggleEnabled,
  onDelete,
}: AssetCardProps) {
  return (
    <div
      className={clsx(
        "border border-[#1A1A1A12] rounded-xl overflow-hidden",
        "bg-[#EEEEEE0A]"
      )}
      // onClick={() => onView(merch)}
    >
      <div
        className={clsx(
          "relative aspect-square bg-[#FFFFFF] flex items-center justify-center",
          "w-full h-[220px]"
        )}
      >
        {merch.image ? (
          <img
            src={merch.image}
            alt={merch.designName}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={`/byom/${String(merch.productType)
              .toLowerCase()
              .replace(/\s/g, "-")}-black.svg`}
            alt=""
            className="w-full h-full object-cover object-center opacity-60"
          />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleEnabled(merch);
          }}
          className={`absolute top-[10px] right-2 px-2 py-[2px] rounded-[2px] text-[8px] text-black border ${
            !enabled
              ? "bg-[#3291FF14] border-[#3291FF4D]"
              : "bg-[#62626214] border-[#62626233]"
          }`}
        >
          {enabled ? "Disable" : "Enable"}
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="max-w-[80%] font-semibold text-admin-primary truncate">
            {merch.designName}
          </h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(merch);
            }}
            className="p-1 rounded bg-white hover:bg-red-50 shrink-0"
            aria-label="Delete"
          >
            <Trash2 size={16} className="text-[#CA0F04]" />
          </button>
        </div>

        <p className="text-xs text-admin-primary mt-1">
          Category: {categoryLabel}
        </p>

        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-admin-primary">
            Date Added: {formatDateShort(merch.dateCreated)}
          </p>

          <span className="text-admin-primary">
            {formatCurrency(merch.amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
