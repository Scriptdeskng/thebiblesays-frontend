/* eslint-disable @next/next/no-img-element */
"use client";

import { Plus, Minus, Upload, X, ChevronLeft } from "lucide-react";
import { Button, LoadingSpinner } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/utils";
import type { UploadFormState } from "../types";
import { BYOM_CATEGORIES, BYOM_TAG_OPTIONS } from "../constants";

interface UploadAssetFormProps {
  form: UploadFormState;
  setForm: React.Dispatch<React.SetStateAction<UploadFormState>>;
  imagePreview: string | null;
  submitting: boolean;
  onBack: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (e: React.DragEvent) => void;
  onImageDragOver: (e: React.DragEvent) => void;
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
  onSubmit: () => void;
}

export default function UploadAssetForm({
  form,
  setForm,
  imagePreview,
  submitting,
  onBack,
  onImageChange,
  onImageDrop,
  onImageDragOver,
  onAddTag,
  onRemoveTag,
  onSubmit,
}: UploadAssetFormProps) {
  return (
    <div className="py-4">
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
          Upload new asset
        </h2>
      </div>
      <div className="space-y-6 max-w-2xl">
        <div
          className="border-2 border-dashed border-admin-primary/25 rounded-xl p-8 text-center bg-admin-primary/5 cursor-pointer hover:border-admin-primary/40 hover:bg-admin-primary/10 transition-colors"
          onDrop={onImageDrop}
          onDragOver={onImageDragOver}
          onClick={() =>
            document.getElementById("byom-asset-image-input")?.click()
          }
        >
          <input
            id="byom-asset-image-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={onImageChange}
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain"
              />
              <p className="text-sm text-admin-primary/70 mt-2">
                Click or drop to replace
              </p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-admin-primary/50" size={40} />
              <p className="text-admin-primary font-medium mt-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-admin-primary/60 mt-1">
                PNG, JPG up to 10MB
              </p>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-primary mb-1">
            Asset name
          </label>
          <input
            type="text"
            placeholder="e.g Gods grace collection"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-4 py-2.5 border border-accent-2 rounded-lg text-admin-primary placeholder:text-admin-primary/50 focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-primary mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                category: parseInt(e.target.value, 10),
              }))
            }
            className="w-full px-4 py-2.5 border border-accent-2 rounded-lg text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          >
            {BYOM_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-primary mb-1">
            Price
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  price: Math.max(0, prev.price - 1000),
                }))
              }
              className="w-10 h-10 rounded-lg border border-accent-2 flex items-center justify-center text-admin-primary hover:bg-admin-primary/5"
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  price: Math.max(0, parseInt(e.target.value, 10) || 0),
                }))
              }
              className="w-40 px-4 py-2.5 border border-accent-2 rounded-lg text-admin-primary"
            />
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, price: prev.price + 1000 }))
              }
              className="w-10 h-10 rounded-lg border border-accent-2 flex items-center justify-center text-admin-primary hover:bg-admin-primary/5"
            >
              <Plus size={18} />
            </button>
            <span className="text-admin-primary/70">
              {formatCurrency(form.price)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-primary mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {form.tag_ids.map((tagId) => {
              const tag = BYOM_TAG_OPTIONS.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-admin-primary/10 text-admin-primary text-sm"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tagId)}
                    className="p-0.5 rounded hover:bg-admin-primary/20"
                    aria-label={`Remove ${tag.name}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })}
            {BYOM_TAG_OPTIONS.filter((t) => !form.tag_ids.includes(t.id)).map(
              (t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onAddTag(t.id)}
                  className="px-3 py-1.5 rounded-full border border-accent-2 text-admin-primary text-sm hover:bg-admin-primary/5"
                >
                  + {t.name}
                </button>
              )
            )}
          </div>
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
            {submitting ? "Creating..." : "Create asset"}
          </Button>
        </div>
      </div>
    </div>
  );
}
