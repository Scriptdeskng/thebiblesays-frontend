"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomMerch } from "@/types/admin.types";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import {
  transformByomProductToCustomMerch,
  transformApiDesignToCustomMerch,
  isByomProduct,
  inferProductCategory,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [merchToDelete, setMerchToDelete] = useState<CustomMerch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [merchToToggle, setMerchToToggle] = useState<CustomMerch | null>(null);
  const [pendingEnabled, setPendingEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const apiData = await dashboardService.getCustomMerch({
        ordering: "-created_at",
      });
      const labels: Record<string, string> = {};
      const transformedData = apiData.map((item: any) => {
        if (isByomProduct(item)) {
          labels[String(item.id)] =
            item.category_name ??
            inferProductCategory(item.name || item.slug || "");
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

  const toggleAssetEnabled = useCallback((merch: CustomMerch) => {
    const currentEnabled = assetEnabled[merch.id] ?? merch.status === "approved";
    setMerchToToggle(merch);
    setPendingEnabled(!currentEnabled);
    setShowToggleModal(true);
  }, [assetEnabled]);

  const confirmToggle = useCallback(async () => {
    if (!merchToToggle) return;
    setToggling(true);
    try {
      await dashboardService.toggleByomProductStatus(parseInt(merchToToggle.id, 10));
      setAssetEnabled((prev) => ({ ...prev, [merchToToggle.id]: pendingEnabled }));
      toast.success(`Asset ${pendingEnabled ? "enabled" : "disabled"}`);
      setShowToggleModal(false);
      setMerchToToggle(null);
      await loadData();
    } catch {
      toast.error("Failed to update asset status");
    } finally {
      setToggling(false);
    }
  }, [merchToToggle, pendingEnabled, loadData]);

  const handleDeleteAsset = useCallback((merch: CustomMerch) => {
    setMerchToDelete(merch);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!merchToDelete) return;
    setDeleting(true);
    try {
      await dashboardService.deleteByomProduct(parseInt(merchToDelete.id, 10));
      setCustomMerch((prev) => prev.filter((m) => m.id !== merchToDelete.id));
      toast.success("Asset deleted");
      setShowDeleteModal(false);
      setMerchToDelete(null);
      await loadData();
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setDeleting(false);
    }
  }, [merchToDelete, loadData]);

  return {
    customMerch,
    categoryLabels,
    assetEnabled,
    loading,
    loadData,
    toggleAssetEnabled,
    handleDeleteAsset,
    showDeleteModal,
    setShowDeleteModal,
    merchToDelete,
    confirmDelete,
    deleting,
    showToggleModal,
    setShowToggleModal,
    merchToToggle,
    pendingEnabled,
    confirmToggle,
    toggling,
  };
}
