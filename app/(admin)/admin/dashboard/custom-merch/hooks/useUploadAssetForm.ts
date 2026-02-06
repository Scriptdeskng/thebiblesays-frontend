"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";
import type { UploadFormState } from "../types";

const INITIAL_FORM: UploadFormState = {
  name: "",
  description: "",
  price: 10000,
  size: "S",
  category: 0,
  subcategory: 0,
  tag_ids: [],
  color_ids: [],
  stock_level: 1,
  is_active: true,
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024;

export function useUploadAssetForm(onSuccess?: () => void) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UploadFormState>(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const revokePreviews = useCallback((urls: string[]) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const openForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setImagePreviews((prev) => {
      revokePreviews(prev);
      return [];
    });
    setImageFiles([]);
    setShowForm(true);
  }, [revokePreviews]);

  const closeForm = useCallback(() => {
    if (!submitting) {
      setShowForm(false);
      setImagePreviews((prev) => {
        revokePreviews(prev);
        return [];
      });
    }
  }, [submitting, revokePreviews]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        if (file.size > MAX_SIZE) {
          toast.error(`"${file.name}" must be under 10MB`);
          return;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`"${file.name}": Use PNG or JPG`);
          return;
        }
      }
      const newPreviews = fileArray.map((f) => URL.createObjectURL(f));
      setImageFiles((prev) => [...prev, ...fileArray]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      e.target.value = "";
    },
    []
  );

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" must be under 10MB`);
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}": Use PNG or JPG`);
        return;
      }
    }
    const newPreviews = fileArray.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...fileArray]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback((index: number) => {
    setImagePreviews((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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
          size: form.size,
          category: form.category,
          // subcategory: form.subcategory,
          tag_ids: form.tag_ids.length ? form.tag_ids : undefined,
          // color_ids: form.color_ids.length ? form.color_ids : undefined,
          stock_level: form.stock_level,
          is_active: form.is_active,
        },
        imageFiles.length > 0 ? imageFiles : undefined
      );
      toast.success(
        `Asset created${
          imageFiles.length > 0 ? ` with ${imageFiles.length} image(s)` : ""
        }`
      );
      closeForm();
      onSuccess?.();
    } catch {
      toast.error("Failed to create asset");
    } finally {
      setSubmitting(false);
    }
  }, [form, imageFiles, closeForm, onSuccess]);

  return {
    showForm,
    form,
    setForm,
    imageFiles,
    imagePreviews,
    submitting,
    openForm,
    closeForm,
    handleImageChange,
    handleImageDrop,
    handleImageDragOver,
    removeImage,
    addTag,
    removeTag,
    createAsset,
  };
}
