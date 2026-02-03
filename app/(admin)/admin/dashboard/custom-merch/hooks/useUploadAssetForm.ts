"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import type { UploadFormState } from "../types";

const INITIAL_FORM: UploadFormState = {
  name: "",
  description: "",
  price: 10000,
  category: 0,
  subcategory: 0,
  tag_ids: [],
  color_ids: [],
  stock_level: 10,
  is_active: true,
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024;

export function useUploadAssetForm(onSuccess?: () => void) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UploadFormState>(INITIAL_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    if (!submitting) {
      setShowForm(false);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    }
  }, [submitting, imagePreview]);

  const setImage = useCallback((file: File | null) => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_SIZE) {
        toast.error("Image must be under 10MB");
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Use PNG or JPG");
        return;
      }
      setImage(file);
    },
    [setImage]
  );

  const handleImageDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (file.size > MAX_SIZE) {
        toast.error("Image must be under 10MB");
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Use PNG or JPG");
        return;
      }
      setImage(file);
    },
    [setImage]
  );

  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const addTag = useCallback((tagId: number) => {
    setForm((prev) =>
      prev.tag_ids.includes(tagId)
        ? prev
        : { ...prev, tag_ids: [...prev.tag_ids, tagId] }
    );
  }, []);

  const removeTag = useCallback((tagId: number) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.filter((id) => id !== tagId),
    }));
  }, []);

  const createAsset = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error("Enter asset name");
      return;
    }
    setSubmitting(true);
    try {
      await dashboardService.createByomProduct(
        {
          name: form.name.trim(),
          description: form.description.trim() || form.name.trim(),
          price: String(form.price),
          category: form.category,
          subcategory: form.subcategory,
          tag_ids: form.tag_ids.length ? form.tag_ids : undefined,
          color_ids: form.color_ids.length ? form.color_ids : undefined,
          stock_level: form.stock_level,
          is_active: form.is_active,
        },
        imageFile ?? undefined
      );
      toast.success("Asset created");
      closeForm();
      onSuccess?.();
    } catch {
      toast.error("Failed to create asset");
    } finally {
      setSubmitting(false);
    }
  }, [form, imageFile, closeForm, onSuccess]);

  return {
    showForm,
    form,
    setForm,
    imageFile,
    imagePreview,
    submitting,
    openForm,
    closeForm,
    handleImageChange,
    handleImageDrop,
    handleImageDragOver,
    addTag,
    removeTag,
    createAsset,
  };
}
