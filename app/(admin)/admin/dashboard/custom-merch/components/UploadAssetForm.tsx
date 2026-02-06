/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Upload, X, ChevronLeft } from "lucide-react";
import { Button, LoadingSpinner, Input, Textarea } from "@/components/admin/ui";
import { dashboardService } from "@/services/dashboard.service";
import type { ApiCategory } from "@/types/admin.types";
import type { UploadFormState } from "../types";
import { BYOM_SIZES } from "../constants";
import ValuePicker from "./ValuePicker";
import toast from "react-hot-toast";

interface UploadAssetFormProps {
  form: UploadFormState;
  setForm: React.Dispatch<React.SetStateAction<UploadFormState>>;
  imagePreviews: string[];
  submitting: boolean;
  onBack: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (e: React.DragEvent) => void;
  onImageDragOver: (e: React.DragEvent) => void;
  onRemoveImage?: (index: number) => void;
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
  onSubmit: () => void;
}

export default function UploadAssetForm({
  form,
  setForm,
  imagePreviews,
  submitting,
  onBack,
  onImageChange,
  onImageDrop,
  onImageDragOver,
  onRemoveImage,
  onAddTag,
  onRemoveTag,
  onSubmit,
}: UploadAssetFormProps) {
  void onAddTag;
  void onRemoveTag;
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  // const [colors, setColors] = useState<
  //   Array<{ id: number; name: string; hex_code?: string }>
  // >([]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await dashboardService.getCategories();
        setCategories(data);
      } catch {
        toast.error("Failed to load categories");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const hasImages = imagePreviews.length > 0;
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
          Create BYOM asset
        </h2>
      </div>
      <div className="space-y-6 w-full">
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
            multiple
          />
          {hasImages ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative inline-block group">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="max-h-32 rounded-lg object-contain border border-admin-primary/20"
                  />
                  {onRemoveImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImage(idx);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-sm text-admin-primary/70 w-full mt-2">
                Click or drop to add more images
              </p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-admin-primary/50" size={40} />
              <p className="text-admin-primary font-medium mt-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-admin-primary/60 mt-1">
                PNG, JPG up to 10MB (multiple images supported)
              </p>
            </>
          )}
        </div>

        <Input
          label="Asset name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g Gods grace collection"
          required
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Product description"
          rows={3}
        />

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
            disabled={categoriesLoading}
            className="w-full px-4 py-2.5 border border-accent-2 rounded-lg text-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20 disabled:opacity-60"
          >
            <option value={0}>Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <ValuePicker
          label="Price"
          value={form.price}
          onChange={(price) => setForm((prev) => ({ ...prev, price }))}
          step={1000}
        />

        <Input
          label="Stock level"
          type="number"
          min={0}
          value={form.stock_level}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              stock_level: Math.max(0, parseInt(e.target.value, 10) || 0),
            }))
          }
          placeholder="0"
        />

        <div>
          <label className="block text-sm font-medium text-admin-primary mb-1">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {BYOM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, size }))}
                className={`px-4 py-2 rounded-md border transition-all ${
                  form.size === size
                    ? "border-[#A1CBFF] text-[#3291FF] bg-secondary"
                    : "border-admin-primary/35 text-admin-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-admin-primary mb-1">
            Colors
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = form.color_ids.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      color_ids: isSelected
                        ? prev.color_ids.filter((id) => id !== color.id)
                        : [...prev.color_ids, color.id],
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                    isSelected
                      ? "border-[#A1CBFF] bg-secondary"
                      : "border-admin-primary/35 text-admin-primary"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-accent-2"
                    style={{
                      backgroundColor: color.hex_code || "#cccccc",
                    }}
                  />
                  <span className="text-sm">{color.name}</span>
                </button>
              );
            })}
          </div>
        </div> */}

        <div className="flex items-center gap-2">
          <input
            id="byom-is-active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="w-4 h-4 rounded border-accent-2 text-admin-primary focus:ring-admin-primary/20"
          />
          <label
            htmlFor="byom-is-active"
            className="text-sm font-medium text-admin-primary"
          >
            Active (visible to customers)
          </label>
        </div>

        {/* <div>
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
        </div> */}

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
