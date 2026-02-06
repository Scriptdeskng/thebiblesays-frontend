/* eslint-disable @next/next/no-img-element */
"use client";

import { Download, ChevronLeft } from "lucide-react";
import { Button, Modal, Badge, LoadingSpinner } from "@/components/admin/ui";
import type { CustomMerch } from "@/types/admin.types";
import { formatDate } from "@/lib/utils";

export interface SideData {
  baseImage: string;
  texts: any[];
  stickers: any[];
  color: string;
  colorName: string;
  size: string;
}

interface MerchDetailViewProps {
  selectedMerch: CustomMerch;
  selectedSide: "front" | "back" | "side";
  setSelectedSide: (side: "front" | "back" | "side") => void;
  currentSideData: SideData;
  merchImageRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onExpandImage: () => void;
  onDownloadImage: () => void;
  expandedMerchImage: boolean;
  setExpandedMerchImage: (v: boolean) => void;
  showRejectModal: boolean;
  setShowRejectModal: (v: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (v: string) => void;
  rejecting: boolean;
  onConfirmReject: () => void;
  showApproveModal: boolean;
  setShowApproveModal: (v: boolean) => void;
  approvalInfo: string;
  setApprovalInfo: (v: string) => void;
  approving: boolean;
  onConfirmApprove: () => void;
}

const textStyle = (text: any) => ({
  left: `${text.x}%`,
  top: `${text.y}%`,
  transform: "translate(-50%, -50%)",
  color: text.color || "#000000",
  fontSize: `${text.fontSize || 16}px`,
  fontFamily: text.fontFamily || "Arial",
  fontWeight: text.bold ? "bold" : "normal",
  fontStyle: text.italic ? "italic" : "normal",
  textDecoration: text.underline
    ? "underline"
    : text.strikethrough
    ? "line-through"
    : "none",
  textAlign: text.alignment || "center",
  letterSpacing: text.letterSpacing ? `${text.letterSpacing}px` : "normal",
  lineHeight: text.lineHeight ? `${text.lineHeight}px` : "normal",
  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
  whiteSpace: "nowrap" as const,
  maxWidth: "80%",
});

function DesignCanvas({
  sideData,
  selectedSide,
  imageRef,
  onExpand,
}: {
  sideData: SideData;
  selectedSide: string;
  imageRef: React.RefObject<HTMLDivElement | null>;
  onExpand: () => void;
}) {
  return (
    <div
      ref={imageRef}
      className="w-full max-w-2xl mx-auto aspect-square bg-admin-primary/7 rounded-lg overflow-hidden relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onExpand}
    >
      {sideData.baseImage ? (
        <img
          src={sideData.baseImage}
          alt={`${selectedSide} view`}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-grey">
          No Image
        </div>
      )}
      {sideData.texts?.map((text: any, index: number) => (
        <div key={text.id || index} className="absolute" style={textStyle(text)}>
          {text.content}
        </div>
      ))}
      {sideData.stickers?.map((sticker: any, index: number) => {
        if (!sticker.url) return null;
        const size = (sticker.scale || 1) * 80;
        return (
          <img
            key={sticker.id || index}
            src={sticker.url}
            alt="Sticker"
            className="absolute"
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: "translate(-50%, -50%)",
              width: `${size}px`,
              height: `${size}px`,
              objectFit: "contain",
            }}
          />
        );
      })}
    </div>
  );
}

