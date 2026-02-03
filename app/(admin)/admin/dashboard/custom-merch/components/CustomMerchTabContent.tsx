"use client";

import type {
  PageTab,
  PricingConfig,
  CustomMerchOrderRow,
  UploadFormState,
} from "../types";
import type { CustomMerch } from "@/types/admin.types";
import CustomAssetTab from "./CustomAssetTab";
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
  onToggleEnabled: (id: string) => void;
  onDeleteAsset: (merch: CustomMerch) => void;
  showUploadForm: boolean;
  uploadForm: UploadFormState;
  uploadImagePreview: string | null;
  uploadSubmitting: boolean;
  onOpenUploadForm: () => void;
  onCloseUploadForm: () => void;
  setUploadForm: React.Dispatch<React.SetStateAction<UploadFormState>>;
  onUploadImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadImageDrop: (e: React.DragEvent) => void;
  onUploadImageDragOver: (e: React.DragEvent) => void;
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
  onCreateAsset: () => void;
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
  uploadImagePreview,
  uploadSubmitting,
  onOpenUploadForm,
  onCloseUploadForm,
  setUploadForm,
  onUploadImageChange,
  onUploadImageDrop,
  onUploadImageDragOver,
  onAddTag,
  onRemoveTag,
  onCreateAsset,
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
        uploadImagePreview={uploadImagePreview}
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
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onCreateAsset={onCreateAsset}
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
