"use client";

import { Trash2 } from "lucide-react";
import { Button, LoadingSpinner, EmptyState, Modal } from "@/components/admin/ui";
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
  uploadImagePreviews: string[];
  uploadSubmitting: boolean;
  onOpenUploadForm: () => void;
  onCloseUploadForm: () => void;
  onViewMerch: (merch: CustomMerch) => void;
  onToggleEnabled: (merch: CustomMerch) => void;
  onDeleteAsset: (merch: CustomMerch) => void;
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
}

export default function CustomAssetTab({
  showUploadForm,
  loading,
  customMerch,
  categoryLabels,
  assetEnabled,
  uploadForm,
  uploadImagePreviews,
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
}: CustomAssetTabProps) {
  return (
    <div className="overflow-hidden">
      {showUploadForm ? (
        <UploadAssetForm
          form={uploadForm}
          setForm={setUploadForm}
          imagePreviews={uploadImagePreviews}
          submitting={uploadSubmitting}
          onBack={onCloseUploadForm}
          onImageChange={onUploadImageChange}
          onImageDrop={onUploadImageDrop}
          onImageDragOver={onUploadImageDragOver}
          onRemoveImage={onRemoveUploadImage}
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete custom product"
        size="md"
      >
        <div className="py-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-admin-primary mb-2 text-center">
              Are you sure you want to delete this product?
            </h3>
            <p className="text-grey text-center">
              {merchToDelete && (
                <>
                  This will permanently delete{" "}
                  <strong>{merchToDelete.designName}</strong>. This action cannot
                  be undone.
                </>
              )}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showToggleModal}
        onClose={() => !toggling && setShowToggleModal(false)}
        title="Change product status"
        size="md"
      >
        <div className="py-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-admin-primary mb-2 text-center">
              Are you sure you want to change the product status?
            </h3>
            <p className="text-grey text-center">
              {merchToToggle && (
                <>
                  <strong>{merchToToggle.designName}</strong> will be{" "}
                  <strong>{pendingEnabled ? "enabled" : "disabled"}</strong>.
                  This will affect its visibility and availability.
                </>
              )}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowToggleModal(false)}
              disabled={toggling}
            >
              Cancel
            </Button>
            <Button onClick={confirmToggle} disabled={toggling}>
              {toggling ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Updating...
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
