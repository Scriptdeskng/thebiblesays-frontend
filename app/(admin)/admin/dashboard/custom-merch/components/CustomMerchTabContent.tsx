"use client";

import type {
  PageTab,
  PricingConfig,
  CustomMerchOrderRow,
  UploadFormState,
  Sticker,
} from "../types";
import type { StickerFormState } from "../hooks/useUploadStickerForm";
import type { CustomMerch } from "@/types/admin.types";
import CustomAssetTab from "./CustomAssetTab";
import CustomStickerTab from "./CustomStickerTab";
import PricingConfigTab from "./PricingConfigTab";
import CustomMerchOrdersTab from "./CustomMerchOrdersTab";

interface CustomMerchTabContentProps {
  pageTab: PageTab;
  setPageTab: (tab: PageTab) => void;
  assetsLoading: boolean;
  customMerch: CustomMerch[];
  categoryLabels: Record<string, string>;
  assetEnabled: Record<string, boolean>;
  onViewMerch: (merch: CustomMerch) => void;
  onToggleEnabled: (merch: CustomMerch) => void;
  onDeleteAsset: (merch: CustomMerch) => void;
  showUploadForm: boolean;
  uploadForm: UploadFormState;
  uploadImagePreviews: string[];
  uploadSubmitting: boolean;
  onOpenUploadForm: () => void;
  onCloseUploadForm: () => void;
  setUploadForm: React.Dispatch<React.SetStateAction<UploadFormState>>;
  onUploadImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadImageDrop: (e: React.DragEvent) => void;
  onUploadImageDragOver: (e: React.DragEvent) => void;
  onRemoveUploadImage?: (index: number) => void;
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
  onCreateAsset: () => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  merchToDelete: CustomMerch | null;
  confirmDelete: () => void;
  deleting: boolean;
  showToggleModal: boolean;
  setShowToggleModal: (show: boolean) => void;
  merchToToggle: CustomMerch | null;
  pendingEnabled: boolean;
  confirmToggle: () => void;
  toggling: boolean;
  /** Stickers tab */
  stickersLoading: boolean;
  stickers: Sticker[];
  stickerForm: StickerFormState;
  setStickerForm: React.Dispatch<React.SetStateAction<StickerFormState>>;
  stickerImagePreview: string;
  stickerSubmitting: boolean;
  showStickerUploadForm: boolean;
  onOpenStickerUploadForm: () => void;
  onCloseStickerUploadForm: () => void;
  onStickerImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStickerImageDrop: (e: React.DragEvent) => void;
  onStickerImageDragOver: (e: React.DragEvent) => void;
  onRemoveStickerImage: () => void;
  onCreateSticker: () => void;
  onStickerToggleEnabled: (sticker: Sticker) => void;
  onStickerDelete: (sticker: Sticker) => void;
  stickerShowDeleteModal: boolean;
  stickerSetShowDeleteModal: (show: boolean) => void;
  stickerToDelete: Sticker | null;
  stickerConfirmDelete: () => void;
  stickerDeleting: boolean;
  stickerShowToggleModal: boolean;
  stickerSetShowToggleModal: (show: boolean) => void;
  stickerToToggle: Sticker | null;
  stickerPendingEnabled: boolean;
  stickerConfirmToggle: () => void;
  stickerToggling: boolean;
  /** Pricing tab */
  pricing: PricingConfig;
  setPricing: React.Dispatch<React.SetStateAction<PricingConfig>>;
  onSavePricing: () => Promise<void>;
  pricingSaving: boolean;
  pricingLoading: boolean;
  /** Orders tab */
  orders: CustomMerchOrderRow[];
  ordersLoading: boolean;
  currentPage: number;
  totalPages: number;
  ordersPerPage: number;
  onPageChange: (page: number) => void;
}

