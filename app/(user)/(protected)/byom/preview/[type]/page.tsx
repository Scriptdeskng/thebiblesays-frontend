"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BYOMCustomization, PlacementZone, Asset } from "@/types/byom.types";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useCartStore } from "@/store/useCartStore";
import { byomService } from "@/services/byom.service";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

interface PreviewPageProps {
  params: Promise<{ type: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken, user } = useAuthStore();
  const { currency, getCurrencyParam } = useCurrencyStore();
  const { refreshCart, setServerCartId } = useCartStore();
  const [customization, setCustomization] = useState<
    | (BYOMCustomization & {
        selectedAssets?: Asset[];
      })
    | null
  >(null);
  const [currentView, setCurrentView] = useState<PlacementZone>("front");
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    type: "text" | "asset";
    id: string;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [productImage, setProductImage] = useState<string>("");
  const [baseProduct, setBaseProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProductImage = async () => {
      try {
        const currencyParam = getCurrencyParam();
        const products = await byomService.getAvailableProducts(currencyParam);
        const product = products.find((p) => p.slug === resolvedParams.type);

        if (product) {
          setBaseProduct(product);
          if (product.featured_image) {
            setProductImage(product.featured_image);
          }
        } else {
          setProductImage(`/byom/${resolvedParams.type}-black.svg`);
        }
      } catch (error) {
        setProductImage(`/byom/${resolvedParams.type}-black.svg`);
      }
    };

    fetchProductImage();
  }, [resolvedParams.type, getCurrencyParam]);

  useEffect(() => {
    const storageKey = `byom-customization-${resolvedParams.type}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsedData = JSON.parse(stored);

        const normalizedData = {
          ...parsedData,
          front: parsedData.front || { texts: [], assets: [] },
          back: parsedData.back || { texts: [], assets: [] },
          side: parsedData.side || { texts: [], assets: [] },
        };

        setCustomization(normalizedData);

        if (
          parsedData.selectedAssets &&
          Array.isArray(parsedData.selectedAssets)
        ) {
          setSelectedAssets(parsedData.selectedAssets);
        }

        fetchPricing(normalizedData);
      } catch (error) {
        console.error("Error parsing customization:", error);
        router.push("/byom");
      }
    } else {
      router.push("/byom");
    }
  }, [router, resolvedParams.type]);

  const fetchPricing = async (customizationData: BYOMCustomization) => {
    try {
      setIsLoadingPrice(true);
      const currencyParam = getCurrencyParam();

      const products = await byomService.getAvailableProducts(currencyParam);
      const product = products.find((p) => p.slug === resolvedParams.type);

      if (!product) {
        setIsLoadingPrice(false);
        return;
      }

      const placements: string[] = [];
      if (
        customizationData.front.texts.length > 0 ||
        customizationData.front.assets.length > 0
      ) {
        placements.push("front");
      }
      if (
        customizationData.back.texts.length > 0 ||
        customizationData.back.assets.length > 0
      ) {
        placements.push("back");
      }
      if (
        customizationData.side.texts.length > 0 ||
        customizationData.side.assets.length > 0
      ) {
        placements.push("side");
      }

      const allTexts = [
        ...(customizationData.front?.texts || []),
        ...(customizationData.back?.texts || []),
        ...(customizationData.side?.texts || []),
      ];

      const hasAssets =
        (customizationData.front?.assets?.length || 0) > 0 ||
        (customizationData.back?.assets?.length || 0) > 0 ||
        (customizationData.side?.assets?.length || 0) > 0;

      const pricingPayload = {
        product_id: product.id,
        selected_placements: placements,
        text: allTexts.map((t) => t.content).join(" | ") || undefined,
        has_image: hasAssets,
        customization_options: {
          size: customizationData.size,
          text_count: allTexts.length,
          asset_count:
            (customizationData.front?.assets?.length || 0) +
            (customizationData.back?.assets?.length || 0) +
            (customizationData.side?.assets?.length || 0),
        },
      };

      const pricingData = await byomService.calculatePricing(
        pricingPayload,
        currencyParam,
      );

      const breakdown = pricingData.pricing_breakdown || {};
      const productInfo = pricingData.product_info || {};

      const basePrice = productInfo.base_price || product.base_price || 0;
      const totalCustomization = breakdown.total || 0;

      setPricing({
        base_price: basePrice,
        base_customization_fee: breakdown.base_fee,
        text_fee: breakdown.text_cost,
        image_fee: breakdown.image_cost || breakdown.asset_cost,
        placement_fees: breakdown.placement_costs,
        total_customization_fee: totalCustomization,
        grand_total: basePrice + totalCustomization,
        product_name: productInfo.name || product.name,
        text_count: pricingPayload.customization_options.text_count,
        asset_count: pricingPayload.customization_options.asset_count,
        placements_used: pricingPayload.selected_placements,
      });
    } catch (error) {
      toast.error("Failed to load pricing");
    } finally {
      setIsLoadingPrice(false);
    }
  };

  if (!customization) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <p className="text-grey">Loading customization...</p>
      </div>
    );
  }

  const currentDesign = customization[currentView] || { texts: [], assets: [] };
  const merchImageUrl =
    productImage || `/byom/${resolvedParams.type}-black.svg`;

  const getAssetSource = (assetId: string) => {
    const asset = selectedAssets.find((a) => a.id.toString() === assetId);
    return asset?.image_url || asset?.image || "";
  };

  const getTextDecoration = (text: any) => {
    const decorations = [];
    if (text.underline) decorations.push("underline");
    if (text.strikethrough) decorations.push("line-through");
    return decorations.join(" ") || "none";
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    type: "text" | "asset",
    id: string,
    currentX: number,
    currentY: number,
  ) => {
    e.preventDefault();
    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const offsetX = ((e.clientX - rect.left) / rect.width) * 100 - currentX;
    const offsetY = ((e.clientY - rect.top) / rect.height) * 100 - currentY;

    setDraggedItem({ type, id });
    setDragOffset({ x: offsetX, y: offsetY });
    if (type === "asset") setSelectedAsset(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !previewRef.current || !customization) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(
        100,
        ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x,
      ),
    );
    const y = Math.max(
      0,
      Math.min(
        100,
        ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y,
      ),
    );

    const newState = { ...customization };
    if (draggedItem.type === "text") {
      const textIndex = newState[currentView]!.texts.findIndex(
        (t) => t.id === draggedItem.id,
      );
      if (textIndex !== -1) {
        newState[currentView]!.texts[textIndex].x = x;
        newState[currentView]!.texts[textIndex].y = y;
      }
    } else {
      const assetIndex = newState[currentView]!.assets.findIndex(
        (a) => a.id === draggedItem.id,
      );
      if (assetIndex !== -1) {
        newState[currentView]!.assets[assetIndex].x = x;
        newState[currentView]!.assets[assetIndex].y = y;
      }
    }
    setCustomization(newState);
  };

  const handleMouseUp = () => {
    if (draggedItem && customization) {
      const customizationData = {
        ...customization,
        selectedAssets,
      };
      const storageKey = `byom-customization-${resolvedParams.type}`;
      localStorage.setItem(storageKey, JSON.stringify(customizationData));
      setDraggedItem(null);
    }
  };

  const handleAssetScale = (assetId: string, delta: number) => {
    if (!customization) return;

    const newState = { ...customization };
    const assetIndex = newState[currentView]!.assets.findIndex(
      (a) => a.id === assetId,
    );
    if (assetIndex !== -1) {
      const currentScale = newState[currentView]!.assets[assetIndex].scale;
      newState[currentView]!.assets[assetIndex].scale = Math.max(
        0.5,
        Math.min(3, currentScale + delta),
      );
      setCustomization(newState);

      const customizationData = {
        ...newState,
        selectedAssets,
      };
      const storageKey = `byom-customization-${resolvedParams.type}`;
      localStorage.setItem(storageKey, JSON.stringify(customizationData));
    }
  };

  const handleAddToCart = async () => {
    if (!accessToken || !user) {
      toast.error("Please login to continue");
      router.push(`/login?redirect=/byom/preview/${resolvedParams.type}`);
      return;
    }

    if (!baseProduct?.id) {
      toast.error("Product information not loaded. Please refresh.");
      return;
    }

    const hasText =
      (customization.front?.texts?.length || 0) > 0 ||
      (customization.back?.texts?.length || 0) > 0 ||
      (customization.side?.texts?.length || 0) > 0;

    const hasAssets =
      (customization.front?.assets?.length || 0) > 0 ||
      (customization.back?.assets?.length || 0) > 0 ||
      (customization.side?.assets?.length || 0) > 0;

    if (!hasText && !hasAssets) {
      toast.error(
        "Please add some customization (text or assets) to your design",
      );
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const currencyParam = getCurrencyParam();
      const payload = byomService.prepareDesignPayload(
        customization,
        baseProduct.id,
      );

      const response = await byomService.createAndAddToCart(
        accessToken,
        payload,
        currencyParam,
      );

      const cartId = response.cart_id;
      if (cartId) {
        setServerCartId(cartId);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await refreshCart(accessToken);

      toast.success("Added to cart successfully!");

      const storageKey = `byom-customization-${resolvedParams.type}`;
      localStorage.removeItem(storageKey);

      router.push("/cart");
    } catch (error: any) {
      const errorData = error?.response?.data;
      let errorMessage = "Failed to add to cart. Please try again.";

      if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-accent-1 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-primary">Preview Your Design</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6">
            <div className="flex gap-2 mb-4 justify-center flex-wrap">
              {(["front", "back", "side"] as PlacementZone[]).map((view) => {
                const design = customization[view] || { texts: [], assets: [] };
                const hasContent =
                  design.texts.length > 0 || design.assets.length > 0;

                return (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={cn(
                      "px-6 py-2 border rounded-md font-medium capitalize transition-colors relative",
                      currentView === view
                        ? "border-primary text-primary"
                        : "border-accent-1 text-grey",
                    )}
                  >
                    {view}
                    {hasContent && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative max-w-2xl mx-auto aspect-square bg-accent-1 rounded-lg overflow-hidden">
              <div
                ref={previewRef}
                className="absolute inset-0 flex items-center justify-center p-2 sm:p-12"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={merchImageUrl}
                    alt={resolvedParams.type}
                    fill
                    className="object-contain"
                  />

                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-16">
                    {currentDesign.texts &&
                      currentDesign.texts.map((text) => (
                        <div
                          key={text.id}
                          className="absolute group cursor-move"
                          style={{
                            left: `${text.x}%`,
                            top: `${text.y}%`,
                            transform: "translate(-50%, -50%)",
                            fontSize: `${text.fontSize}px`,
                            fontFamily: text.fontFamily,
                            fontWeight: text.bold ? "bold" : "normal",
                            fontStyle: text.italic ? "italic" : "normal",
                            textDecoration: getTextDecoration(text),
                            textAlign: text.alignment,
                            color: text.color || "#FFFFFF",
                            whiteSpace: "pre-wrap",
                            maxWidth: "80%",
                            letterSpacing: `${text.letterSpacing || 0}px`,
                            lineHeight: text.lineHeight || 1.2,
                          }}
                          onMouseDown={(e) =>
                            handleMouseDown(e, "text", text.id, text.x, text.y)
                          }
                        >
                          {text.content}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-grey/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Drag to reposition
                          </div>
                        </div>
                      ))}

                    {currentDesign.assets &&
                      currentDesign.assets.map((asset) => {
                        const assetSrc = getAssetSource(asset.assetId);
                        if (!assetSrc) return null;

                        return (
                          <div
                            key={asset.id}
                            className="absolute group cursor-move"
                            style={{
                              left: `${asset.x}%`,
                              top: `${asset.y}%`,
                              transform: `translate(-50%, -50%) scale(${asset.scale})`,
                              width: "80px",
                              height: "80px",
                            }}
                            onMouseDown={(e) =>
                              handleMouseDown(
                                e,
                                "asset",
                                asset.id,
                                asset.x,
                                asset.y,
                              )
                            }
                          >
                            <Image
                              src={assetSrc}
                              alt="Asset"
                              fill
                              className="object-contain"
                            />
                            {selectedAsset === asset.id && (
                              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1 z-10">
                                <button
                                  onClick={() =>
                                    handleAssetScale(asset.id, -0.2)
                                  }
                                  className="p-1 hover:bg-accent-1 rounded"
                                  title="Make smaller"
                                >
                                  <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleAssetScale(asset.id, 0.2)
                                  }
                                  className="p-1 hover:bg-accent-1 rounded"
                                  title="Make larger"
                                >
                                  <ZoomIn className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6 sticky top-4">
            <h2 className="text-xl font-bold text-primary mb-6">
              Order Summary
            </h2>

            {isLoadingPrice ? (
              <div className="space-y-4 mb-6">
                <div className="h-6 bg-accent-2 rounded animate-pulse" />
                <div className="h-6 bg-accent-2 rounded animate-pulse" />
                <div className="h-6 bg-accent-2 rounded animate-pulse" />
                <div className="h-6 bg-accent-2 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-primary">Base Product Price</span>
                  <span className="font-semibold text-primary">
                    {pricing?.base_price
                      ? formatPrice(pricing.base_price, currency)
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-primary">Size</span>
                  <span className="font-semibold text-primary">
                    {customization.size}
                  </span>
                </div>

                <div className="border-t border-accent-2 pt-4 space-y-3">
                  <h3 className="font-semibold text-primary text-sm">
                    Customization Breakdown:
                  </h3>

                  {pricing?.base_customization_fee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-grey">Base Setup Fee</span>
                      <span className="text-primary">
                        {formatPrice(pricing.base_customization_fee, currency)}
                      </span>
                    </div>
                  )}

                  {pricing?.text_count > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-grey">
                        Text ({pricing.text_count}{" "}
                        {pricing.text_count === 1 ? "item" : "items"})
                      </span>
                      <span className="text-primary">
                        {formatPrice(pricing.text_fee || 0, currency)}
                      </span>
                    </div>
                  )}

                  {pricing?.asset_count > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-grey">
                        Assets ({pricing.asset_count}{" "}
                        {pricing.asset_count === 1 ? "item" : "items"})
                      </span>
                      <span className="text-primary">
                        {formatPrice(pricing.image_fee || 0, currency)}
                      </span>
                    </div>
                  )}

                  {pricing?.placements_used?.length > 0 && (
                    <>
                      {pricing.placements_used.map((placement: string) => {
                        const fee = pricing.placement_fees?.[placement] || 0;

                        if (fee <= 0) return null;

                        return (
                          <div
                            key={placement}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-grey capitalize">
                              {placement} Placement
                            </span>
                            <span className="text-primary">
                              {formatPrice(fee, currency)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div className="flex justify-between items-center font-medium pt-2 border-t border-accent-2 border-dashed">
                    <span className="text-primary text-sm">
                      Total Customization
                    </span>
                    <span className="text-primary">
                      {formatPrice(
                        pricing?.total_customization_fee || 0,
                        currency,
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-primary pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {pricing?.grand_total
                        ? formatPrice(pricing.grand_total, currency)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full font-bold text-lg h-12"
                disabled={isProcessing || isLoadingPrice}
              >
                {isProcessing ? "Adding to Cart..." : "Add to Cart"}
              </Button>
            </div>

            {selectedAssets && selectedAssets.length > 0 && (
              <div className="mt-4 border-t border-accent-2 pt-4">
                <h3 className="text-sm font-semibold text-primary mb-2">
                  Selected Assets ({selectedAssets.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="relative w-12 h-12 border border-accent-2 rounded bg-accent-1 overflow-hidden"
                    >
                      <Image
                        src={asset.image_url || asset.image}
                        alt={asset.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-accent-2 pt-4 text-xs text-grey">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                Custom merch production time: 3-5 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
