const BYOM_TYPES = [
  "tshirt",
  "short",
  "pants",
  "longsleeve",
  "hoodie",
  "hat",
] as const;
const BYOM_COLORS = [
  "black",
  "blue",
  "green",
  "grey",
  "navy",
  "red",
  "white",
  "yellow",
] as const;

export function getBaseImagePath(merchType: string, colorName: string): string {
  const type = merchType.toLowerCase().replace(/^bs-/, "");
  const normalizedType = BYOM_TYPES.includes(
    type as (typeof BYOM_TYPES)[number]
  )
    ? type
    : "hoodie";
  const color = (colorName || "black").toLowerCase();
  const normalizedColor = BYOM_COLORS.includes(
    color as (typeof BYOM_COLORS)[number]
  )
    ? color
    : "black";
  return `/byom/${normalizedType}-${normalizedColor}.svg`;
}

/**
 * Resolve product image for a BYOM order from configuration_json and public /byom assets.
 * Uses merchType + colorName from config (e.g. "bs-hoodie" -> hoodie-black.svg); falls back to order.color.
 */
export function getByomOrderProductImagePath(config: {
  configuration_json?: unknown;
  color?: string;
  product_name?: string;
  name?: string;
}): string {
  let parsed: Record<string, unknown> = {};
  const raw = config.configuration_json;
  if (raw != null) {
    try {
      parsed =
        typeof raw === "string"
          ? JSON.parse(raw)
          : (raw as Record<string, unknown>);
    } catch {
      // ignore
    }
  }
  let merchType = (parsed.merchType as string) || "";
  if (!merchType && (config.product_name || config.name)) {
    const name = (config.product_name || config.name || "").toLowerCase();
    if (name.includes("hoodie")) merchType = "hoodie";
    else if (name.includes("tshirt") || name.includes("t-shirt"))
      merchType = "tshirt";
    else if (name.includes("long") || name.includes("sleeve"))
      merchType = "longsleeve";
    else if (name.includes("short")) merchType = "short";
    else if (name.includes("pant") || name.includes("trouser"))
      merchType = "pants";
    else if (name.includes("hat")) merchType = "hat";
    else merchType = "hoodie";
  }
  if (!merchType) merchType = "hoodie";
  const type = merchType.toLowerCase().replace(/^bs-/, "");
  const normalizedType = BYOM_TYPES.includes(
    type as (typeof BYOM_TYPES)[number]
  )
    ? type
    : "hoodie";
  const colorName = (parsed.colorName as string) || config.color || "black";
  const color = (colorName || "black").toLowerCase();
  const normalizedColor = BYOM_COLORS.includes(
    color as (typeof BYOM_COLORS)[number]
  )
    ? color
    : "black";
  return `/byom/${normalizedType}-${normalizedColor}.svg`;
}

export function getStickerUrl(
  stickerId: string,
  uploadedStickers: any[] = []
): string {
  const uploadedSticker = uploadedStickers.find((s) => s.id === stickerId);
  if (uploadedSticker)
    return uploadedSticker.url || uploadedSticker.base64 || "";
  if (stickerId && stickerId.startsWith("sticker-"))
    return `/stickers/${stickerId}.png`;
  return "";
}

const DEFAULT_SIDE = {
  baseImage: "/byom/tshirt-black.svg",
  texts: [] as any[],
  stickers: [] as any[],
  color: "#000000",
  colorName: "black",
  size: "M",
  merchType: "tshirt",
  uploadedStickers: [] as any[],
};

export function getSideDataFromConfig(
  config: { configuration_json?: string | object } | null | undefined,
  side: "front" | "back" | "side"
) {
  if (!config?.configuration_json) {
    return { ...DEFAULT_SIDE };
  }
  let parsed: any = {};
  try {
    const raw = config.configuration_json;
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { ...DEFAULT_SIDE };
  }
  const sideData = parsed[side] || { texts: [], stickers: [] };
  const uploadedStickers = parsed.uploadedStickers || [];
  const merchType = parsed.merchType || "tshirt";
  const colorName = parsed.colorName || "black";
  const baseImage = getBaseImagePath(merchType, colorName);
  const texts = sideData.texts || [];
  const stickers = (sideData.stickers || []).map((sticker: any) => ({
    ...sticker,
    url: getStickerUrl(sticker.stickerId || sticker.id, uploadedStickers),
  }));
  return {
    baseImage,
    texts,
    stickers,
    color: parsed.color || "#000000",
    size: parsed.size || "M",
    colorName,
    merchType,
    uploadedStickers,
  };
}