export default function MerchDetailView({
  selectedMerch,
  selectedSide,
  setSelectedSide,
  currentSideData,
  onBack,
  onExpandImage,
  onDownloadImage,
  merchImageRef,
  expandedMerchImage,
  setExpandedMerchImage,
  showRejectModal,
  setShowRejectModal,
  rejectionReason,
  setRejectionReason,
  rejecting,
  onConfirmReject,
  showApproveModal,
  setShowApproveModal,
  approvalInfo,
  setApprovalInfo,
  approving,
  onConfirmApprove,
}: MerchDetailViewProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-admin-primary hover:text-admin-primary/80 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-admin-primary">Merch Details</h2>
      </div>
      <div className="bg-white rounded-xl border border-accent-2 overflow-hidden">
        <div className="relative bg-admin-primary/5 p-6 pb-10">
          <div className="absolute top-4 right-4">
            <Badge
              variant={
                selectedMerch.status === "approved"
                  ? "success"
                  : selectedMerch.status === "rejected"
                  ? "danger"
                  : selectedMerch.status === "draft"
                  ? "info"
                  : "warning"
              }
            >
              {selectedMerch.status}
            </Badge>
          </div>
          <div className="flex justify-center gap-3 mb-8">
            {(["front", "back", "side"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                className={`px-8 py-1.5 rounded-md border capitalize transition-all ${
                  selectedSide === side
                    ? "border-admin-primary text-admin-primary bg-admin-primary/10"
                    : "text-admin-primary/50 border border-admin-primary/20"
                }`}
              >
                {side}
              </button>
            ))}
          </div>
          <DesignCanvas
            sideData={currentSideData}
            selectedSide={selectedSide}
            imageRef={merchImageRef}
            onExpand={onExpandImage}
          />
        </div>
        <div className="bg-admin-primary/5 p-6">
          <div className="bg-white border border-accent-2 rounded-xl p-6">
            <h3 className="font-semibold text-admin-primary mb-4">
              Merch Details
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <p className="text-grey">Design Name</p>
                <p className="text-admin-primary font-medium">
                  {selectedMerch.designName}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-grey">Merch Color</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-accent-2"
                    style={{ backgroundColor: currentSideData.color }}
                  />
                  <span className="text-admin-primary font-medium capitalize">
                    {currentSideData.colorName || "Black"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-grey">Merch Size</p>
                <p className="text-admin-primary font-medium">
                  {currentSideData.size || "M"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-grey">Merch Type</p>
                <p className="text-admin-primary font-medium">
                  {selectedMerch.productType}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-grey">Quantity</p>
                <p className="text-admin-primary font-medium">
                  {selectedMerch.quantity} units
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-grey">Date Created</p>
                <p className="text-admin-primary font-medium">
                  {formatDate(selectedMerch.dateCreated)}
                </p>
              </div>
              <h3 className="font-semibold text-admin-primary mt-6 mb-4">
                Design Details
              </h3>
              <div className="flex justify-between">
                <p className="text-grey">Creator</p>
                <p className="text-admin-primary font-medium">
                  {selectedMerch.creator}
                </p>
              </div>
            </div>
          </div>
          {selectedMerch.status === "pending" && (
            <div className="flex justify-center gap-5 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowRejectModal(true)}
              >
                Reject Design
              </Button>
              <Button
                type="button"
                onClick={() => setShowApproveModal(true)}
              >
                Approve Design
              </Button>
            </div>
          )}
        </div>
      </div>

      {expandedMerchImage && (
        <Modal
          isOpen={expandedMerchImage}
          onClose={() => setExpandedMerchImage(false)}
          title="Merch Design Preview"
          size="lg"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-2xl mx-auto aspect-square bg-admin-primary/7 rounded-lg overflow-hidden relative flex items-center justify-center">
              {currentSideData.baseImage ? (
                <img
                  src={currentSideData.baseImage}
                  alt={`${selectedSide} view`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-grey">
                  No Image
                </div>
              )}
              {currentSideData.texts?.map((text: any, index: number) => (
                <div
                  key={text.id || index}
                  className="absolute"
                  style={textStyle(text)}
                >
                  {text.content}
                </div>
              ))}
              {currentSideData.stickers?.map((sticker: any, index: number) => {
                if (!sticker.url) return null;
                const size = (sticker.scale || 1) * 80;
                return (
                  <img
                    key={sticker.id || index}
                    src={sticker.url}
                    alt="Sticker"
                    className="absolute"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: `${size}px`,
                      height: `${size}px`,
                      objectFit: "contain",
                    }}
                  />
                );
              })}
            </div>
            <Button onClick={onDownloadImage} className="flex items-center gap-2">
              <Download size={16} />
              Download Merch Design
            </Button>
          </div>
        </Modal>
      )}

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            if (!rejecting) {
              setShowRejectModal(false);
              setRejectionReason("");
            }
          }}
          title="Reject"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-primary mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-accent-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none"
                rows={4}
                placeholder="Enter reason for rejecting this design..."
                disabled={rejecting}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                disabled={rejecting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirmReject}
                disabled={rejecting}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                {rejecting && <LoadingSpinner size="sm" />}
                {rejecting ? "Rejecting..." : "Reject Design"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showApproveModal && (
        <Modal
          isOpen={showApproveModal}
          onClose={() => {
            if (!approving) {
              setShowApproveModal(false);
              setApprovalInfo("");
            }
          }}
          title="Approve"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-primary mb-2">
                Additional Information
              </label>
              <textarea
                value={approvalInfo}
                onChange={(e) => setApprovalInfo(e.target.value)}
                className="w-full px-4 py-3 border border-accent-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none"
                rows={4}
                placeholder="Enter any additional information (optional)..."
                disabled={approving}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovalInfo("");
                }}
                disabled={approving}
              >
                Cancel
              </Button>
              <Button onClick={onConfirmApprove} disabled={approving}>
                {approving && <LoadingSpinner size="sm" />}
                {approving ? "Approving..." : "Approve Design"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
