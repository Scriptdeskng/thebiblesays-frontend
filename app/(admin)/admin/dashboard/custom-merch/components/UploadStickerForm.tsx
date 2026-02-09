/* eslint-disable @next/next/no-img-element */
"use client";

import { Upload, X, ChevronLeft } from "lucide-react";
import { Button, LoadingSpinner, Input } from "@/components/admin/ui";
import type { StickerFormState } from "../hooks/useUploadStickerForm";

interface UploadStickerFormProps {
  form: StickerFormState;
  setForm: React.Dispatch<React.SetStateAction<StickerFormState>>;
  imagePreview: string;
  submitting: boolean;
  onBack: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (e: React.DragEvent) => void;
  onImageDragOver: (e: React.DragEvent) => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
}

export default function UploadStickerForm({
  form,
  setForm,
  imagePreview,
  submitting,
  onBack,
  onImageChange,
  onImageDrop,
  onImageDragOver,
  onRemoveImage,
  onSubmit,
}: UploadStickerFormProps) {
  const hasImage = !!imagePreview;

  return (
    <div className="py-4 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-admin-primary hover:text-admin-primary/80 transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-admin-primary">
          Add sticker graphic
        </h2>
      </div>
      <div className="space-y-6 w-full">
        <div
          className="border-2 border-dashed border-admin-primary/25 rounded-xl p-8 text-center bg-admin-primary/5 cursor-pointer hover:border-admin-primary/40 hover:bg-admin-primary/10 transition-colors"
          onDrop={onImageDrop}
          onDragOver={onImageDragOver}
          onClick={() =>
            document.getElementById("sticker-image-input")?.click()
          }
        >
          <input
            id="sticker-image-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            className="hidden"
            onChange={onImageChange}
          />
          {hasImage ? (
            <div className="relative inline-block group">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain border border-admin-primary/20"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage();
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-admin-primary/50" size={40} />
              <p className="text-admin-primary font-medium mt-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-admin-primary/60 mt-1">
                PNG, JPG, SVG up to 10MB
              </p>
            </>
          )}
        </div>

        <Input
          label="Graphic name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g. Faith logo"
          required
        />

        <div className="flex items-center gap-2">
          <input
            id="sticker-is-active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="w-4 h-4 rounded border-accent-2 text-admin-primary focus:ring-admin-primary/20"
          />
          <label
            htmlFor="sticker-is-active"
            className="text-sm font-medium text-admin-primary"
          >
            Active (visible for BYOM customization)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onBack} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            {submitting && <LoadingSpinner size="sm" />}
            {submitting ? "Creating..." : "Create sticker"}
          </Button>
        </div>
      </div>
    </div>
  );
}
