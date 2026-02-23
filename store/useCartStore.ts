import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Size, Category } from "@/types/product.types";
import { cartService } from "@/services/cart.service";

interface CartState {
  items: CartItem[];
  serverCartId: number | null;
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (
    productId: string,
    color: string,
    size: string,
    token?: string,
  ) => Promise<void>;
  updateQuantity: (
    productId: string,
    color: string,
    size: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  syncWithServer: (token: string) => Promise<void>;
  setServerCartId: (id: number | null) => void;
  getTotal: () => number;
  getItemCount: () => number;
  refreshCart: (token: string) => Promise<void>;
}

const inferCategory = (productName: string): Category => {
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("shirt") || nameLower.includes("tee")) return "Shirts";
  if (nameLower.includes("cap")) return "Caps";
  if (nameLower.includes("hoodie")) return "Hoodie";
  if (nameLower.includes("headband")) return "Headband";
  if (nameLower.includes("hat")) return "Hat";
  if (nameLower.includes("jacket")) return "Jackets";
  return "Shirts";
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      serverCartId: null,
      isLoading: false,

      addItem: (newItem) =>
        set((state) => {
          const isCustom = newItem.customization !== undefined;

          if (isCustom) {
            return { items: [...state.items, newItem] };
          }

          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.color === newItem.color &&
              item.size === newItem.size &&
              !item.customization,
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        }),

      removeItem: async (productId, color, size, token) => {
        const state = get();

        const isCustomItem = productId.startsWith("custom-cart-item-");

        const itemToRemove = isCustomItem
          ? state.items.find((item) => item.productId === productId)
          : state.items.find(
              (item) =>
                item.productId === productId &&
                item.color === color &&
                item.size === size,
            );

        if (itemToRemove && token && isCustomItem) {
          const serverItemId = parseInt(
            productId.replace("custom-cart-item-", ""),
          );
          if (!isNaN(serverItemId)) {
            try {
              await cartService.removeFromCart(token, serverItemId, "");
            } catch (error: any) {
              console.error("Failed to remove custom item from server:", error);
              throw new Error(
                "Failed to delete item from cart. Please try again.",
              );
            }
          }
        }

        set((state) => ({
          items: isCustomItem
            ? state.items.filter((item) => item.productId !== productId)
            : state.items.filter(
                (item) =>
                  !(
                    item.productId === productId &&
                    item.color === color &&
                    item.size === size
                  ),
              ),
        }));
      },

      updateQuantity: (productId, color, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId &&
            item.color === color &&
            item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),

      clearCart: () => {
        set({ items: [], serverCartId: null });
      },

      syncWithServer: async (token: string) => {
        set({ isLoading: true });

        try {
          const currentCartId = get().serverCartId;

          if (!currentCartId) {
            set({ isLoading: false });
            return;
          }

          const currencyParam = "";
          const serverCart = await cartService.getCart(
            token,
            currentCartId,
            currencyParam,
          );

          if (serverCart && serverCart.items && serverCart.items.length > 0) {
            const serverItems: CartItem[] = serverCart.items
              .map((item) => {
                const isCustomMerch =
                  item.is_customized === true || item.is_customized === "true";

                if (isCustomMerch) {
                  let customizationData = null;
                  let actualSize: Size = "M";
                  let actualPrice = 0;

                  if (item.custom_merch_design) {
                    try {
                      if (item.custom_merch_design.configuration_json) {
                        const configJson =
                          typeof item.custom_merch_design.configuration_json ===
                          "string"
                            ? JSON.parse(
                                item.custom_merch_design.configuration_json,
                              )
                            : item.custom_merch_design.configuration_json;

                        customizationData = configJson;
                        actualSize = (configJson.size || "M") as Size;
                      }
                    } catch (e) {
                      console.error("Error parsing configuration_json:", e);
                    }
                  }

                  if (!customizationData && item.customization_info) {
                    try {
                      customizationData =
                        typeof item.customization_info === "string"
                          ? JSON.parse(item.customization_info)
                          : item.customization_info;

                      if (customizationData?.size) {
                        actualSize = customizationData.size as Size;
                      }
                    } catch (e) {
                      console.error("Error parsing customization_info:", e);
                    }
                  }

                  actualPrice = parseFloat(item.total_price) / item.quantity;

                  const baseProductId =
                    item.custom_merch_design?.product_detail?.id?.toString() ||
                    item.product?.id?.toString() ||
                    item.id.toString();

                  const color =
                    customizationData?.color ||
                    item.custom_merch_design?.color ||
                    item.product?.color ||
                    "black";

                  const category = inferCategory(
                    item.custom_merch_design?.product_detail?.name ||
                      item.product?.name ||
                      "Custom Product",
                  );

                  const uniqueProductId = `custom-cart-item-${item.id}`;

                  const productName =
                    item.custom_merch_design?.product_detail?.name ||
                    item.custom_merch_design?.name ||
                    item.product?.name ||
                    "Custom Product";

                  const productImage =
                    item.custom_merch_design?.product_detail?.featured_image ||
                    item.product?.images?.[0]?.image ||
                    item.product?.featured_image ||
                    "";

                  return {
                    productId: uniqueProductId,
                    color: color,
                    size: actualSize,
                    quantity: item.quantity,
                    product: {
                      id: baseProductId,
                      name: productName,
                      slug:
                        item.custom_merch_design?.product_detail?.slug ||
                        item.product?.slug ||
                        `custom-${item.id}`,
                      price: actualPrice,
                      images: [
                        {
                          url: productImage,
                          color: color,
                          alt: productName,
                        },
                      ],
                      colors: [
                        {
                          name: color,
                          hex: "#000000",
                        },
                      ],
                      sizes: [actualSize] as readonly Size[],
                      category: category,
                      inStock: true,
                      description: "",
                      features: [],
                      rating: 0,
                      reviewCount: 0,
                    },
                    customization: customizationData,
                    baseProductId: baseProductId,
                  };
                } else {
                  const size = (item.product?.size || "M") as Size;
                  const color = item.product?.color || "black";
                  const category = inferCategory(item.product?.name || "");
                  const price = parseFloat(item.total_price) / item.quantity;

                  return {
                    productId:
                      item.product?.id?.toString() || item.id.toString(),
                    color: color,
                    size: size,
                    quantity: item.quantity,
                    product: {
                      id: item.product?.id?.toString() || item.id.toString(),
                      name: item.product?.name || "Product",
                      slug: item.product?.slug || `product-${item.id}`,
                      price: price,
                      images: [
                        {
                          url:
                            item.product?.images?.[0]?.image ||
                            item.product?.featured_image ||
                            "",
                          color: color,
                          alt: item.product?.name || "Product",
                        },
                      ],
                      colors: [
                        {
                          name: color,
                          hex: "#000000",
                        },
                      ],
                      sizes: [size] as readonly Size[],
                      category: category,
                      inStock: true,
                      description: "",
                      features: [],
                      rating: 0,
                      reviewCount: 0,
                    },
                  };
                }
              })
              .filter((item) => item !== undefined) as CartItem[];

            set({
              items: serverItems,
              serverCartId: serverCart.id,
              isLoading: false,
            });
          } else {
            set({
              items: [],
              serverCartId: serverCart?.id || currentCartId,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Cart sync error:", error);
          set({ isLoading: false });
        }
      },

      refreshCart: async (token: string) => {
        await get().syncWithServer(token);
      },

      setServerCartId: (id) => {
        set({ serverCartId: id });
      },

      getTotal: () => {
        const items = get().items;
        return items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        serverCartId: state.serverCartId,
      }),
    },
  ),
);
