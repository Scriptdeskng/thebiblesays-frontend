export function getBaseImagePath(
  merchType: string,
  colorName: string
): string {
  const type = merchType.toLowerCase();
  const color = colorName.toLowerCase();
  return `/byom/${type}-${color}.svg`;
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
    parsed =
      typeof raw === "string" ? JSON.parse(raw) : raw;
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
