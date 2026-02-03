"use client";

import { useState, useEffect } from "react";

import type { PageTab } from "./types";
import {
  CustomMerchPageHeader,
  CustomMerchTabBar,
  MerchDetailGate,
  CustomMerchTabContent,
} from "./components";
import {
  useCustomMerchAssets,
  usePricingConfig,
  useByomOrders,
  useUploadAssetForm,
  useMerchDetail,
} from "./hooks";

export type { ByomProductApi } from "./types";

export default function CustomMerchPage() {
  const [pageTab, setPageTab] = useState<PageTab>("custom-asset");

  const assets = useCustomMerchAssets();
  const pricing = usePricingConfig();
  const orders = useByomOrders();
  const merchDetail = useMerchDetail(assets.loadData);
  const uploadForm = useUploadAssetForm(assets.loadData);

  useEffect(() => {
    if (pageTab === "pricing") pricing.loadPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageTab, pricing.loadPricing]);

  useEffect(() => {
    if (pageTab === "orders") orders.loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageTab, orders.loadOrders]);

  const detailView = (
    <MerchDetailGate
      showDetail={merchDetail.showDetail}
      loadingDetail={merchDetail.loadingDetail}
      selectedMerch={merchDetail.selectedMerch}
      selectedSide={merchDetail.selectedSide}
      setSelectedSide={merchDetail.setSelectedSide}
      currentSideData={merchDetail.currentSideData}
      merchImageRef={merchDetail.merchImageRef}
      backToList={merchDetail.backToList}
      setExpandedMerchImage={merchDetail.setExpandedMerchImage}
      downloadMerchImage={merchDetail.downloadMerchImage}
      expandedMerchImage={merchDetail.expandedMerchImage}
      showRejectModal={merchDetail.showRejectModal}
      setShowRejectModal={merchDetail.setShowRejectModal}
      rejectionReason={merchDetail.rejectionReason}
      setRejectionReason={merchDetail.setRejectionReason}
      rejecting={merchDetail.rejecting}
      confirmReject={merchDetail.confirmReject}
      showApproveModal={merchDetail.showApproveModal}
      setShowApproveModal={merchDetail.setShowApproveModal}
      approvalInfo={merchDetail.approvalInfo}
      setApprovalInfo={merchDetail.setApprovalInfo}
      approving={merchDetail.approving}
      confirmApprove={merchDetail.confirmApprove}
    />
  );

  if (merchDetail.showDetail) return detailView;

  return (
    <div>
      <CustomMerchPageHeader />
      <div className="w-full bg-[#1A1A1A0A] rounded-[10px] p-5">
        <CustomMerchTabBar pageTab={pageTab} onTabChange={setPageTab} />
        <CustomMerchTabContent
          pageTab={pageTab}
          setPageTab={setPageTab}
          assetsLoading={assets.loading}
          customMerch={assets.customMerch}
          categoryLabels={assets.categoryLabels}
          assetEnabled={assets.assetEnabled}
          onViewMerch={merchDetail.viewMerch}
          onToggleEnabled={assets.toggleAssetEnabled}
          onDeleteAsset={assets.handleDeleteAsset}
          showUploadForm={uploadForm.showForm}
          uploadForm={uploadForm.form}
          uploadImagePreview={uploadForm.imagePreview}
          uploadSubmitting={uploadForm.submitting}
          onOpenUploadForm={uploadForm.openForm}
          onCloseUploadForm={uploadForm.closeForm}
          setUploadForm={uploadForm.setForm}
          onUploadImageChange={uploadForm.handleImageChange}
          onUploadImageDrop={uploadForm.handleImageDrop}
          onUploadImageDragOver={uploadForm.handleImageDragOver}
          onAddTag={uploadForm.addTag}
          onRemoveTag={uploadForm.removeTag}
          onCreateAsset={uploadForm.createAsset}
          pricing={pricing.pricing}
          setPricing={pricing.setPricing}
          onSavePricing={pricing.savePricing}
          pricingSaving={pricing.saving}
          pricingLoading={pricing.loading}
          orders={orders.orders}
          ordersLoading={orders.loading}
          currentPage={orders.currentPage}
          totalPages={orders.totalPages}
          ordersPerPage={orders.ordersPerPage}
          onPageChange={orders.setCurrentPage}
        />
      </div>
    </div>
  );
}
