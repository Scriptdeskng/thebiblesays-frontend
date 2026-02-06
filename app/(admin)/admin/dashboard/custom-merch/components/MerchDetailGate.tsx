"use client";

import { LoadingSpinner } from "@/components/admin/ui";
import MerchDetailView from "./MerchDetailView";

/** Shape expected from useMerchDetail() when passed to MerchDetailGate */
export interface MerchDetailGateProps {
  showDetail: boolean;
  loadingDetail: boolean;
  selectedMerch: any;
  selectedSide: "front" | "back" | "side";
  setSelectedSide: (side: "front" | "back" | "side") => void;
  currentSideData: {
    baseImage: string;
    texts: any[];
    stickers: any[];
    color: string;
    colorName: string;
    size: string;
  };
  merchImageRef: React.RefObject<HTMLDivElement | null>;
  backToList: () => void;
  setExpandedMerchImage: (v: boolean) => void;
  downloadMerchImage: () => void;
  expandedMerchImage: boolean;
  showRejectModal: boolean;
  setShowRejectModal: (v: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (v: string) => void;
  rejecting: boolean;
  confirmReject: () => void;
  showApproveModal: boolean;
  setShowApproveModal: (v: boolean) => void;
  approvalInfo: string;
  setApprovalInfo: (v: string) => void;
  approving: boolean;
  confirmApprove: () => void;
}

export default function MerchDetailGate(d: MerchDetailGateProps) {
  if (!d.showDetail) return null;

  if (d.loadingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!d.selectedMerch) return null;

  const s = d.currentSideData;
  return (
    <MerchDetailView
      selectedMerch={d.selectedMerch}
      selectedSide={d.selectedSide}
      setSelectedSide={d.setSelectedSide}
      currentSideData={{
        baseImage: s.baseImage,
        texts: s.texts,
        stickers: s.stickers,
        color: s.color,
        colorName: s.colorName,
        size: s.size,
      }}
      merchImageRef={d.merchImageRef}
      onBack={d.backToList}
      onExpandImage={() => d.setExpandedMerchImage(true)}
      onDownloadImage={d.downloadMerchImage}
      expandedMerchImage={d.expandedMerchImage}
      setExpandedMerchImage={d.setExpandedMerchImage}
      showRejectModal={d.showRejectModal}
      setShowRejectModal={d.setShowRejectModal}
      rejectionReason={d.rejectionReason}
      setRejectionReason={d.setRejectionReason}
      rejecting={d.rejecting}
      onConfirmReject={d.confirmReject}
      showApproveModal={d.showApproveModal}
      setShowApproveModal={d.setShowApproveModal}
      approvalInfo={d.approvalInfo}
      setApprovalInfo={d.setApprovalInfo}
      approving={d.approving}
      onConfirmApprove={d.confirmApprove}
    />
  );
}