export default function CustomMerchTabContent({
  pageTab,
  setPageTab,
  assetsLoading: loading,
  customMerch,
  categoryLabels,
  assetEnabled,
  onViewMerch,
  onToggleEnabled,
  onDeleteAsset,
  showUploadForm,
  uploadForm,
  uploadImagePreviews,
  uploadSubmitting,
  onOpenUploadForm,
  onCloseUploadForm,
  setUploadForm,
  onUploadImageChange,
  onUploadImageDrop,
  onUploadImageDragOver,
  onRemoveUploadImage,
  onAddTag,
  onRemoveTag,
  onCreateAsset,
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
  stickersLoading,
  stickers,
  stickerForm,
  setStickerForm,
  stickerImagePreview,
  stickerSubmitting,
  showStickerUploadForm,
  onOpenStickerUploadForm,
  onCloseStickerUploadForm,
  onStickerImageChange,
  onStickerImageDrop,
  onStickerImageDragOver,
  onRemoveStickerImage,
  onCreateSticker,
  onStickerToggleEnabled,
  onStickerDelete,
  stickerShowDeleteModal,
  stickerSetShowDeleteModal,
  stickerToDelete,
  stickerConfirmDelete,
  stickerDeleting,
  stickerShowToggleModal,
  stickerSetShowToggleModal,
  stickerToToggle,
  stickerPendingEnabled,
  stickerConfirmToggle,
  stickerToggling,
  pricing,
  setPricing,
  onSavePricing,
  pricingSaving: saving,
  pricingLoading,
  orders,
  ordersLoading,
  currentPage,
  totalPages,
  ordersPerPage,
  onPageChange,
}: CustomMerchTabContentProps) {
  if (pageTab === "custom-asset") {
    return (
      <CustomAssetTab
        showUploadForm={showUploadForm}
        loading={loading}
        customMerch={customMerch}
        categoryLabels={categoryLabels}
        assetEnabled={assetEnabled}
        uploadForm={uploadForm}
        uploadImagePreviews={uploadImagePreviews}
        uploadSubmitting={uploadSubmitting}
        onOpenUploadForm={onOpenUploadForm}
        onCloseUploadForm={onCloseUploadForm}
        onViewMerch={onViewMerch}
        onToggleEnabled={onToggleEnabled}
        onDeleteAsset={onDeleteAsset}
        setUploadForm={setUploadForm}
        onUploadImageChange={onUploadImageChange}
        onUploadImageDrop={onUploadImageDrop}
        onUploadImageDragOver={onUploadImageDragOver}
        onRemoveUploadImage={onRemoveUploadImage}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onCreateAsset={onCreateAsset}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        merchToDelete={merchToDelete}
        confirmDelete={confirmDelete}
        deleting={deleting}
        showToggleModal={showToggleModal}
        setShowToggleModal={setShowToggleModal}
        merchToToggle={merchToToggle}
        pendingEnabled={pendingEnabled}
        confirmToggle={confirmToggle}
        toggling={toggling}
      />
    );
  }

  if (pageTab === "custom-sticker") {
    return (
      <CustomStickerTab
        showUploadForm={showStickerUploadForm}
        loading={stickersLoading}
        stickers={stickers}
        form={stickerForm}
        setForm={setStickerForm}
        imagePreview={stickerImagePreview}
        submitting={stickerSubmitting}
        onOpenUploadForm={onOpenStickerUploadForm}
        onCloseUploadForm={onCloseStickerUploadForm}
        onImageChange={onStickerImageChange}
        onImageDrop={onStickerImageDrop}
        onImageDragOver={onStickerImageDragOver}
        onRemoveImage={onRemoveStickerImage}
        onCreateSticker={onCreateSticker}
        onToggleEnabled={onStickerToggleEnabled}
        onDelete={onStickerDelete}
        showDeleteModal={stickerShowDeleteModal}
        setShowDeleteModal={stickerSetShowDeleteModal}
        stickerToDelete={stickerToDelete}
        confirmDelete={stickerConfirmDelete}
        deleting={stickerDeleting}
        showToggleModal={stickerShowToggleModal}
        setShowToggleModal={stickerSetShowToggleModal}
        stickerToToggle={stickerToToggle}
        pendingEnabled={stickerPendingEnabled}
        confirmToggle={stickerConfirmToggle}
        toggling={stickerToggling}
      />
    );
  }

  if (pageTab === "pricing") {
    return (
      <PricingConfigTab
        setPageTab={setPageTab}
        pricing={pricing}
        setPricing={setPricing}
        onSave={onSavePricing}
        saving={saving}
        loading={pricingLoading}
      />
    );
  }

  if (pageTab === "orders") {
    return (
      <CustomMerchOrdersTab
        orders={orders}
        loading={ordersLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        ordersPerPage={ordersPerPage}
        onPageChange={onPageChange}
      />
    );
  }

  return null;
}
