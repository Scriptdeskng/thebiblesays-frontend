'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  Minus,
  Plus as PlusIcon,
  Strikethrough,
  Type,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MerchType, PlacementZone, CustomText, CustomSticker, BYOMCustomization } from '@/types/byom.types';
import { cn } from '@/utils/cn';
import { Size } from "@/types/product.types"
import { useAuthStore } from '@/store/useAuthStore';
import { byomService } from '@/services/byom.service';
import toast from 'react-hot-toast';
import { RiUploadCloud2Line } from 'react-icons/ri';
import { AiOutlineDelete } from 'react-icons/ai';

const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#001F3F' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF4136' },
  { name: 'Blue', hex: '#0074D9' },
  { name: 'Green', hex: '#2ECC40' },
  { name: 'Yellow', hex: '#FFDC00' },
];

const stickers = Array.from({ length: 13 }, (_, i) => ({
  id: `sticker-${i + 1}`,
  url: `/stickers/sticker-${i + 1}.png`,
  name: `Sticker ${i + 1}`,
  isCustom: false
}));

const fonts = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Ubuntu', 'Playfair Display', 'Merriweather', 'Oswald', 'PT Sans',
  'Nunito', 'Bebas Neue', 'Pacifico', 'Lobster', 'Dancing Script',
  'Anton', 'Righteous', 'Satisfy', 'Permanent Marker'
];

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  base64: string;
}

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export default function CustomizePage({ params }: { params: Promise<{ type: MerchType }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState(colors[0].hex);
  const [selectedColorName, setSelectedColorName] = useState(colors[0].name.toLowerCase());
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [placement, setPlacement] = useState<PlacementZone>('front');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [hasUsedStickers, setHasUsedStickers] = useState(false);

  const [customization, setCustomization] = useState<BYOMCustomization & { uploadedStickers?: UploadedImage[] }>({
    merchType: resolvedParams.type,
    color: colors[0].hex,
    colorName: colors[0].name.toLowerCase(),
    size: 'M',
    front: { texts: [], stickers: [] },
    back: { texts: [], stickers: [] },
    side: { texts: [], stickers: [] },
    uploadedStickers: []
  });

  const [history, setHistory] = useState<(BYOMCustomization & { uploadedStickers?: UploadedImage[] })[]>([customization]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [textInput, setTextInput] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [textSettings, setTextSettings] = useState({
    fontSize: 24,
    fontFamily: 'Roboto',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'center' as 'left' | 'center' | 'right',
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 1.2,
  });

  const [draggedItem, setDraggedItem] = useState<{ type: 'text' | 'sticker', id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font.replace(/ /g, '+')}`).join('&')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowFontDropdown(false);
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const storageKey = `byom-customization-${resolvedParams.type}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.uploadedStickers && Array.isArray(parsed.uploadedStickers)) {
          setUploadedImages(parsed.uploadedStickers);
          setCustomization(parsed);

          const allStickers = [
            ...(parsed.front?.stickers || []),
            ...(parsed.back?.stickers || []),
            ...(parsed.side?.stickers || [])
          ];
          const hasDefault = allStickers.some(s => s.stickerId.startsWith('sticker-'));
          setHasUsedStickers(hasDefault);
        }
      } catch (error) {
        localStorage.removeItem(storageKey);
      }
    }
  }, [resolvedParams.type]);

  const addToHistory = (newState: BYOMCustomization & { uploadedStickers?: UploadedImage[] }) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCustomization(newState);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setCustomization(previousState);
      if (previousState.uploadedStickers) {
        setUploadedImages(previousState.uploadedStickers);
      }
    }
  };

  const handleReset = () => {
    const resetState: BYOMCustomization & { uploadedStickers?: UploadedImage[] } = {
      merchType: resolvedParams.type,
      color: selectedColor,
      colorName: selectedColorName,
      size: selectedSize,
      front: { texts: [], stickers: [] },
      back: { texts: [], stickers: [] },
      side: { texts: [], stickers: [] },
      uploadedStickers: []
    };
    addToHistory(resetState);
    setTextInput('');
    setUploadedImages([]);
    setHasUsedStickers(false);
    const storageKey = `byom-customization-${resolvedParams.type}`;
    localStorage.removeItem(storageKey);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (hasUsedStickers) {
      setUploadError('You have already used stickers. Please remove them first to upload a custom image.');
      toast.error('Cannot use both custom images and stickers. Please remove stickers first.', {
        duration: 5000,
        position: 'top-center',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`File too large (${fileSizeMB}MB). Maximum size is ${MAX_IMAGE_SIZE_MB}MB. Please compress or resize your image.`);
      toast.error(`File too large! Maximum size is ${MAX_IMAGE_SIZE_MB}MB. Please use a smaller image.`, {
        duration: 6000,
        position: 'top-center',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const fileValidation = byomService.validateImageFile(file);

    if (!fileValidation.valid) {
      setUploadError(fileValidation.error!);
      toast.error(fileValidation.error!, {
        duration: 5000,
        position: 'top-center',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const dimensionValidation = await byomService.validateImageDimensions(file);

    if (!dimensionValidation.valid) {
      setUploadError(dimensionValidation.error!);
      toast.error(dimensionValidation.error!, {
        duration: 5000,
        position: 'top-center',
      });
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploadProgress(60);

    const reader = new FileReader();

    reader.onload = (event) => {
      const base64Data = event.target?.result as string;

      const base64Size = (base64Data.length * 0.75) / (1024 * 1024);
      if (base64Size > MAX_IMAGE_SIZE_MB * 1.5) {
        setUploadError(`File too large after processing. Please use an image under ${MAX_IMAGE_SIZE_MB}MB.`);
        toast.error(`File too large! Please compress your image to under ${MAX_IMAGE_SIZE_MB}MB.`, {
          duration: 6000,
          position: 'top-center',
        });
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const newImageId = `custom-${Date.now()}`;
      const newImage: UploadedImage = {
        id: newImageId,
        url: base64Data,
        name: file.name,
        base64: base64Data
      };

      const updatedImages = [...uploadedImages, newImage];
      setUploadedImages(updatedImages);

      const placedSticker: CustomSticker = {
        id: `placed-${Date.now()}`,
        stickerId: newImageId,
        x: 50,
        y: 50,
        scale: 1,
      };

      const newState = {
        ...customization,
        uploadedStickers: updatedImages
      };
      newState[placement]!.stickers.push(placedSticker);
      addToHistory(newState);

      setUploadProgress(100);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError('');

      toast.success('Image uploaded successfully!', {
        duration: 3000,
        position: 'top-center',
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      const errorMsg = 'Failed to read file. Please try again.';
      setUploadError(errorMsg);
      toast.error(errorMsg, {
        duration: 5000,
        position: 'top-center',
      });
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteUploadedImage = (imageId: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== imageId);
    setUploadedImages(updatedImages);

    const newState = {
      ...customization,
      uploadedStickers: updatedImages
    };
    (['front', 'back', 'side'] as PlacementZone[]).forEach(zone => {
      newState[zone]!.stickers = newState[zone]!.stickers.filter(
        s => s.stickerId !== imageId
      );
    });
    addToHistory(newState);

    toast.success('Image removed');
  };

  const handleAddSticker = (stickerId: string) => {
    if (uploadedImages.length > 0) {
      toast.error('Cannot use both custom images and stickers. Please remove custom images first.', {
        duration: 5000,
        position: 'top-center',
      });
      return;
    }

    const newSticker: CustomSticker = {
      id: `placed-${Date.now()}`,
      stickerId,
      x: 50,
      y: 50,
      scale: 1,
    };

    const newState = { ...customization };
    newState[placement]!.stickers.push(newSticker);
    addToHistory(newState);
    setHasUsedStickers(true);
  };

  const handleRemoveText = (textId: string) => {
    const newState = { ...customization };
    newState[placement]!.texts = newState[placement]!.texts.filter(t => t.id !== textId);
    addToHistory(newState);
  };

  const handleRemoveSticker = (stickerId: string) => {
    const newState = { ...customization };
    newState[placement]!.stickers = newState[placement]!.stickers.filter(s => s.id !== stickerId);
    addToHistory(newState);
    if (selectedSticker === stickerId) setSelectedSticker(null);

    const allStickers = [
      ...(newState.front?.stickers || []),
      ...(newState.back?.stickers || []),
      ...(newState.side?.stickers || [])
    ];
    const hasDefault = allStickers.some(s => s.stickerId.startsWith('sticker-'));
    setHasUsedStickers(hasDefault);
  };

  const handleStickerScale = (stickerId: string, delta: number) => {
    const newState = { ...customization };
    const stickerIndex = newState[placement]!.stickers.findIndex(s => s.id === stickerId);
    if (stickerIndex !== -1) {
      const currentScale = newState[placement]!.stickers[stickerIndex].scale;
      newState[placement]!.stickers[stickerIndex].scale = Math.max(0.5, Math.min(3, currentScale + delta));
      addToHistory(newState);
    }
  };

  const handleColorChange = (hex: string, colorName: string) => {
    setSelectedColor(hex);
    setSelectedColorName(colorName.toLowerCase());
    const newState = { ...customization, color: hex, colorName: colorName.toLowerCase() };
    addToHistory(newState);
  };

  const handleSizeChange = (size: Size) => {
    setSelectedSize(size);
    const newState = { ...customization, size };
    addToHistory(newState);
  };

  const handleFontSizeChange = (delta: number) => {
    setTextSettings(prev => ({
      ...prev,
      fontSize: Math.max(12, Math.min(72, prev.fontSize + delta))
    }));
  };

  const handleDoneText = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const newState = { ...customization };

    const livePreview = newState[placement]!.texts.find(t => t.id === 'live-preview');
    const currentX = livePreview?.x || 50;
    const currentY = livePreview?.y || 50;

    newState[placement]!.texts = newState[placement]!.texts.filter(t => t.id !== 'live-preview');

    const newText: CustomText = {
      id: `text-${Date.now()}`,
      content: textInput,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      bold: textSettings.bold,
      italic: textSettings.italic,
      underline: textSettings.underline,
      strikethrough: textSettings.strikethrough,
      alignment: textSettings.alignment,
      color: textSettings.color,
      letterSpacing: textSettings.letterSpacing,
      lineHeight: textSettings.lineHeight,
      x: currentX,
      y: currentY,
    };

    newState[placement]!.texts.push(newText);
    addToHistory(newState);

    setTextInput('');
    setIsEditingText(false);
    toast.success('Text added to design!');
  };

  useEffect(() => {
    if (!isEditingText || !textInput.trim()) {
      const newState = { ...customization };
      const liveTextIndex = newState[placement]!.texts.findIndex(t => t.id === 'live-preview');
      if (liveTextIndex !== -1) {
        newState[placement]!.texts = newState[placement]!.texts.filter(t => t.id !== 'live-preview');
        setCustomization(newState);
      }
      return;
    }

    const newState = { ...customization };
    const existingLiveText = newState[placement]!.texts.find(t => t.id === 'live-preview');

    if (existingLiveText) {
      existingLiveText.content = textInput;
      existingLiveText.fontSize = textSettings.fontSize;
      existingLiveText.fontFamily = textSettings.fontFamily;
      existingLiveText.bold = textSettings.bold;
      existingLiveText.italic = textSettings.italic;
      existingLiveText.underline = textSettings.underline;
      existingLiveText.strikethrough = textSettings.strikethrough;
      existingLiveText.alignment = textSettings.alignment;
      existingLiveText.color = textSettings.color;
      existingLiveText.letterSpacing = textSettings.letterSpacing;
      existingLiveText.lineHeight = textSettings.lineHeight;
    } else {
      const newText: CustomText = {
        id: 'live-preview',
        content: textInput,
        fontSize: textSettings.fontSize,
        fontFamily: textSettings.fontFamily,
        bold: textSettings.bold,
        italic: textSettings.italic,
        underline: textSettings.underline,
        strikethrough: textSettings.strikethrough,
        alignment: textSettings.alignment,
        color: textSettings.color,
        letterSpacing: textSettings.letterSpacing,
        lineHeight: textSettings.lineHeight,
        x: 50,
        y: 50,
      };
      newState[placement]!.texts.push(newText);
    }

    setCustomization(newState);
  }, [textInput, textSettings, isEditingText]);

  const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'sticker', id: string, currentX: number, currentY: number) => {
    e.preventDefault();

    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width * 100 - currentX;
    const offsetY = (e.clientY - rect.top) / rect.height * 100 - currentY;

    setDraggedItem({ type, id });
    setDragOffset({ x: offsetX, y: offsetY });
    if (type === 'sticker') setSelectedSticker(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100 - dragOffset.x));
    const y = Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100 - dragOffset.y));

    const newState = { ...customization };
    if (draggedItem.type === 'text') {
      const textIndex = newState[placement]!.texts.findIndex(t => t.id === draggedItem.id);
      if (textIndex !== -1) {
        newState[placement]!.texts[textIndex].x = x;
        newState[placement]!.texts[textIndex].y = y;
      }
    } else {
      const stickerIndex = newState[placement]!.stickers.findIndex(s => s.id === draggedItem.id);
      if (stickerIndex !== -1) {
        newState[placement]!.stickers[stickerIndex].x = x;
        newState[placement]!.stickers[stickerIndex].y = y;
      }
    }
    setCustomization(newState);
  };

  const handleMouseUp = () => {
    if (draggedItem) {
      if (draggedItem.type !== 'text' || draggedItem.id !== 'live-preview') {
        addToHistory(customization);
      }
      setDraggedItem(null);
    }
  };

  const handleNext = () => {
    const hasContent =
      customization.front.texts.length > 0 ||
      customization.front.stickers.length > 0 ||
      customization.back.texts.length > 0 ||
      customization.back.stickers.length > 0 ||
      customization.side.texts.length > 0 ||
      customization.side.stickers.length > 0;

    if (!hasContent) {
      toast.error('Please add some customization to your merch');
      return;
    }

    const finalCustomization = { ...customization };
    Object.keys(finalCustomization).forEach((key) => {
      if (key === 'front' || key === 'back' || key === 'side') {
        const zone = finalCustomization[key as PlacementZone];
        if (zone) {
          zone.texts = zone.texts.filter(t => t.id !== 'live-preview');
        }
      }
    });

    finalCustomization.uploadedStickers = uploadedImages;

    const customizationData = {
      ...finalCustomization,
      requiresApproval: true
    };

    try {
      const storageKey = `byom-customization-${resolvedParams.type}`;
      localStorage.setItem(storageKey, JSON.stringify(customizationData));
      router.push(`/byom/preview/${resolvedParams.type}`);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Please use a smaller image (under 2MB).', {
          duration: 6000,
          position: 'top-center',
        });
      } else {
        toast.error('Failed to save design. Please try again.');
      }
    }
  };

  const currentDesign = customization[placement];
  const merchImageUrl = `/byom/${resolvedParams.type}-${selectedColorName}.svg`;

  const getTextDecoration = (text: CustomText) => {
    const decorations = [];
    if (text.underline) decorations.push('underline');
    if (text.strikethrough) decorations.push('line-through');
    return decorations.join(' ') || 'none';
  };

  const getStickerSource = (stickerId: string) => {
    const uploadedImage = uploadedImages.find(img => img.id === stickerId);
    if (uploadedImage) return uploadedImage.url;

    const defaultSticker = stickers.find(s => s.id === stickerId);
    return defaultSticker?.url || '';
  };

  const canUploadImage = uploadedImages.length === 0 && !hasUsedStickers;
  const canUseStickers = uploadedImages.length === 0;

  return (
    <>
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="bg-white border border-accent-2 rounded-lg p-6 space-y-6 sticky top-4">
              <div>
                <h3 className="text-primary font-semibold mb-3">Merch Color</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex, color.name)}
                      className={cn(
                        'w-5 h-5 rounded-full border transition-all',
                        selectedColor === color.hex ? 'border-primary scale-110 p-1' : 'border-accent-2'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-primary font-semibold mb-3">Placement Zones</h3>
                <div className="flex flex-col">
                  {(['front', 'back', 'side'] as PlacementZone[]).map((zone) => (
                    <button
                      key={zone}
                      onClick={() => setPlacement(zone)}
                      className={cn(
                        'px-4 py-3 border-b border-b-accent-2 text-left font-medium capitalize transition-all',
                        placement === zone
                          ? ' bg-primary/5 text-primary'
                          : 'border-accent-2 text-grey hover:border-accent-1'
                      )}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-primary font-semibold mb-3">Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {(['S', 'M', 'L', 'XL', 'XXL'] as Size[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={cn(
                        'px-4 py-2 border rounded-lg font-medium transition-all',
                        selectedSize === size
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-accent-2 text-grey hover:border-accent-1'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center",
                canUploadImage ? "border-accent-2" : "border-grey/30 bg-grey/5"
              )}>
                <h3 className="text-primary font-semibold mb-4">Upload Your Image</h3>

                {!canUploadImage && hasUsedStickers && (
                  <div className="mb-4 p-3 bg-secondary border border-blue-200 rounded-lg">
                    <p className="text-xs text-primary font-medium">
                      You're using stickers. Remove them first to upload a custom image.
                    </p>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative aspect-square border-2 border-secondary overflow-hidden group">
                        <Image
                          src={image.url}
                          alt={image.name}
                          fill
                          className="object-contain"
                        />
                        <button
                          onClick={() => handleDeleteUploadedImage(image.id)}
                          className="absolute top-1 right-1 w-4 h-4 bg-red-300 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Delete image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-4">
                  <RiUploadCloud2Line className="w-7 h-7 text-primary mx-auto mb-2" />
                  <p className="text-xs text-grey">
                    JPG or PNG only, Max {MAX_IMAGE_SIZE_MB}MB<br />
                    Minimum 1500 x 1500px
                  </p>
                </div>

                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-400 font-medium">{uploadError}</p>
                  </div>
                )}

                {isUploading && (
                  <div className="mb-4">
                    <div className="w-full bg-accent-2 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-grey mt-1">{Math.round(uploadProgress)}%</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || !canUploadImage}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="w-full border-accent-2"
                  disabled={isUploading || !canUploadImage}
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4 space-y-6">
            <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-4">
                  <button
                    onClick={() => router.back()}
                    className=" hover:bg-accent-1 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-primary" />
                  </button>
                  <h1 className="text-lg sm:text-xl text-primary">
                    Customize Your {resolvedParams.type}
                  </h1>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUndo}
                    variant="outline"
                    size="sm"
                    disabled={historyIndex === 0}
                    className='border-accent-2 text-grey hidden lg:flex'
                  >
                    Undo
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className='border-accent-2 text-grey hidden lg:flex'
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleNext}
                    size="sm"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-accent-1 rounded-lg">
              <div
                ref={previewRef}
                className="relative w-full max-w-2xl mx-auto aspect-square rounded-lg overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-12">
                  <div className="relative w-full h-full">
                    <Image
                      src={merchImageUrl}
                      alt={resolvedParams.type}
                      fill
                      className="object-contain"
                    />

                    <div className="absolute inset-0 flex items-center justify-center p-16">
                      {currentDesign?.texts.map((text) => (
                        <div
                          key={text.id}
                          className="absolute group cursor-move"
                          style={{
                            left: `${text.x}%`,
                            top: `${text.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${text.fontSize}px`,
                            fontFamily: text.fontFamily,
                            fontWeight: text.bold ? 'bold' : 'normal',
                            fontStyle: text.italic ? 'italic' : 'normal',
                            textDecoration: getTextDecoration(text),
                            textAlign: text.alignment,
                            color: text.color || '#FFFFFF',
                            whiteSpace: 'pre-wrap',
                            maxWidth: '80%',
                            letterSpacing: `${text.letterSpacing || 0}px`,
                            lineHeight: text.lineHeight || 1.2,
                            opacity: text.id === 'live-preview' ? 0.7 : 1,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'text', text.id, text.x, text.y)}
                        >
                          {text.content}
                          {text.id !== 'live-preview' && (
                            <button
                              onClick={() => handleRemoveText(text.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <AiOutlineDelete className="w-4 h-4" />
                            </button>
                          )}
                          {text.id === 'live-preview' && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              Drag to position
                            </div>
                          )}
                        </div>
                      ))}

                      {currentDesign?.stickers.map((sticker) => (
                        <div
                          key={sticker.id}
                          className="absolute group cursor-move"
                          style={{
                            left: `${sticker.x}%`,
                            top: `${sticker.y}%`,
                            transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                            width: '80px',
                            height: '80px',
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'sticker', sticker.id, sticker.x, sticker.y)}
                        >
                          <Image
                            src={getStickerSource(sticker.stickerId)}
                            alt="Sticker"
                            fill
                            className="object-contain"
                          />
                          <button
                            onClick={() => handleRemoveSticker(sticker.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                          >
                            <AiOutlineDelete className="w-4 h-4" />
                          </button>
                          {selectedSticker === sticker.id && (
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1 z-10">
                              <button
                                onClick={() => handleStickerScale(sticker.id, -0.2)}
                                className="p-1 hover:bg-accent-1 rounded"
                                title="Make smaller"
                              >
                                <ZoomOut className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStickerScale(sticker.id, 0.2)}
                                className="p-1 hover:bg-accent-1 rounded"
                                title="Make larger"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative dropdown-container border border-accent-2 rounded-lg h-14 p-2 flex items-center justify-center">
                <div className='w-full'>
                  <p className="text-xs text-grey mb-1">Font</p>
                  <button
                    onClick={() => {
                      setShowFontDropdown(!showFontDropdown);
                      setShowColorDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 text-left"
                  >
                    <Type className="w-5 h-5 text-grey" />
                    <div className="">
                      <p className="text-sm font-medium text-primary truncate">
                        {textSettings.fontFamily}
                      </p>
                    </div>
                  </button>
                </div>

                {showFontDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-accent-2 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20 w-52">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        onClick={() => {
                          setTextSettings({ ...textSettings, fontFamily: font });
                          setShowFontDropdown(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-left hover:bg-accent-1 transition-colors',
                          textSettings.fontFamily === font && 'bg-accent-2'
                        )}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-accent-2 rounded-lg h-14 p-2 flex items-center justify-center">
                <div className='w-full'>
                  <p className="text-xs text-grey mb-1">Text Size</p>
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => handleFontSizeChange(-2)}
                      className=" hover:bg-accent-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-primary" />
                    </button>
                    <span className="text-sm font-semibold text-primary">
                      {textSettings.fontSize}
                    </span>
                    <button
                      onClick={() => handleFontSizeChange(2)}
                      className=" hover:bg-accent-1 rounded transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative dropdown-container border border-accent-2 rounded-lg h-14 p-2 flex items-center justify-center">
                <div className='w-full'>
                  <p className="text-xs text-grey mb-1">Text Color</p>
                  <button
                    onClick={() => {
                      setShowColorDropdown(!showColorDropdown);
                      setShowFontDropdown(false);
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 border-accent-2"
                      style={{ backgroundColor: textSettings.color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-primary">
                        {colors.find(c => c.hex === textSettings.color)?.name || 'Custom'}
                      </p>
                    </div>
                  </button>
                </div>
                {showColorDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-accent-2 rounded-lg shadow-lg p-3 z-20">
                    {colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => {
                          setTextSettings({ ...textSettings, color: color.hex });
                          setShowColorDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent-1 rounded transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-accent-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-primary">{color.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-accent-2 rounded-lg h-14 p-2 flex items-center justify-center">
                <div className='w-full'>
                  <p className="text-xs text-grey mb-1">Letter Spacing</p>
                  <div className="flex items-center justify-between ">
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, letterSpacing: Math.max(-5, prev.letterSpacing - 1) }))}
                      className="p-1 hover:bg-accent-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-primary" />
                    </button>
                    <span className="text-sm font-semibold text-primary">
                      {textSettings.letterSpacing}
                    </span>
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, letterSpacing: Math.min(10, prev.letterSpacing + 1) }))}
                      className="p-1 hover:bg-accent-1 rounded transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-accent-2 rounded-lg h-14 p-2 flex items-center justify-center">
                <div className='w-full'>
                  <p className="text-xs text-grey mb-1">Line Height</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, lineHeight: Math.max(0.8, prev.lineHeight - 0.1) }))}
                      className="p-1 hover:bg-accent-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-primary" />
                    </button>
                    <span className="text-sm font-semibold text-primary">
                      {textSettings.lineHeight.toFixed(1)}
                    </span>
                    <button
                      onClick={() => setTextSettings(prev => ({ ...prev, lineHeight: Math.min(3, prev.lineHeight + 0.1) }))}
                      className="p-1 hover:bg-accent-1 rounded transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="">
              <p className="text-xs text-grey mb-2">Styling</p>
              <div className="grid grid-cols-4 gap-1 mb-2">
                <button
                  onClick={() => setTextSettings({ ...textSettings, bold: !textSettings.bold })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.bold ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <Bold className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTextSettings({ ...textSettings, italic: !textSettings.italic })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.italic ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <Italic className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTextSettings({ ...textSettings, underline: !textSettings.underline })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.underline ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <Underline className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTextSettings({ ...textSettings, strikethrough: !textSettings.strikethrough })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.strikethrough ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <Strikethrough className="w-4 h-4 mx-auto" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setTextSettings({ ...textSettings, alignment: 'left' })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.alignment === 'left' ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <AlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTextSettings({ ...textSettings, alignment: 'center' })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.alignment === 'center' ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <AlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setTextSettings({ ...textSettings, alignment: 'right' })}
                  className={cn(
                    'p-2 border rounded transition-all',
                    textSettings.alignment === 'right' ? 'border-primary bg-primary/10 text-primary' : 'border-accent-2 text-grey'
                  )}
                >
                  <AlignRight className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6">
              <h3 className="text-primary font-semibold mb-4 pb-3 border-b border-accent-2">
                Featured Text
              </h3>
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setIsEditingText(true);
                }}
                onFocus={() => setIsEditingText(true)}
                placeholder="Type your text here... (Click Done to save)"
                className="w-full min-h-[120px] px-4 py-3 border border-accent-2 rounded-lg focus:outline-none resize-none text-black placeholder:text-grey mb-3"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleDoneText}
                  disabled={!textInput.trim()}
                  className="flex-1"
                >
                  Done
                </Button>
                {textInput.trim() && (
                  <Button
                    onClick={() => {
                      setTextInput('');
                      setIsEditingText(false);
                    }}
                    variant="outline"
                    className="border-accent-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className={cn(
              "bg-white border border-accent-2 rounded-lg p-6",
              !canUseStickers && "opacity-50"
            )}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-accent-2">
                <h3 className="text-primary font-semibold">
                  Add a Sticker
                </h3>
                {!canUseStickers && uploadedImages.length > 0 && (
                  <span className="text-xs text-primary font-medium">
                    Remove custom image to use stickers
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {stickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleAddSticker(sticker.id)}
                    disabled={!canUseStickers}
                    className={cn(
                      "aspect-square border-2 border-accent-2 rounded-lg transition-all p-2 relative",
                      canUseStickers ? "hover:border-secondary hover:shadow-md cursor-pointer" : "cursor-not-allowed"
                    )}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={sticker.url}
                        alt={sticker.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}