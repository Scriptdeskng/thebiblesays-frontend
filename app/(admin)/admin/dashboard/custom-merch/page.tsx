"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import type { PageTab } from "./types";

const VALID_TABS: PageTab[] = [
  "custom-asset",
  "custom-sticker",
  "pricing",
  "orders",
];

function isValidTab(tab: string | null): tab is PageTab {
  return tab != null && VALID_TABS.includes(tab as PageTab);
}

import {
  CustomMerchPageHeader,
  CustomMerchTabBar,
  MerchDetailGate,
  MerchOrderDetailView,
  CustomMerchTabContent,
} from "./components";
import {
  useCustomMerchAssets,
  useCustomMerchStickers,
  usePricingConfig,
  useByomOrders,
  useUploadAssetForm,
  useUploadStickerForm,
  useMerchDetail,
} from "./hooks";

export type { ByomProductApi } from "./types";

export default function CustomMerchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabFromUrl = searchParams.get("tab");
  const [pageTab, setPageTabState] = useState<PageTab>(() =>
    isValidTab(tabFromUrl) ? tabFromUrl : "custom-asset"
  );

  const setPageTab = useCallback(
    (tab: PageTab) => {
      setPageTabState(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (isValidTab(t)) setPageTabState(t);
  }, [searchParams]);

  const assets = useCustomMerchAssets();
  const stickers = useCustomMerchStickers();
  const pricing = usePricingConfig();
  const orders = useByomOrders();
  const merchDetail = useMerchDetail(assets.loadData);
  const uploadForm = useUploadAssetForm(assets.loadData);
  const stickerUploadForm = useUploadStickerForm(stickers.loadData);

  useEffect(() => {
    if (pageTab === "pricing" || pageTab === "orders") pricing.loadPricing();
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

  const orderDetailView =
    pageTab === "orders" && orders.selectedOrder ? (
      <div>
        <CustomMerchPageHeader />
        <div className="w-full bg-[#1A1A1A0A] rounded-[10px] p-5">
          <CustomMerchTabBar pageTab={pageTab} onTabChange={setPageTab} />
          <MerchOrderDetailView
            order={orders.selectedOrder}
            pricing={pricing.pricing}
            onBack={orders.backToOrders}
          />
        </div>
      </div>
    ) : null;

  if (orderDetailView) return orderDetailView;

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
          showDeleteModal={assets.showDeleteModal}
          setShowDeleteModal={assets.setShowDeleteModal}
          merchToDelete={assets.merchToDelete}
          confirmDelete={assets.confirmDelete}
          deleting={assets.deleting}
          showToggleModal={assets.showToggleModal}
          setShowToggleModal={assets.setShowToggleModal}
          merchToToggle={assets.merchToToggle}
          pendingEnabled={assets.pendingEnabled}
          confirmToggle={assets.confirmToggle}
          toggling={assets.toggling}
          showUploadForm={uploadForm.showForm}
          uploadForm={uploadForm.form}
          uploadImagePreviews={uploadForm.imagePreviews}
          uploadSubmitting={uploadForm.submitting}
          onOpenUploadForm={uploadForm.openForm}
          onCloseUploadForm={uploadForm.closeForm}
          setUploadForm={uploadForm.setForm}
          onUploadImageChange={uploadForm.handleImageChange}
          onUploadImageDrop={uploadForm.handleImageDrop}
          onUploadImageDragOver={uploadForm.handleImageDragOver}
          onRemoveUploadImage={uploadForm.removeImage}
          onAddTag={uploadForm.addTag}
          onRemoveTag={uploadForm.removeTag}
          onCreateAsset={uploadForm.createAsset}
          stickersLoading={stickers.loading}
          stickers={stickers.stickers}
          stickerForm={stickerUploadForm.form}
          setStickerForm={stickerUploadForm.setForm}
          stickerImagePreview={stickerUploadForm.imagePreview}
          stickerSubmitting={stickerUploadForm.submitting}
          showStickerUploadForm={stickerUploadForm.showForm}
          onOpenStickerUploadForm={stickerUploadForm.openForm}
          onCloseStickerUploadForm={stickerUploadForm.closeForm}
          onStickerImageChange={stickerUploadForm.handleImageChange}
          onStickerImageDrop={stickerUploadForm.handleImageDrop}
          onStickerImageDragOver={stickerUploadForm.handleImageDragOver}
          onRemoveStickerImage={stickerUploadForm.removeImage}
          onCreateSticker={stickerUploadForm.createSticker}
          onStickerToggleEnabled={stickers.toggleStickerEnabled}
          onStickerDelete={stickers.handleDeleteSticker}
          stickerShowDeleteModal={stickers.showDeleteModal}
          stickerSetShowDeleteModal={stickers.setShowDeleteModal}
          stickerToDelete={stickers.stickerToDelete}
          stickerConfirmDelete={stickers.confirmDelete}
          stickerDeleting={stickers.deleting}
          stickerShowToggleModal={stickers.showToggleModal}
          stickerSetShowToggleModal={stickers.setShowToggleModal}
          stickerToToggle={stickers.stickerToToggle}
          stickerPendingEnabled={stickers.pendingEnabled}
          stickerConfirmToggle={stickers.confirmToggle}
          stickerToggling={stickers.toggling}
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
          onOrderClick={(order) => orders.viewOrder(order.orderId)}
        />
      </div>
    </div>
  );
}
