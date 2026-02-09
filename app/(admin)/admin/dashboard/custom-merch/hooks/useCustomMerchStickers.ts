"use client";

import { useState, useEffect, useCallback } from "react";
import type { Sticker } from "../types";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";

export function useCustomMerchStickers() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stickerToDelete, setStickerToDelete] = useState<Sticker | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [stickerToToggle, setStickerToToggle] = useState<Sticker | null>(null);
  const [pendingEnabled, setPendingEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStickers();
      setStickers(
        data.map((item: any) => ({
          id: item.id,
          name: item.name || "",
          image: item.image || "",
          is_active: item.is_active ?? true,
          created_at: item.created_at,
        }))
      );
    } catch {
      toast.error("Failed to load stickers");
      setStickers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStickerEnabled = useCallback((sticker: Sticker) => {
    setStickerToToggle(sticker);
    setPendingEnabled(!sticker.is_active);
    setShowToggleModal(true);
  }, []);

  const confirmToggle = useCallback(async () => {
    if (!stickerToToggle) return;
    setToggling(true);
    try {
      await dashboardService.patchSticker(stickerToToggle.id, {
        is_active: pendingEnabled,
      });
      setStickers((prev) =>
        prev.map((s) =>
          s.id === stickerToToggle.id ? { ...s, is_active: pendingEnabled } : s
        )
      );
      toast.success(`Sticker ${pendingEnabled ? "enabled" : "disabled"}`);
      setShowToggleModal(false);
      setStickerToToggle(null);
    } catch {
      toast.error("Failed to update sticker status");
    } finally {
      setToggling(false);
    }
  }, [stickerToToggle, pendingEnabled]);

  const handleDeleteSticker = useCallback((sticker: Sticker) => {
    setStickerToDelete(sticker);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!stickerToDelete) return;
    setDeleting(true);
    try {
      await dashboardService.deleteSticker(stickerToDelete.id);
      setStickers((prev) => prev.filter((s) => s.id !== stickerToDelete.id));
      toast.success("Sticker deleted");
      setShowDeleteModal(false);
      setStickerToDelete(null);
    } catch {
      toast.error("Failed to delete sticker");
    } finally {
      setDeleting(false);
    }
  }, [stickerToDelete]);

  return {
    stickers,
    loading,
    loadData,
    toggleStickerEnabled,
    handleDeleteSticker,
    showDeleteModal,
    setShowDeleteModal,
    stickerToDelete,
    confirmDelete,
    deleting,
    showToggleModal,
    setShowToggleModal,
    stickerToToggle,
    pendingEnabled,
    confirmToggle,
    toggling,
  };
}
