"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboard.service";
import toast from "react-hot-toast";

export interface StickerFormState {
  name: string;
  is_active: boolean;
}

const initialForm: StickerFormState = {
  name: "",
  is_active: true,
};

export function useUploadStickerForm(onSuccess?: () => void) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StickerFormState>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const openForm = useCallback(() => {
    setShowForm(true);
    setForm(initialForm);
    setImageFile(null);
    setImagePreview("");
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setForm(initialForm);
    setImageFile(null);
    setImagePreview("");
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview("");
  }, []);

  const createSticker = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!imageFile) {
      toast.error("Image is required");
      return;
    }
    setSubmitting(true);
    try {
      await dashboardService.createSticker({
        name: form.name.trim(),
        image: imageFile,
        is_active: form.is_active,
      });
      toast.success("Sticker created");
      closeForm();
      onSuccess?.();
    } catch {
      toast.error("Failed to create sticker");
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
    removeImage,
    createSticker,
  };
}
