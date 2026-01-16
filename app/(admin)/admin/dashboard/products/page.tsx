/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  // Plus,
  Search,
  // Edit,
  // Eye,
  Trash2,
  // EyeOff,
  // Filter,
  // ChevronDown,
  // Tag,
  X,
} from "lucide-react";
import {
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  Badge,
  LoadingSpinner,
  EmptyState,
} from "@/components/admin/ui";
import {
  Product,
  ProductCategory,
  ProductColor,
  ProductSize,
  ProductStatus,
} from "@/types/admin.types";
import type {
  ApiProduct,
  ApiCategory,
  // ApiProductDetail,
} from "@/types/admin.types";
import { AVAILABLE_COLORS } from "@/services/mock.service";
import { dashboardService } from "@/services/dashboard.service";
import {
  formatCurrency,
  //  getStatusColor
} from "@/lib/utils";
import CategoryDropdown from "@/components/admin/products/CategoryDropdown";
// import {
//   PiEyeLight,
//   PiEyeSlash,
//   PiPencilSimpleLineLight,
// } from "react-icons/pi";
import { LuUpload } from "react-icons/lu";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useCommon";

const sizes: ProductSize[] = ["S", "M", "L", "XL", "XXL"];
const additionalSizes: ProductSize[] = ["XS", "3XL", "4XL", "5XL"];
const additionalColors: ProductColor[] = [
  { name: "Orange", hex: "#FF851B" },
  { name: "Purple", hex: "#B10DC9" },
  { name: "Pink", hex: "#F012BE" },
  { name: "Teal", hex: "#39CCCC" },
  { name: "Maroon", hex: "#85144B" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Olive", hex: "#808000" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Indigo", hex: "#4B0082" },
];
// const predefinedTags = ["Faith", "Hoodie", "Christian"];

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [categoryFilter, setCategoryFilter] = useState<string>("All category");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProductName, setCreatedProductName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(
    null
  );

  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    category: "" as ProductCategory,
    price: "",
    stock: "",
    description: "",
    sizes: [] as ProductSize[],
    colors: [] as ProductColor[],
    images: [] as string[], // Base64 data URLs or image URLs
    imageFiles: [] as File[], // Store actual file objects for filenames
    imageIds: [] as (number | null)[], // Track image IDs for existing images (null for new images)
    status: "Active" as ProductStatus,
    tags: [] as string[],
  });
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    loadCategories();
    loadProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      loadProducts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, categoryFilter]);

  const loadCategories = async () => {
    try {
      const categoriesData = await dashboardService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadProducts = async (isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setTableLoading(true);
    }
    try {
      const params: any = {};

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      if (categoryFilter !== "All category") {
        // Find category ID by name
        const selectedCategory = categories.find(
          (cat) => cat.name === categoryFilter
        );
        if (selectedCategory) {
          params.category = selectedCategory.id;
        }
      }

      const products = await dashboardService.getProducts(params);
      setAllProducts(products);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setTableLoading(false);
      }
    }
  };

  // Client-side filtering and pagination
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      categoryFilter === "All category" ||
      product.category_name.toLowerCase() === categoryFilter.toLowerCase();
    return matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const products = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleOpenForm = async (product?: Product | ApiProduct) => {
    if (product) {
      // Check if it's an ApiProduct (has category_name instead of category)
      if ("category_name" in product) {
        const apiProduct = product as ApiProduct;
        setProductDetailLoading(true);
        setShowForm(true); // Show form immediately with loading state
        try {
          // Fetch full product details
          const productDetail = await dashboardService.getProductById(
            apiProduct.id
          );

          // Map the full product detail to form data
          const productImages = productDetail.images.map((img) => img.image);
          const productImageIds = productDetail.images.map((img) => img.id);

          // Parse sizes and colors from the product detail
          // Note: The API returns color and size as strings, but the form expects arrays
          const productSizes: ProductSize[] = productDetail.size
            ? [productDetail.size as ProductSize]
            : [];
          const productColors: ProductColor[] = productDetail.color
            ? [{ name: productDetail.color, hex: "#000000" }] // Default hex if color name provided
            : [];

          // Create a Product-like object from ApiProductDetail for editing
          const featuredImage = productDetail.images.find(
            (img) => img.is_featured
          );
          const productImage =
            featuredImage?.image || productDetail.images[0]?.image || "";

          const productForEdit: Product = {
            id: productDetail.id.toString(),
            name: productDetail.name,
            category: productDetail.category_name as ProductCategory,
            price: parseFloat(productDetail.price),
            stock: productDetail.stock_level || 0,
            description: productDetail.description,
            sizes: productSizes,
            colors: productColors,
            image: productImage,
            status: productDetail.is_active ? "Active" : "Inactive",
            tags: [], // Tags not available in API response
            sales: parseInt(productDetail.total_sold) || 0,
            revenue: parseFloat(productDetail.total_revenue) || 0,
            createdAt: productDetail.created_at || new Date().toISOString(),
          };

          setEditingProduct(productForEdit);
          setFormData({
            name: productDetail.name,
            category: productDetail.category_name as ProductCategory,
            price: productDetail.price,
            stock: productDetail.stock_level?.toString() || "0",
            description: productDetail.description,
            sizes: productSizes,
            colors: productColors,
            images: productImages,
            imageFiles: [], // No file objects when editing existing product
            imageIds: productImageIds, // Store image IDs for existing images
            status: productDetail.is_active ? "Active" : "Inactive",
            tags: [],
          });
          // Store original images to detect new ones when updating
          setOriginalImages(productImages);
        } catch (error) {
          console.error("Error fetching product details:", error);
          toast.error("Failed to load product details");
          setShowForm(false); // Hide form on error
          return;
        } finally {
          setProductDetailLoading(false);
        }
      } else {
        // It's a Product type
        const regularProduct = product as Product;
        setEditingProduct(regularProduct);
        setFormData({
          name: regularProduct.name,
          category: regularProduct.category,
          price: regularProduct.price.toString(),
          stock: regularProduct.stock.toString(),
          description: regularProduct.description,
          sizes: regularProduct.sizes,
          colors: regularProduct.colors,
          images: regularProduct.image ? [regularProduct.image] : [],
          imageFiles: [], // No file objects when editing existing product
          imageIds: [], // No IDs for Product type
          status: regularProduct.status,
          tags: regularProduct.tags || [],
        });
        // Store original images to detect new ones when updating
        setOriginalImages(regularProduct.image ? [regularProduct.image] : []);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "" as ProductCategory,
        price: "",
        stock: "",
        description: "",
        sizes: [],
        colors: [],
        images: [],
        imageFiles: [],
        imageIds: [],
        status: "Active",
        tags: [],
      });
    }
    setCustomTag("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setOriginalImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    try {
      // Find category ID from category name
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.category
      );
      if (!selectedCategory) {
        toast.error("Please select a valid category");
        return;
      }

      // Map form data to API schema
      // Note: API accepts single size/color, so we use the first selected one
      const apiProductData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        color: formData.colors.length > 0 ? formData.colors[0].name : undefined,
        size:
          formData.sizes.length > 0
            ? (formData.sizes[0] as "S" | "M" | "L" | "XL" | "XXL")
            : undefined,
        category: selectedCategory.id,
        stock_level: parseInt(formData.stock) || 0,
        is_active: formData.status === "Active",
        images:
          formData.imageFiles.length > 0 ? formData.imageFiles : undefined,
        // tag_ids will be handled separately if needed
      };

      if (editingProduct) {
        // Update existing product
        if (!editingProduct.id) {
          toast.error("Product ID is missing");
          setSubmitting(false);
          return;
        }
        const productIdToUpdate = parseInt(editingProduct.id);
        if (isNaN(productIdToUpdate)) {
          toast.error("Invalid product ID");
          setSubmitting(false);
          return;
        }
        await dashboardService.updateProduct(productIdToUpdate, apiProductData);

        // Check if there are new images to upload
        // New images are those in imageFiles (File objects) that weren't in originalImages
        if (formData.imageFiles.length > 0) {
          try {
            await dashboardService.addProductImages(
              productIdToUpdate,
              formData.imageFiles
            );
            toast.success(
              `Successfully added ${formData.imageFiles.length} new image(s)`
            );
          } catch (imageError: any) {
            console.error("Error adding images:", imageError);
            const imageErrorMessage =
              imageError?.response?.data?.message ||
              imageError?.response?.data?.error ||
              imageError?.message ||
              "Failed to upload new images";
            toast.error(imageErrorMessage);
            // Don't throw - product was updated successfully, just images failed
          }
        }

        toast.success("Product updated successfully");
      } else {
        // Create new product with images included in multipart form data
        await dashboardService.createProduct(apiProductData);
        // const productId = newProduct.id;
        const imagesCount = formData.imageFiles.length;
        toast.success(
          `Product created successfully${
            imagesCount > 0 ? ` with ${imagesCount} image(s)` : ""
          }`
        );
      }

      // Reload products and close form
      await loadProducts(false);
      handleCloseForm();

      if (!editingProduct) {
        setCreatedProductName(formData.name);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save product";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProduct) return;

    if (!editingProduct.id) {
      toast.error("Product ID is missing");
      setShowDeleteModal(false);
      return;
    }

    const productIdToDelete = parseInt(editingProduct.id);
    if (isNaN(productIdToDelete)) {
      toast.error("Invalid product ID");
      setShowDeleteModal(false);
      return;
    }

    setDeleting(true);
    try {
      await dashboardService.deleteProduct(productIdToDelete);
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      handleCloseForm();
      await loadProducts(false);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete product";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSize = (size: ProductSize) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.includes(size)
        ? formData.sizes.filter((s) => s !== size)
        : [...formData.sizes, size],
    });
  };

  const toggleColor = (color: (typeof AVAILABLE_COLORS)[0]) => {
    setFormData({
      ...formData,
      colors: formData.colors.find((c) => c.hex === color.hex)
        ? formData.colors.filter((c) => c.hex !== color.hex)
        : [...formData.colors, color],
    });
  };

  const addSizeFromSelect = (size: ProductSize) => {
    if (!formData.sizes.includes(size)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, size],
      });
    }
  };

  const addColorFromSelect = (color: ProductColor) => {
    if (!formData.colors.find((c) => c.hex === color.hex)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, color],
      });
    }
  };

  // const toggleTag = (tag: string) => {
  //   setFormData({
  //     ...formData,
  //     tags: formData.tags.includes(tag)
  //       ? formData.tags.filter((t) => t !== tag)
  //       : [...formData.tags, tag],
  //   });
  // };

  // const addCustomTag = () => {
  //   if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
  //     setFormData({
  //       ...formData,
  //       tags: [...formData.tags, customTag.trim()],
  //     });
  //     setCustomTag("");
  //   }
  // };

  // const removeTag = (tagToRemove: string) => {
  //   setFormData({
  //     ...formData,
  //     tags: formData.tags.filter((t) => t !== tagToRemove),
  //   });
  // };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const readers = fileArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((results) => {
        setFormData({
          ...formData,
          images: [...formData.images, ...results],
          imageFiles: [...formData.imageFiles, ...fileArray],
          // New images don't have IDs yet (null)
          imageIds: [
            ...formData.imageIds,
            ...Array(fileArray.length).fill(null),
          ],
        });
      });
    }
    // Reset input to allow selecting the same files again
    e.target.value = "";
  };

  const removeImage = async (indexToRemove: number) => {
    const imageId = formData.imageIds[indexToRemove];

    setDeletingImageIndex(indexToRemove);

    // If it's an existing image (has an ID), delete it from the server
    if (imageId !== null && imageId !== undefined && editingProduct?.id) {
      try {
        const productId = parseInt(editingProduct.id);
        if (!isNaN(productId)) {
          await dashboardService.deleteProductImage(productId, imageId);
          toast.success("Image deleted successfully");
        }
      } catch (error: any) {
        console.error("Error deleting image:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete image";
        toast.error(errorMessage);
        setDeletingImageIndex(null);
        return; // Don't remove from UI if deletion failed
      }
    }

    // Remove from local state
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove),
      imageFiles: formData.imageFiles.filter(
        (_, index) => index !== indexToRemove
      ),
      imageIds: formData.imageIds.filter(
        (_, index) => index !== indexToRemove
      ),
    });

    setDeletingImageIndex(null);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-medium text-admin-primary lg:text-2xl">
            Product Management
          </h1>
          <p className="text-sm text-admin-primary">
            Manage your product inventory and listings
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => handleOpenForm()}>Create New Product</Button>
        )}
      </div>

      {showForm ? (
        <div className="bg-admin-primary/4 rounded-xl p-6 shadow-sm">
          {productDetailLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-medium text-admin-primary mb-6">
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white p-3 sm:p-6"
              >
                <Input
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Enter product name"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    options={[
                      { value: "", label: "Select a category", disabled: true },
                      ...categories.map((cat) => ({
                        value: cat.name,
                        label: cat.name,
                      })),
                    ]}
                    required
                  />

                  <Input
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid non-negative numbers
                      if (
                        value === "" ||
                        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                      ) {
                        setFormData({ ...formData, price: value });
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent negative sign, 'e', 'E', '+', '.' (handled by step)
                      if (
                        e.key === "-" ||
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    required
                    placeholder="0.00"
                  />
                </div>

                <Input
                  label="Stock Level"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or valid non-negative integers
                    if (
                      value === "" ||
                      (!isNaN(parseInt(value)) && parseInt(value) >= 0)
                    ) {
                      setFormData({ ...formData, stock: value });
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent negative sign, 'e', 'E', '+', '.'
                    if (
                      e.key === "-" ||
                      e.key === "e" ||
                      e.key === "E" ||
                      e.key === "+" ||
                      e.key === "."
                    ) {
                      e.preventDefault();
                    }
                  }}
                  required
                  placeholder="0"
                />

                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Product description"
                  rows={3}
                />

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                  <div>
                    <label className="block text-admin-primary mb-1">
                      Available Sizes
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-4 py-2 rounded-md border transition-all ${
                            formData.sizes.includes(size)
                              ? "border-[#A1CBFF] text-[#3291FF] bg-secondary"
                              : "border-admin-primary/35 text-admin-primary"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-admin-primary mb-1">
                      Available Colors
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {AVAILABLE_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-all ${
                            formData.colors.find((c) => c.hex === color.hex)
                              ? "border-[#A1CBFF] bg-secondary"
                              : "border-admin-primary/35 text-admin-primary"
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full border border-accent-2"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm ">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12">
                  <div className="flex flex-col w-full">
                    <div>
                      <label className="block text-admin-primary mb-1">
                        Add Additional Size
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addSizeFromSelect(e.target.value as ProductSize);
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                      >
                        <option value="">Add a size</option>
                        {additionalSizes
                          .filter((size) => !formData.sizes.includes(size))
                          .map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2 min-h-[42px] items-center">
                        {formData.sizes.filter((size) =>
                          additionalSizes.includes(size)
                        ).length > 0 &&
                          formData.sizes
                            .filter((size) => additionalSizes.includes(size))
                            .map((size) => (
                              <div
                                key={size}
                                className="flex items-center space-x-1 px-3 py-1 rounded-md bg-[#A1CBFF]/20 border border-[#A1CBFF]"
                              >
                                <span className="text-sm text-[#3291FF]">
                                  {size}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleSize(size)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-full">
                    <div>
                      <label className="block text-admin-primary mb-1">
                        Add Additional Color
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedColor = additionalColors.find(
                              (c) => c.hex === e.target.value
                            );
                            if (selectedColor) {
                              addColorFromSelect(selectedColor);
                            }
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                      >
                        <option value="">Add a color</option>
                        {additionalColors
                          .filter(
                            (color) =>
                              !formData.colors.find((c) => c.hex === color.hex)
                          )
                          .map((color) => (
                            <option key={color.hex} value={color.hex}>
                              {color.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-2 min-h-[42px] items-center">
                        {formData.colors.filter((color) =>
                          additionalColors.find((c) => c.hex === color.hex)
                        ).length > 0 &&
                          formData.colors
                            .filter((color) =>
                              additionalColors.find((c) => c.hex === color.hex)
                            )
                            .map((color) => (
                              <div
                                key={color.hex}
                                className="flex items-center space-x-2 px-3 py-1 rounded-md bg-[#A1CBFF]/20 border border-[#A1CBFF]"
                              >
                                <div
                                  className="w-2.5 h-2.5 rounded-full border border-accent-2"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-sm text-[#3291FF]">
                                  {color.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleColor(color)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-admin-primary mb-1">
                    Product Images
                  </label>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative flex items-center justify-center"
                        >
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-48 object-cover rounded-lg ${
                              deletingImageIndex === index
                                ? "opacity-50"
                                : ""
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={deletingImageIndex === index}
                            className="absolute top-2 right-2 p-2 bg-red-600/30 text-red-600 rounded-md hover:bg-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingImageIndex === index ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-2 border-dashed border-accent-2 rounded-lg p-8 text-center flex flex-col items-center justify-center">
                    <LuUpload size={30} className="text-admin-primary" />
                    <p className="text-admin-primary mt-3">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-admin-primary/69 mb-4">
                      PNG, JPG up to 10MB (Multiple images allowed)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      multiple
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-admin-primary text-white rounded-lg cursor-pointer hover:bg-opacity-90"
                    >
                      {formData.images.length > 0
                        ? "Add More Images"
                        : "Upload Images"}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-admin-primary mb-1">
                    Product Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Active"
                        checked={formData.status === "Active"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as ProductStatus,
                          })
                        }
                        className="mr-2 ring-admin-primary"
                      />
                      <span className="text-sm text-grey">Active</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="Inactive"
                        checked={formData.status === "Inactive"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as ProductStatus,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-grey">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-admin-primary mb-1">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {predefinedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-all ${
                              formData.tags.includes(tag)
                                ? "border-[#A1CBFF] bg-secondary text-[#3291FF]"
                                : "border-admin-primary/35 text-admin-primary"
                            }`}
                          >
                            <Tag size={14} />
                            <span className="text-sm">{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-admin-primary mb-1">
                        Add Tags
                      </label>
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomTag();
                          }
                        }}
                        placeholder="Enter tag name and press Enter"
                        className="w-full px-4 py-2 border border-admin-primary/35 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  {formData.tags.filter((tag) => !predefinedTags.includes(tag))
                    .length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm text-grey mb-2">
                        Custom tags added
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags
                          .filter((tag) => !predefinedTags.includes(tag))
                          .map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-[#A1CBFF]/20 border border-[#A1CBFF]"
                            >
                              <Tag size={14} className="text-[#3291FF]" />
                              <span className="text-sm text-[#3291FF]">
                                {tag}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div> */}

                <div className="flex justify-center space-x-5 pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseForm}
                    disabled={submitting || deleting}
                  >
                    Cancel
                  </Button>
                  {editingProduct && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={submitting || deleting}
                    >
                      Delete Product
                    </Button>
                  )}
                  <Button type="submit" disabled={submitting || deleting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        {editingProduct ? "Updating..." : "Creating..."}
                      </span>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-col md:items-center md:flex-row md:justify-between w-full gap-4">
              <h3 className="font-bold text-admin-primary">All products</h3>

              <div className="flex-1 flex flex-col md:flex-row gap-5 md:justify-end md:items-center">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search products by name"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
                  />
                </div>
                <CategoryDropdown
                  categories={categories.map((cat) => cat.name)}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />
              </div>
            </div>
          </div>

          <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
            {tableLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : products?.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Get started by creating your first product"
                action={
                  <Button onClick={() => handleOpenForm()} size="sm">
                    Create Product
                  </Button>
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent-1 shadow-md shadow-black">
                      <tr>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Images
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Product
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Category
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Amount
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Sold
                        </th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products?.map((product) => (
                        <tr
                          key={product.id}
                          onClick={() => handleOpenForm(product)}
                          className="border-b border-accent-2 transition-colors bg-white cursor-pointer hover:bg-accent-1"
                        >
                          <td className="px-6 py-4">
                            <span className="text-admin-primary">
                              {product.images_count}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-admin-primary capitalize">
                              {product.name}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-admin-primary capitalize">
                              {product.category_name}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-admin-primary">
                            {formatCurrency(parseFloat(product.price))}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-admin-primary">
                              {product.total_sold}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                product.is_active ? "success" : "default"
                              }
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-accent-2">
                    <p className="text-sm text-grey">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredProducts.length
                      )}{" "}
                      of {filteredProducts.length} results
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm transition-all ${
                              currentPage === page
                                ? "bg-admin-primary text-white"
                                : "bg-accent-1 text-grey hover:bg-accent-2"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
        size="md"
      >
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-admin-primary mb-2">
              Product uploaded successfully and is now available
            </h3>
            <p className="text-grey">
              {createdProductName} has been successfully created
            </p>
          </div>
          <Button onClick={() => setShowSuccessModal(false)} className="mt-4">
            Go to product table
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete Product"
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
              {editingProduct && (
                <>
                  This will permanently delete{" "}
                  <strong>{editingProduct.name}</strong>. This action cannot be
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
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Deleting...
                </span>
              ) : (
                "Delete Product"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
