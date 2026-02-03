"use client";

import { useState, useRef, useCallback } from "react";
import type { CustomMerch } from "@/types/admin.types";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import { transformApiDesignToCustomMerch } from "../lib/transformers";
import { getSideDataFromConfig } from "../lib/sideData";

export function useMerchDetail(reloadAssets: () => void) {
  const [selectedMerch, setSelectedMerch] = useState<CustomMerch | null>(null);
  const [selectedMerchConfig, setSelectedMerchConfig] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"front" | "back" | "side">(
    "front"
  );
  const [expandedMerchImage, setExpandedMerchImage] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalInfo, setApprovalInfo] = useState("");
  const merchImageRef = useRef<HTMLDivElement>(null);

  const sideData = {
    front: getSideDataFromConfig(selectedMerchConfig, "front"),
    back: getSideDataFromConfig(selectedMerchConfig, "back"),
    side: getSideDataFromConfig(selectedMerchConfig, "side"),
  };
  const currentSideData = sideData[selectedSide];

  const viewMerch = useCallback(async (merch: CustomMerch) => {
    setLoadingDetail(true);
    setShowDetail(true);
    setSelectedSide("front");
    try {
      const apiDesign = await dashboardService.getCustomMerchById(merch.id);
      const transformed = transformApiDesignToCustomMerch(apiDesign);
      setSelectedMerch(transformed);
      setSelectedMerchConfig(apiDesign);
    } catch {
      toast.error("Failed to load design details");
      setSelectedMerch(merch);
      setSelectedMerchConfig(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const backToList = useCallback(() => {
    setShowDetail(false);
    setSelectedMerch(null);
    setSelectedMerchConfig(null);
    setSelectedSide("front");
    setRejectionReason("");
    setApprovalInfo("");
  }, []);

  const downloadMerchImage = useCallback(async () => {
    if (!merchImageRef.current || !selectedMerch) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(merchImageRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement("a");
      link.download = `${selectedMerch.designName}-${selectedSide}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Failed to download image. Please try again.");
    }
  }, [selectedMerch, selectedSide]);

  const confirmReject = useCallback(async () => {
    if (!selectedMerch || rejecting) return;
    setRejecting(true);
    try {
      await dashboardService.rejectCustomMerch(
        selectedMerch.id,
        rejectionReason || undefined
      );
      await reloadAssets();
      toast.success("Design rejected successfully!");
      setShowRejectModal(false);
      setRejectionReason("");
      backToList();
    } catch {
      toast.error("Failed to reject design");
    } finally {
      setRejecting(false);
    }
  }, [selectedMerch, rejectionReason, rejecting, reloadAssets, backToList]);

  const confirmApprove = useCallback(async () => {
    if (!selectedMerch || approving) return;
    setApproving(true);
    try {
      await dashboardService.approveCustomMerch(selectedMerch.id);
      await reloadAssets();
      toast.success("Design approved successfully!");
      setShowApproveModal(false);
      setApprovalInfo("");
      backToList();
    } catch {
      toast.error("Failed to approve design");
    } finally {
      setApproving(false);
    }
  }, [selectedMerch, approving, reloadAssets, backToList]);

  return {
    selectedMerch,
    selectedMerchConfig,
    selectedSide,
    setSelectedSide,
    showDetail,
    loadingDetail,
    merchImageRef,
    expandedMerchImage,
    setExpandedMerchImage,
    currentSideData,
    showRejectModal,
    setShowRejectModal,
    rejectionReason,
    setRejectionReason,
    rejecting,
    showApproveModal,
    setShowApproveModal,
    approvalInfo,
    setApprovalInfo,
    approving,
    viewMerch,
    backToList,
    downloadMerchImage,
    confirmReject,
    confirmApprove,
  };
}
