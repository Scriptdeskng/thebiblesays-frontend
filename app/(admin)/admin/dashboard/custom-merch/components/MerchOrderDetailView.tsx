"use client";

import { formatCurrency } from "@/lib/utils";
import { getByomOrderProductImagePath } from "../lib/sideData";
import type {
  ByomOrderResult,
  ByomPricingBreakdown,
  PricingConfig,
} from "../types";

interface MerchOrderDetailViewProps {
  order: ByomOrderResult;
  pricing: PricingConfig | null;
  onBack: () => void;
}

type BreakdownLine = { label: string; amount: number };

function getBreakdownFromPricingBreakdown(pb: ByomPricingBreakdown): {
  lines: BreakdownLine[];
  total: number;
} {
  const lines: BreakdownLine[] = [
    { label: "Base customization fee", amount: pb.base_fee ?? 0 },
    { label: "Text customization fee", amount: pb.text_cost ?? 0 },
    { label: "Image customization fee", amount: pb.image_cost ?? 0 },
    { label: "Placement fee(s)", amount: pb.placement_total ?? 0 },
    { label: "Combination cost", amount: pb.combination_cost ?? 0 },
  ];
  return { lines, total: pb.total ?? 0 };
}

function getApplicableFees(
  order: ByomOrderResult,
  pricing: PricingConfig | null
): { lines: BreakdownLine[]; total: number } {
  if (order.pricing_breakdown) {
    return getBreakdownFromPricingBreakdown(order.pricing_breakdown);
  }
  if (!pricing) return { lines: [] as BreakdownLine[], total: 0 };
  const lines: BreakdownLine[] = [];
  lines.push({ label: "Base customization fee", amount: pricing.baseFee });

  const placement = (order.placement || "").toLowerCase();
  if (placement === "front")
    lines.push({ label: "Front customization fee", amount: pricing.frontFee });
  else if (placement === "back")
    lines.push({ label: "Back customization fee", amount: pricing.backFee });
  else if (placement === "side")
    lines.push({ label: "Side customization fee", amount: pricing.sideFee });
  else
    lines.push({ label: "Front customization fee", amount: pricing.frontFee });

  const hasText = !!(
    order.text?.trim() ||
    order.configuration_json?.back?.texts?.length ||
    order.configuration_json?.side?.texts?.length
  );
  if (hasText)
    lines.push({
      label: "Text customization fee",
      amount: pricing.textsCustomizationFee,
    });

  const hasImage = !!(
    order.uploaded_image ||
    order.configuration_json?.back?.assets?.length ||
    order.configuration_json?.side?.assets?.length
  );
  if (hasImage)
    lines.push({
      label: "Image customization fee",
      amount: pricing.imageCustomizationFee,
    });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total };
}

export default function MerchOrderDetailView({
  order,
  pricing,
  onBack,
}: MerchOrderDetailViewProps) {
  const { lines, total } = getApplicableFees(order, pricing);
  const productImage =
    order.uploaded_image ||
    getByomOrderProductImagePath({
      configuration_json: order.configuration_json,
      color: order.color,
      product_name: order.product_name,
      name: order.name,
    });
  const customText = order.text?.trim() || "—";
  const productChip = order.product_name || order.name || "—";

  return (
    <div className="overflow-hidden">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-admin-primary hover:text-admin-primary/80 mb-6 font-medium"
      >
        <div className="flex items-center justify-center bg-white border border-[#00000033] rounded-md">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
        Merch orders details
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: product image + custom texts */}
        <div className="space-y-6">
          <div className="bg-white rounded-[10px] border border-accent-2 overflow-hidden flex items-center justify-center min-h-[280px]">
            <div className="relative w-full aspect-square max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImage}
                alt={order.product_name || order.name || "Product"}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-admin-primary">
              Custom Texts
            </label>
            <div className="rounded-[10px] border border-[#0000000A] px-4 py-3 text-admin-primary">
              {customText}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-admin-primary">
              Tag
            </label>
            <span className="inline-flex items-center px-3 py-1.5 rounded-[20px] text-sm font-medium border border-[#3291FF4D] bg-[#3291FF14]">
              {productChip}
            </span>
          </div>
        </div>

        {/* Right: price breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-admin-primary mb-4">
            Price breakdown
          </h3>
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.label}
                className="flex justify-between items-center text-admin-primary"
              >
                <span className="text-sm">{line.label}</span>
                <span className="text-sm font-medium">
                  {formatCurrency(line.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-accent-2 flex justify-between items-center">
            <span className="font-semibold text-admin-primary">Total</span>
            <span className="text-lg font-bold text-admin-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
