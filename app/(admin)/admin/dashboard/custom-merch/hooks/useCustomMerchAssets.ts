"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomMerch } from "@/types/admin.types";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import {
  transformByomProductToCustomMerch,
  transformApiDesignToCustomMerch,
  isByomProduct,
} from "../lib/transformers";

export function useCustomMerchAssets() {
  const [customMerch, setCustomMerch] = useState<CustomMerch[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<
    Record<string, string>
  >({});
  const [assetEnabled, setAssetEnabled] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const apiData = await dashboardService.getCustomMerch({
        ordering: "-created_at",
      });
      const labels: Record<string, string> = {};
      const transformedData = apiData.map((item: any) => {
        if (isByomProduct(item)) {
          labels[String(item.id)] = item.category_name;
          return transformByomProductToCustomMerch(item);
        }
        return transformApiDesignToCustomMerch(item);
      });
      setCategoryLabels((prev) => ({ ...prev, ...labels }));
      setCustomMerch(transformedData);
      setAssetEnabled((prev) => {
        const next = { ...prev };
        transformedData.forEach((m) => {
          if (next[m.id] === undefined) next[m.id] = m.status === "approved";
        });
        return next;
      });
    } catch {
      toast.error("Failed to load custom merch designs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleAssetEnabled = useCallback((id: string) => {
    setAssetEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success("Asset status updated");
  }, []);

  const handleDeleteAsset = useCallback((merch: CustomMerch) => {
    if (confirm(`Delete "${merch.designName}"?`)) {
      setCustomMerch((prev) => prev.filter((m) => m.id !== merch.id));
      toast.success("Asset removed");
    }
  }, []);

  return {
    customMerch,
    categoryLabels,
    assetEnabled,
    loading,
    loadData,
    toggleAssetEnabled,
    handleDeleteAsset,
  };
}
