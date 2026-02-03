"use client";

import { Button, LoadingSpinner, EmptyState } from "@/components/admin/ui";
import type { CustomMerch } from "@/types/admin.types";
import AssetCard from "./AssetCard";
import UploadAssetForm from "./UploadAssetForm";
import type { UploadFormState } from "../types";

interface CustomAssetTabProps {
  showUploadForm: boolean;
  loading: boolean;
  customMerch: CustomMerch[];
  categoryLabels: Record<string, string>;
  assetEnabled: Record<string, boolean>;
  uploadForm: UploadFormState;
  uploadImagePreview: string | null;
  uploadSubmitting: boolean;
  onOpenUploadForm: () => void;
  onCloseUploadForm: () => void;
  onViewMerch: (merch: CustomMerch) => void;
  onToggleEnabled: (id: string) => void;
  onDeleteAsset: (merch: CustomMerch) => void;
  setUploadForm: React.Dispatch<React.SetStateAction<UploadFormState>>;
  onUploadImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadImageDrop: (e: React.DragEvent) => void;
  onUploadImageDragOver: (e: React.DragEvent) => void;
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
  onCreateAsset: () => void;
}

export default function CustomAssetTab({
  showUploadForm,
  loading,
  customMerch,
  categoryLabels,
  assetEnabled,
  uploadForm,
  uploadImagePreview,
  uploadSubmitting,
  onOpenUploadForm,
  onCloseUploadForm,
  onViewMerch,
  onToggleEnabled,
  onDeleteAsset,
  setUploadForm,
  onUploadImageChange,
  onUploadImageDrop,
  onUploadImageDragOver,
  onAddTag,
  onRemoveTag,
  onCreateAsset,
}: CustomAssetTabProps) {
  return (
    <div className="overflow-hidden">
      {showUploadForm ? (
        <UploadAssetForm
          form={uploadForm}
          setForm={setUploadForm}
          imagePreview={uploadImagePreview}
          submitting={uploadSubmitting}
          onBack={onCloseUploadForm}
          onImageChange={onUploadImageChange}
          onImageDrop={onUploadImageDrop}
          onImageDragOver={onUploadImageDragOver}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onSubmit={onCreateAsset}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-primary">
                Asset management
              </h2>
              <p className="text-sm text-admin-primary/70 mt-0.5">
                Manage images available for BYOM customization
              </p>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={onOpenUploadForm}
            >
              Upload New Assets
            </Button>
          </div>

          <div className="py-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : customMerch.length === 0 ? (
              <EmptyState
                title="No assets yet"
                description="Upload images to make them available for BYOM customization"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {customMerch.map((merch) => (
                  <AssetCard
                    key={merch.id}
                    merch={merch}
                    categoryLabel={
                      categoryLabels[merch.id] ?? merch.productType
                    }
                    enabled={
                      assetEnabled[merch.id] ?? merch.status === "approved"
                    }
                    onView={onViewMerch}
                    onToggleEnabled={onToggleEnabled}
                    onDelete={onDeleteAsset}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
