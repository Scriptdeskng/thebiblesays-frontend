"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import type { PricingConfig } from "../types";
import { DEFAULT_PRICING } from "../constants";

export function usePricingConfig() {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [pricingId, setPricingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPricing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getPricingGlobal();
      const raw = Array.isArray(response)
        ? response.find((r: any) => r.is_global === true) ?? response[0]
        : response;
      if (raw && typeof raw === "object") {
        const id = raw.id != null ? Number(raw.id) : null;
        setPricingId(Number.isNaN(id) ? null : id);
        const num = (v: unknown) =>
          typeof v === "number" && !Number.isNaN(v)
            ? v
            : typeof v === "string"
            ? parseFloat(v) || 0
            : 0;
        setPricing({
          product:
            raw.product != null ? num(raw.product) : DEFAULT_PRICING.product,
          baseFee: num(
            raw.base_customization_fee ??
              raw.base_fee ??
              raw.base_byom_fee ??
              raw.baseFee
          ),
          imageCustomizationFee: num(
            raw.image_customization_cost ??
              raw.image_customization_fee ??
              raw.imageCustomizationFee
          ),
          textsCustomizationFee: num(
            raw.text_customization_cost ??
              raw.texts_customization_fee ??
              raw.text_customization_fee ??
              raw.textsCustomizationFee
          ),
          frontFee: num(
            raw.front_placement_cost ?? raw.front_fee ?? raw.frontFee
          ),
          backFee: num(raw.back_placement_cost ?? raw.back_fee ?? raw.backFee),
          sideFee: num(raw.side_placement_cost ?? raw.side_fee ?? raw.sideFee),
          is_active:
            typeof raw.is_active === "boolean"
              ? raw.is_active
              : DEFAULT_PRICING.is_active,
          priority: num(raw.priority) || DEFAULT_PRICING.priority,
        });
      }
    } catch {
      toast.error("Failed to load pricing configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePricing = useCallback(async () => {
    const payload = {
      product: pricing.product,
      base_customization_fee: String(pricing.baseFee),
      front_placement_cost: String(pricing.frontFee),
      back_placement_cost: String(pricing.backFee),
      side_placement_cost: String(pricing.sideFee),
      text_customization_cost: String(pricing.textsCustomizationFee),
      image_customization_cost: String(pricing.imageCustomizationFee),
      is_active: pricing.is_active,
      priority: pricing.priority,
    };
    setSaving(true);
    try {
      if (pricingId != null) {
        await dashboardService.patchPricingGlobal(pricingId, payload);
      } else {
        await dashboardService.createPricingGlobal(payload);
      }
      toast.success("Pricing configuration saved");
    } catch {
      toast.error("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  }, [pricing, pricingId]);

  return {
    pricing,
    setPricing,
    loading,
    saving,
    loadPricing,
    savePricing,
  };
}
