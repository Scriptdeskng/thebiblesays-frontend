/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Download, ChevronLeft } from "lucide-react";
import {
  Button,
  Modal,
  Badge,
  LoadingSpinner,
  EmptyState,
} from "@/components/admin/ui";
import {
  CustomMerch,
  CustomMerchStatus,
  ProductCategory,
} from "@/types/admin.types";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CustomMerchPage() {
  const [customMerch, setCustomMerch] = useState<CustomMerch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMerchDetails, setLoadingMerchDetails] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter] = useState<string>("all");
  // const [durationFilter, setDurationFilter] = useState<string>("monthly");
  const [selectedMerch, setSelectedMerch] = useState<CustomMerch | null>(null);
  const [selectedMerchConfig, setSelectedMerchConfig] = useState<any>(null);
  const [showMerchDetails, setShowMerchDetails] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"front" | "back" | "side">(
    "front"
  );
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [expandedMerchImage, setExpandedMerchImage] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalInfo, setApprovalInfo] = useState("");
  const merchImageRef = useRef<HTMLDivElement>(null);

  const normalizeStatus = (status: string): CustomMerchStatus => {
    const statusLower = status.toLowerCase();
    if (statusLower === "pending_approval" || statusLower === "pending") {
      return "pending";
    }
    if (statusLower === "approved") {
      return "approved";
    }
    if (statusLower === "rejected") {
      return "rejected";
    }
    if (statusLower === "draft") {
      return "draft";
    }
    return "pending"; // Default fallback
  };

  const inferProductCategory = (productName: string): ProductCategory => {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("shirt") || nameLower.includes("tee"))
      return "Shirts";
    if (nameLower.includes("cap")) return "Caps";
    if (nameLower.includes("hoodie")) return "Hoodie";
    if (nameLower.includes("hat") || nameLower.includes("headband"))
      return "Hat";
    if (nameLower.includes("jacket")) return "Jackets";
    return "Shirts"; // Default fallback
  };

  const transformApiDesignToCustomMerch = useCallback(
    (apiDesign: any): CustomMerch => {
      // Parse configuration_json if it exists
      let configuration: any = {};
      try {
        configuration = apiDesign.configuration_json
          ? typeof apiDesign.configuration_json === "string"
            ? JSON.parse(apiDesign.configuration_json)
            : apiDesign.configuration_json
          : {};
      } catch (e) {
        console.error("Error parsing configuration_json:", e);
      }

      // Extract user information - handle both user object and user_email
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

      // Extract product information
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

      // Get image URLs - handle various possible field names
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
        creator: creator,
        creatorId: creatorId,
        productType: productType,
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
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const apiData = await dashboardService.getCustomMerch({
        ordering: "-created_at",
      });
      const transformedData = apiData.map(transformApiDesignToCustomMerch);
      setCustomMerch(transformedData);
    } catch (error) {
      console.error("Error loading custom merch:", error);
      toast.error("Failed to load custom merch designs");
    } finally {
      setLoading(false);
    }
  }, [transformApiDesignToCustomMerch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewMerch = async (merch: CustomMerch) => {
    setLoadingMerchDetails(true);
    setShowMerchDetails(true);
    setSelectedSide("front");

    try {
      const apiDesign = await dashboardService.getCustomMerchById(merch.id);
      const transformedMerch = transformApiDesignToCustomMerch(apiDesign);
      setSelectedMerch(transformedMerch);
      // Store the raw API design with configuration_json for rendering
      setSelectedMerchConfig(apiDesign);
    } catch (error) {
      console.error("Error loading merch details:", error);
      toast.error("Failed to load design details");
      // Fallback to the list item data if API call fails
      setSelectedMerch(merch);
      setSelectedMerchConfig(null);
    } finally {
      setLoadingMerchDetails(false);
    }
  };

  const handleBackToList = () => {
    setShowMerchDetails(false);
    setSelectedMerch(null);
    setSelectedMerchConfig(null);
    setSelectedSide("front");
    setRejectionReason("");
    setApprovalInfo("");
  };

  // Get base image path from merchType and colorName
  const getBaseImagePath = (merchType: string, colorName: string): string => {
    const type = merchType.toLowerCase();
    const color = colorName.toLowerCase();
    return `/byom/${type}-${color}.svg`;
  };

  // Get uploaded sticker URL by ID
  const getStickerUrl = (
    stickerId: string,
    uploadedStickers: any[] = []
  ): string => {
    const sticker = uploadedStickers.find((s) => s.id === stickerId);
    return sticker?.url || "";
  };

  // Extract side data from configuration_json
  const getSideDataFromConfig = (side: "front" | "back" | "side") => {
    if (!selectedMerchConfig?.configuration_json) {
      // Return default empty data structure
      return {
        baseImage: "/byom/tshirt-black.svg",
        texts: [],
        stickers: [],
        color: "#000000",
        colorName: "black",
        size: "M",
        merchType: "tshirt",
      };
    }

    let config: any = {};
    try {
      config =
        typeof selectedMerchConfig.configuration_json === "string"
          ? JSON.parse(selectedMerchConfig.configuration_json)
          : selectedMerchConfig.configuration_json;
    } catch (e) {
      console.error("Error parsing configuration_json:", e);
      return {
        baseImage: "/byom/tshirt-black.svg",
        texts: [],
        stickers: [],
        color: "#000000",
        colorName: "black",
        size: "M",
        merchType: "tshirt",
      };
    }

    const sideData = config[side] || { texts: [], stickers: [] };
    const uploadedStickers = config.uploadedStickers || [];
    const merchType = config.merchType || "tshirt";
    const colorName = config.colorName || "black";

    const baseImage = getBaseImagePath(merchType, colorName);

    // Extract texts
    const texts = sideData.texts || [];

    // Extract stickers - map sticker IDs to URLs
    const stickers = (sideData.stickers || []).map((sticker: any) => ({
      ...sticker,
      url: getStickerUrl(sticker.stickerId || sticker.id, uploadedStickers),
    }));

    return {
      baseImage,
      texts,
      stickers,
      uploadedStickers,
      merchType,
      colorName,
      color: config.color || "#000000",
      size: config.size || "M",
    };
  };

  // Compute merchSideData from configuration_json
  const merchSideData = {
    front: getSideDataFromConfig("front"),
    back: getSideDataFromConfig("back"),
    side: getSideDataFromConfig("side"),
  };

  const currentSideData = merchSideData[selectedSide];

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${selectedSide}-design.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMerchImage = async () => {
    if (!merchImageRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(merchImageRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `${selectedMerch?.designName}-${selectedSide}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading merch image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  const handleRejectDesign = () => {
    setShowRejectModal(true);
  };

  const handleApproveDesign = () => {
    setShowApproveModal(true);
  };

  const confirmReject = async () => {
    if (!selectedMerch || rejecting) return;

    setRejecting(true);
    try {
      await dashboardService.rejectCustomMerch(
        selectedMerch.id,
        rejectionReason || undefined
      );
      // Reload data to get updated status
      await loadData();
      toast.success("Design rejected successfully!");
      setShowRejectModal(false);
      setRejectionReason("");
      handleBackToList();
    } catch (error) {
      console.error("Error rejecting design:", error);
      toast.error("Failed to reject design");
    } finally {
      setRejecting(false);
    }
  };

  const confirmApprove = async () => {
    if (!selectedMerch || approving) return;

    setApproving(true);
    try {
      await dashboardService.approveCustomMerch(selectedMerch.id);
      // Reload data to get updated status
      await loadData();
      toast.success("Design approved successfully!");
      setShowApproveModal(false);
      setApprovalInfo("");
      handleBackToList();
    } catch (error) {
      console.error("Error approving design:", error);
      toast.error("Failed to approve design");
    } finally {
      setApproving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await dashboardService.exportCustomMerch();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `custom-merch-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Custom merch designs exported successfully");
    } catch (error) {
      console.error("Error exporting custom merch:", error);
      toast.error("Failed to export custom merch designs");
    } finally {
      setExporting(false);
    }
  };

  const filteredMerch = customMerch.filter((merch) => {
    const matchesSearch =
      merch.designName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merch.designId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merch.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || merch.status === activeTab;
    const matchesStatus =
      statusFilter === "all" || merch.status === statusFilter;
    const matchesType =
      typeFilter === "all" || merch.productType === typeFilter;
    return matchesSearch && matchesTab && matchesStatus && matchesType;
  });

  const allCount = customMerch.length;
  const pendingCount = customMerch.filter((m) => m.status === "pending").length;
  const approvedCount = customMerch.filter(
    (m) => m.status === "approved"
  ).length;
  const rejectedCount = customMerch.filter(
    (m) => m.status === "rejected"
  ).length;
  const draftCount = customMerch.filter((m) => m.status === "draft").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {showMerchDetails ? (
        loadingMerchDetails ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedMerch ? (
          <div className="">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBackToList}
                className=" text-admin-primary hover:text-admin-primary/80 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-admin-primary">Merch Details</h2>
            </div>

            <div className="bg-white">
              <div className="relative bg-admin-primary/4 rounded-t-lg p-6 pb-10">
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={
                      selectedMerch.status === "approved"
                        ? "success"
                        : selectedMerch.status === "rejected"
                        ? "danger"
                        : selectedMerch.status === "draft"
                        ? "info"
                        : "warning"
                    }
                  >
                    {selectedMerch.status}
                  </Badge>
                </div>

                <div className="flex justify-center gap-3 mb-8">
                  {(["front", "back", "side"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => setSelectedSide(side)}
                      className={`px-8 py-1.5 rounded-md border capitalize transition-all ${
                        selectedSide === side
                          ? "border-admin-primary/67 text-admin-primary"
                          : " text-admin-primary/50 border border-admin-primary/13"
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>

                <div
                  ref={merchImageRef}
                  className="aspect-square max-w-sm mx-auto bg-admin-primary/7 rounded-3xl overflow-hidden relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setExpandedMerchImage(true)}
                >
                  {currentSideData.baseImage ? (
                    <img
                      src={currentSideData.baseImage}
                      alt={`${selectedSide} view`}
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-grey">
                      No Image
                    </div>
                  )}

                  {/* Render all texts from configuration_json */}
                  {currentSideData.texts?.map((text: any, index: number) => (
                    <div
                      key={text.id || index}
                      className="absolute"
                      style={{
                        left: `${text.x}%`,
                        top: `${text.y}%`,
                        transform: "translate(-50%, -50%)",
                        color: text.color || "#000000",
                        fontSize: `${text.fontSize || 16}px`,
                        fontFamily: text.fontFamily || "Arial",
                        fontWeight: text.bold ? "bold" : "normal",
                        fontStyle: text.italic ? "italic" : "normal",
                        textDecoration: text.underline
                          ? "underline"
                          : text.strikethrough
                          ? "line-through"
                          : "none",
                        textAlign: text.alignment || "center",
                        letterSpacing: text.letterSpacing
                          ? `${text.letterSpacing}px`
                          : "normal",
                        lineHeight: text.lineHeight
                          ? `${text.lineHeight}px`
                          : "normal",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {text.content}
                    </div>
                  ))}

                  {/* Render all stickers from configuration_json */}
                  {currentSideData.stickers?.map(
                    (sticker: any, index: number) => {
                      if (!sticker.url) return null;
                      const size = (sticker.scale || 1) * 100; // Scale to percentage
                      return (
                        <img
                          key={sticker.id || index}
                          src={sticker.url}
                          alt="Sticker"
                          className="absolute"
                          style={{
                            left: `${sticker.x}%`,
                            top: `${sticker.y}%`,
                            transform: "translate(-50%, -50%)",
                            width: `${size}px`,
                            height: `${size}px`,
                            objectFit: "contain",
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </div>

              <div className="bg-admin-primary/4 p-6">
                <div className="bg-admin-primary/10 pt-6 p-6 rounded-xl">
                  <h3 className="font-semibold text-admin-primary mb-4">
                    Merch Details
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Design Name</p>
                      <p className="text-admin-primary font-medium">
                        {selectedMerch.designName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Merch Color</p>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-accent-2"
                          style={{ backgroundColor: currentSideData.color }}
                        ></div>
                        <p className="text-admin-primary font-medium capitalize">
                          {currentSideData.colorName || "Black"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Amount</p>
                      <p className="text-admin-primary font-medium">
                        {formatCurrency(selectedMerch.amount)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Merch Size</p>
                      <p className="text-admin-primary font-medium">
                        {currentSideData.size || "M"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Merch Type</p>
                      <p className="text-admin-primary font-medium">
                        {selectedMerch.productType}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Quantity</p>
                      <p className="text-admin-primary font-medium">
                        {selectedMerch.quantity} units
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Date Created</p>
                      <p className="text-admin-primary font-medium">
                        {formatDate(selectedMerch.dateCreated)}
                      </p>
                    </div>

                    {/* Design details */}
                    <h3 className="font-semibold text-admin-primary mb-4 mt-10">
                      Design Details
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="text-grey mb-1">Creator</p>
                      <p className="text-admin-primary font-medium">
                        {selectedMerch.creator}
                      </p>
                    </div>

                    {/* Display all texts for current side */}
                    {currentSideData.texts &&
                      currentSideData.texts.length > 0 && (
                        <>
                          <h4 className="font-semibold text-admin-primary mb-2 mt-4">
                            Texts ({selectedSide})
                          </h4>
                          {currentSideData.texts.map(
                            (text: any, index: number) => (
                              <div
                                key={text.id || index}
                                className="space-y-2 mb-4"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-grey mb-1">Text Content</p>
                                  <p className="text-admin-primary font-medium">
                                    {text.content}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-grey mb-1">Text Color</p>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-full border border-accent-2"
                                      style={{ backgroundColor: text.color }}
                                    ></div>
                                    <p className="text-admin-primary font-medium">
                                      {text.color}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-grey mb-1">Font Size</p>
                                  <p className="text-admin-primary font-medium">
                                    {text.fontSize || 16}px
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-grey mb-1">Position</p>
                                  <p className="text-admin-primary font-medium">
                                    X: {text.x}%, Y: {text.y}%
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </>
                      )}

                    {/* Display all stickers for current side */}
                    {currentSideData.stickers &&
                      currentSideData.stickers.length > 0 && (
                        <>
                          <h4 className="font-semibold text-admin-primary mb-3 mt-6">
                            Stickers ({selectedSide})
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {currentSideData.stickers.map(
                              (sticker: any, index: number) => {
                                if (!sticker.url) return null;
                                return (
                                  <div key={sticker.id || index}>
                                    <div className="bg-accent-1 p-4 rounded-lg flex items-center justify-center">
                                      <div className="flex flex-col items-center gap-2">
                                        <div
                                          className="w-32 h-32 bg-white rounded-lg overflow-hidden border border-accent-2 cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() =>
                                            setExpandedImage(sticker.url)
                                          }
                                        >
                                          <img
                                            src={sticker.url}
                                            alt={`Sticker ${index + 1}`}
                                            className="w-full h-full object-contain"
                                          />
                                        </div>

                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDownloadImage(sticker.url)
                                          }
                                          className="flex items-center"
                                        >
                                          <Download
                                            size={16}
                                            className="mr-2"
                                          />
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </>
                      )}

                    {/* Show message if no texts or stickers */}
                    {(!currentSideData.texts ||
                      currentSideData.texts.length === 0) &&
                      (!currentSideData.stickers ||
                        currentSideData.stickers.length === 0) && (
                        <div className="mt-4 text-grey text-sm">
                          No texts or stickers on this side
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {selectedMerch.status === "pending" && (
                <div className="flex justify-center space-x-5 pt-7">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRejectDesign}
                  >
                    Reject Design
                  </Button>
                  <Button type="button" onClick={handleApproveDesign}>
                    Approve Design
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-medium text-admin-primary">
              Custom Merch
            </h1>
            <p className="text-sm text-admin-primary">
              Review and manage custom merchandise designs
            </p>
          </div>

          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 bg-white p-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${
                    activeTab === "all"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  <span>All Merch</span>
                  <span className="ml-1">({allCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${
                    activeTab === "pending"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  <span>Pending Review</span>
                  <span className="ml-1">({pendingCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${
                    activeTab === "approved"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  <span>Approved</span>
                  <span className="ml-1">({approvedCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("rejected")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${
                    activeTab === "rejected"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  <span>Rejected</span>
                  <span className="ml-1">({rejectedCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab("draft")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${
                    activeTab === "draft"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  <span>Draft</span>
                  <span className="ml-1">({draftCount})</span>
                </button>
              </div>
              <Button onClick={handleExport} disabled={exporting} className="flex items-center gap-2">
                {exporting && <LoadingSpinner size="sm" />}
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4">
            <div>
              <h2 className="text-sm text-admin-primary/60 mb-1">
                All Merch Design
              </h2>
              <p className="text-2xl font-bold text-admin-primary">
                {filteredMerch.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search designs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
              {/* <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg focus:outline-none"
              >
                <option value="all">Type</option>
                <option value="Shirts">T-Shirt</option>
                <option value="Hoodie">Hoodie</option>
                <option value="Caps">Caps</option>
                <option value="Jackets">Jackets</option>
              </select>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select> */}
            </div>
          </div>

          <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
            {filteredMerch.length === 0 ? (
              <EmptyState
                title="No custom merch found"
                description="Try adjusting your filters or search criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent-1 shadow-md shadow-black">
                    <tr>
                      {/* <th className="text-left font-medium text-admin-primary px-6 py-4">Image</th> */}
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Design Name
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Design ID
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Product Type
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Date Created
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMerch.map((merch) => (
                      <tr
                        key={merch.id}
                        onClick={() => handleViewMerch(merch)}
                        className="border-b border-accent-2 bg-white cursor-pointer"
                      >
                        {/* <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-accent-1 rounded-lg overflow-hidden">
                            {merch.image ? (
                              <img src={merch.image} alt={merch.designName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-grey text-xs">No Image</div>
                            )}
                          </div>
                        </td> */}
                        <td className="px-6 py-4">
                          <p className=" text-admin-primary">
                            {merch.designName}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-admin-primary">
                          {merch.designId}
                        </td>
                        <td className="px-6 py-4 text-admin-primary">
                          {merch.productType}
                        </td>
                        <td className="px-6 py-4 text-admin-primary">
                          {formatDate(merch.dateCreated)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              merch.status === "approved"
                                ? "success"
                                : merch.status === "rejected"
                                ? "danger"
                                : merch.status === "draft"
                                ? "info"
                                : "warning"
                            }
                          >
                            {merch.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {expandedImage && (
        <Modal
          isOpen={!!expandedImage}
          onClose={() => setExpandedImage(null)}
          title="Image Preview"
          size="sm"
        >
          <div className="flex flex-col items-center gap-4">
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <Button
              onClick={() => handleDownloadImage(expandedImage)}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download Image
            </Button>
          </div>
        </Modal>
      )}

      {expandedMerchImage && (
        <Modal
          isOpen={expandedMerchImage}
          onClose={() => setExpandedMerchImage(false)}
          title="Merch Design Preview"
          size="md"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="aspect-square max-w-lg mx-auto bg-admin-primary/7 rounded-3xl overflow-hidden relative flex items-center justify-center">
              {currentSideData.baseImage ? (
                <img
                  src={currentSideData.baseImage}
                  alt={`${selectedSide} view`}
                  className="w-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-grey">
                  No Image
                </div>
              )}

              {/* Render all texts from configuration_json */}
              {currentSideData.texts?.map((text: any, index: number) => (
                <div
                  key={text.id || index}
                  className="absolute"
                  style={{
                    left: `${text.x}%`,
                    top: `${text.y}%`,
                    transform: "translate(-50%, -50%)",
                    color: text.color || "#000000",
                    fontSize: `${text.fontSize || 16}px`,
                    fontFamily: text.fontFamily || "Arial",
                    fontWeight: text.bold ? "bold" : "normal",
                    fontStyle: text.italic ? "italic" : "normal",
                    textDecoration: text.underline
                      ? "underline"
                      : text.strikethrough
                      ? "line-through"
                      : "none",
                    textAlign: text.alignment || "center",
                    letterSpacing: text.letterSpacing
                      ? `${text.letterSpacing}px`
                      : "normal",
                    lineHeight: text.lineHeight
                      ? `${text.lineHeight}px`
                      : "normal",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {text.content}
                </div>
              ))}

              {/* Render all stickers from configuration_json */}
              {currentSideData.stickers?.map((sticker: any, index: number) => {
                if (!sticker.url) return null;
                const size = (sticker.scale || 1) * 100; // Scale to percentage
                return (
                  <img
                    key={sticker.id || index}
                    src={sticker.url}
                    alt="Sticker"
                    className="absolute"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: `${size}px`,
                      height: `${size}px`,
                      objectFit: "contain",
                    }}
                  />
                );
              })}
            </div>
            <Button
              onClick={downloadMerchImage}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download Merch Design
            </Button>
          </div>
        </Modal>
      )}

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            if (!rejecting) {
              setShowRejectModal(false);
              setRejectionReason("");
            }
          }}
          title="Reject"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-primary mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-accent-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none"
                rows={4}
                placeholder="Enter reason for rejecting this design..."
                disabled={rejecting}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                disabled={rejecting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmReject}
                variant="secondary"
                disabled={rejecting}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                {rejecting && <LoadingSpinner size="sm" />}
                {rejecting ? "Rejecting..." : "Reject Design"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showApproveModal && (
        <Modal
          isOpen={showApproveModal}
          onClose={() => {
            if (!approving) {
              setShowApproveModal(false);
              setApprovalInfo("");
            }
          }}
          title="Approve"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-primary mb-2">
                Additional Information
              </label>
              <textarea
                value={approvalInfo}
                onChange={(e) => setApprovalInfo(e.target.value)}
                className="w-full px-4 py-3 border border-accent-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20 resize-none"
                rows={4}
                placeholder="Enter any additional information (optional)..."
                disabled={approving}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovalInfo("");
                }}
                disabled={approving}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={approving}
                className="flex items-center gap-2"
              >
                {approving && <LoadingSpinner size="sm" />}
                {approving ? "Approving..." : "Approve Design"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
