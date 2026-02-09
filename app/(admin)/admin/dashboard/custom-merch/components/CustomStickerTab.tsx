"use client";

import { Trash2 } from "lucide-react";
import { Button, LoadingSpinner, EmptyState, Modal } from "@/components/admin/ui";
import type { Sticker } from "../types";
import type { StickerFormState } from "../hooks/useUploadStickerForm";
import StickerCard from "./StickerCard";
import UploadStickerForm from "./UploadStickerForm";

interface CustomStickerTabProps {
  showUploadForm: boolean;
  loading: boolean;
  stickers: Sticker[];
  form: StickerFormState;
  setForm: React.Dispatch<React.SetStateAction<StickerFormState>>;
  imagePreview: string;
  submitting: boolean;
  onOpenUploadForm: () => void;
  onCloseUploadForm: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (e: React.DragEvent) => void;
  onImageDragOver: (e: React.DragEvent) => void;
  onRemoveImage: () => void;
  onCreateSticker: () => void;
  onToggleEnabled: (sticker: Sticker) => void;
  onDelete: (sticker: Sticker) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  stickerToDelete: Sticker | null;
  confirmDelete: () => void;
  deleting: boolean;
  showToggleModal: boolean;
  setShowToggleModal: (show: boolean) => void;
  stickerToToggle: Sticker | null;
  pendingEnabled: boolean;
  confirmToggle: () => void;
  toggling: boolean;
}

export default function CustomStickerTab({
  showUploadForm,
  loading,
  stickers,
  form,
  setForm,
  imagePreview,
  submitting,
  onOpenUploadForm,
  onCloseUploadForm,
  onImageChange,
  onImageDrop,
  onImageDragOver,
  onRemoveImage,
  onCreateSticker,
  onToggleEnabled,
  onDelete,
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
}: CustomStickerTabProps) {
  return (
    <div className="overflow-hidden">
      {showUploadForm ? (
        <UploadStickerForm
          form={form}
          setForm={setForm}
          imagePreview={imagePreview}
          submitting={submitting}
          onBack={onCloseUploadForm}
          onImageChange={onImageChange}
          onImageDrop={onImageDrop}
          onImageDragOver={onImageDragOver}
          onRemoveImage={onRemoveImage}
          onSubmit={onCreateSticker}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-primary">
                Asset Management
              </h2>
              <p className="text-sm text-admin-primary/70 mt-0.5">
                Manage graphics available for BYOM customization
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
            ) : stickers.length === 0 ? (
              <EmptyState
                title="No stickers yet"
                description="Upload graphics to make them available for BYOM customization"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stickers.map((sticker) => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    onToggleEnabled={onToggleEnabled}
                    onDelete={onDelete}
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
        title="Delete sticker"
        size="md"
      >
        <div className="py-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-admin-primary mb-2 text-center">
              Are you sure you want to delete this sticker?
            </h3>
            <p className="text-grey text-center">
              {stickerToDelete && (
                <>
                  This will permanently delete{" "}
                  <strong>{stickerToDelete.name}</strong>. This action cannot be
                  undone.
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
        title="Change sticker status"
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
              Are you sure you want to change the sticker status?
            </h3>
            <p className="text-grey text-center">
              {stickerToToggle && (
                <>
                  <strong>{stickerToToggle.name}</strong> will be{" "}
                  <strong>{pendingEnabled ? "enabled" : "disabled"}</strong>.
                  This will affect its visibility for BYOM customization.
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
