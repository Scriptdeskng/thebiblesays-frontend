import type {
  CustomMerch,
  CustomMerchStatus,
  ProductCategory,
} from "@/types/admin.types";
import type { ByomProductApi } from "../types";

export function normalizeStatus(status: string): CustomMerchStatus {
  const statusLower = status.toLowerCase();
  if (statusLower === "pending_approval" || statusLower === "pending")
    return "pending";
  if (statusLower === "approved") return "approved";
  if (statusLower === "rejected") return "rejected";
  if (statusLower === "draft") return "draft";
  return "pending";
}

export function inferProductCategory(productName: string): ProductCategory {
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("shirt") || nameLower.includes("tee")) return "Shirts";
  if (nameLower.includes("cap")) return "Caps";
  if (nameLower.includes("hoodie")) return "Hoodie";
  if (nameLower.includes("hat") || nameLower.includes("headband"))
    return "Hat";
  if (nameLower.includes("jacket")) return "Jackets";
  return "Shirts";
}

export function categoryNameToProductCategory(
  categoryName: string
): ProductCategory {
  const lower = (categoryName || "").toLowerCase().replace(/-/g, " ");
  if (lower.includes("hoodie")) return "Hoodie";
  if (lower.includes("cap")) return "Caps";
  if (
    lower.includes("shirt") ||
    lower.includes("tee") ||
    lower.includes("sweat")
  )
    return "Shirts";
  if (lower.includes("headband")) return "Headband";
  if (lower.includes("hat")) return "Hat";
  if (lower.includes("jacket")) return "Jackets";
  return "Shirts";
}

export function transformByomProductToCustomMerch(
  product: ByomProductApi
): CustomMerch {
  const categoryName = product.category_name ?? "";
  const category = categoryName
    ? categoryNameToProductCategory(categoryName)
    : inferProductCategory(product.name || product.slug || "");
  const image =
    product.featured_image ??
    (product as { image?: string }).image ??
    (product as { thumbnail_url?: string }).thumbnail_url ??
    "";
  return {
    id: String(product.id),
    designName: product.name,
    designId: String(product.id),
    creator: "—",
    creatorId: "",
    productType: category,
    image,
    amount: parseFloat(product.price) || 0,
    quantity: 1,
    status: product.is_active !== false ? "approved" : "rejected",
    dateCreated: product.created_at ?? "",
    stockStatus: product.stock_status,
    isInStock: product.is_in_stock,
    currency: product.currency,
  };
}

export function isByomProduct(item: unknown): item is ByomProductApi {
  const x = item as Record<string, unknown>;
  return (
    x != null &&
    typeof x.id === "number" &&
    typeof x.name === "string" &&
    (typeof x.price === "string" || typeof x.price === "number")
  );
}

export function transformApiDesignToCustomMerch(apiDesign: any): CustomMerch {
  let configuration: any = {};
  try {
    configuration = apiDesign.configuration_json
      ? typeof apiDesign.configuration_json === "string"
        ? JSON.parse(apiDesign.configuration_json)
        : apiDesign.configuration_json
      : {};
  } catch {
    configuration = {};
  }
  let creator = "Unknown";
  let creatorId = "";
  if (apiDesign.user) {
    if (typeof apiDesign.user === "object") {
      creatorId = apiDesign.user.id?.toString() || "";
      creator =
        `${apiDesign.user.first_name || ""} ${
          apiDesign.user.last_name || ""
        }`.trim() ||
        apiDesign.user.email ||
        apiDesign.user_email ||
        "Unknown";
    } else {
      creatorId = apiDesign.user.toString();
      creator = apiDesign.user_email || "User";
    }
  } else if (apiDesign.user_email) {
    creator = apiDesign.user_email;
    creatorId = apiDesign.user_id?.toString() || "";
  }
  let productType: ProductCategory = "Shirts";
  if (apiDesign.product) {
    if (typeof apiDesign.product === "object") {
      productType = inferProductCategory(
        apiDesign.product.name ||
          apiDesign.product.category_name ||
          apiDesign.product.type ||
          ""
      );
    } else {
      productType = inferProductCategory(
        apiDesign.product_name || apiDesign.product_type || ""
      );
    }
  } else if (apiDesign.product_type) {
    productType = inferProductCategory(apiDesign.product_type);
  }
  const uploadedImageUrl =
    apiDesign.uploaded_image_url ||
    apiDesign.uploaded_image ||
    apiDesign.image_url ||
    "";
  const baseImage =
    configuration?.baseImage ||
    apiDesign.image ||
    apiDesign.preview_image ||
    "";
  return {
    id: apiDesign.id.toString(),
    designName:
      apiDesign.name || apiDesign.design_name || `Design #${apiDesign.id}`,
    designId: apiDesign.id.toString(),
    creator,
    creatorId,
    productType,
    image: baseImage || uploadedImageUrl || "",
    customImage: configuration?.customImage || apiDesign.custom_image || "",
    customText:
      apiDesign.text ||
      apiDesign.custom_text ||
      configuration?.customText ||
      "",
    frontView:
      configuration?.frontView ||
      apiDesign.front_view ||
      (apiDesign.placement === "front" ? uploadedImageUrl : ""),
    backView:
      configuration?.backView ||
      apiDesign.back_view ||
      (apiDesign.placement === "back" ? uploadedImageUrl : ""),
    sideView:
      configuration?.sideView ||
      apiDesign.side_view ||
      (apiDesign.placement === "side" ? uploadedImageUrl : ""),
    amount:
      parseFloat(apiDesign.price) || parseFloat(apiDesign.amount) || 0,
    quantity: apiDesign.quantity || 1,
    status: normalizeStatus(apiDesign.status),
    dateCreated:
      apiDesign.created_at ||
      apiDesign.createdAt ||
      new Date().toISOString(),
  };
}
