'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ZoomIn, ZoomOut, Minus, Plus as PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlacementZone, CustomText, CustomAsset, BYOMCustomization, Asset } from '@/types/byom.types';
import { cn } from '@/utils/cn';
import { Size } from "@/types/product.types"
import { AiOutlineDelete } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { byomService } from '@/services/byom.service';
import { AssetSelectorModal } from '@/components/byom/AssetSelectorModal';

const fonts = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Ubuntu', 'Playfair Display', 'Merriweather', 'Oswald', 'PT Sans',
  'Nunito', 'Bebas Neue', 'Pacifico', 'Lobster', 'Dancing Script',
  'Anton', 'Righteous', 'Satisfy', 'Permanent Marker'
];

interface CustomizePageProps {
  params: Promise<{ type: string }>;
}

export default function CustomizePage({ params }: CustomizePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const [placement, setPlacement] = useState<PlacementZone>('front');
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [customization, setCustomization] = useState<BYOMCustomization>({
    merchType: resolvedParams.type as any,
    size: 'M',
    front: { texts: [], assets: [] },
    back: { texts: [], assets: [] },
    side: { texts: [], assets: [] },
  });

  const [productImage, setProductImage] = useState<string>('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  const [textInput, setTextInput] = useState('');
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

  const [draggedItem, setDraggedItem] = useState<{ type: 'text' | 'asset', id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedAssetForScale, setSelectedAssetForScale] = useState<string | null>(null);

  const [history, setHistory] = useState<BYOMCustomization[]>([customization]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font.replace(/ /g, '+')}`).join('&')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchProductImage = async () => {
      try {
        setIsLoadingProduct(true);
        const { getCurrencyParam } = useCurrencyStore.getState();
        const currencyParam = getCurrencyParam();
        const products = await byomService.getAvailableProducts(currencyParam);
        
        const product = products.find(p => p.slug === resolvedParams.type);
        
        if (product && product.featured_image) {
          setProductImage(product.featured_image);
        } else {
          setProductImage(`/byom/${resolvedParams.type}-black.svg`);
        }
      } catch (error) {
        setProductImage(`/byom/${resolvedParams.type}-black.svg`);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductImage();
  }, [resolvedParams.type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowFontDropdown(false);
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
        setCustomization(parsed);
        
        if (parsed.selectedAssets) {
          setSelectedAssets(parsed.selectedAssets);
        }
        
        if (parsed.size) {
          setSelectedSize(parsed.size);
        }
      } catch (error) {
        console.error('Error loading saved customization:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [resolvedParams.type]);

  useEffect(() => {
    const storageKey = `byom-customization-${resolvedParams.type}`;
    const dataToSave = {
      ...customization,
      selectedAssets,
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [customization, selectedAssets, resolvedParams.type]);

  const addToHistory = (newState: BYOMCustomization) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCustomization(newState);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCustomization(history[historyIndex - 1]);
    }
  };

  const handleReset = () => {
    const resetState: BYOMCustomization = {
      merchType: resolvedParams.type as any,
      size: selectedSize,
      front: { texts: [], assets: [] },
      back: { texts: [], assets: [] },
      side: { texts: [], assets: [] },
    };
    addToHistory(resetState);
    setTextInput('');
    setSelectedAssets([]);
    
    const storageKey = `byom-customization-${resolvedParams.type}`;
    localStorage.removeItem(storageKey);
  };

  const handleAssetSelected = (asset: Asset) => {
    const newAsset: CustomAsset = {
      id: `asset-${Date.now()}`,
      assetId: asset.id.toString(),
      x: 50,
      y: 50,
      scale: 1,
    };

    const newState = { ...customization };
    newState[placement]!.assets.push(newAsset);
    addToHistory(newState);
    
    if (!selectedAssets.find(a => a.id === asset.id)) {
      setSelectedAssets(prev => [...prev, asset]);
    }
    
    toast.success('Asset added!');
  };

  const handleRemoveText = (textId: string) => {
    const newState = { ...customization };
    newState[placement]!.texts = newState[placement]!.texts.filter(t => t.id !== textId);
    addToHistory(newState);
  };

  const handleRemoveAsset = (assetId: string) => {
    const newState = { ...customization };
    newState[placement]!.assets = newState[placement]!.assets.filter(a => a.id !== assetId);
    addToHistory(newState);
    
    if (selectedAssetForScale === assetId) {
      setSelectedAssetForScale(null);
    }
  };

  const handleAssetScale = (assetId: string, delta: number) => {
    const newState = { ...customization };
    const assetIndex = newState[placement]!.assets.findIndex(a => a.id === assetId);
    
    if (assetIndex !== -1) {
      const currentScale = newState[placement]!.assets[assetIndex].scale;
      newState[placement]!.assets[assetIndex].scale = Math.max(0.5, Math.min(3, currentScale + delta));
      setCustomization(newState); 
    }
  };

  const handleSizeChange = (size: Size) => {
    setSelectedSize(size);
    const newState = { ...customization, size };
    addToHistory(newState);
  };

  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

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
      x: 50,
      y: 50,
    };

    const newState = { ...customization };
    newState[placement]!.texts.push(newText);
    addToHistory(newState);

    setTextInput('');
    toast.success('Text added!');
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'asset', id: string, currentX: number, currentY: number) => {
    e.preventDefault();

    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width * 100 - currentX;
    const offsetY = (e.clientY - rect.top) / rect.height * 100 - currentY;

    setDraggedItem({ type, id });
    setDragOffset({ x: offsetX, y: offsetY });
    
    if (type === 'asset') {
      setSelectedAssetForScale(id);
    }
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
      const assetIndex = newState[placement]!.assets.findIndex(a => a.id === draggedItem.id);
      if (assetIndex !== -1) {
        newState[placement]!.assets[assetIndex].x = x;
        newState[placement]!.assets[assetIndex].y = y;
      }
    }
    
    setCustomization(newState);
  };

  const handleMouseUp = () => {
    if (draggedItem) {
      addToHistory(customization);
      setDraggedItem(null);
    }
  };

  const handleNext = () => {
    const hasContent =
      customization.front.texts.length > 0 ||
      customization.front.assets.length > 0 ||
      customization.back.texts.length > 0 ||
      customization.back.assets.length > 0 ||
      customization.side.texts.length > 0 ||
      customization.side.assets.length > 0;

    if (!hasContent) {
      toast.error('Please add some customization to your merch');
      return;
    }

    router.push(`/byom/preview/${resolvedParams.type}`);
  };

  const currentDesign = customization[placement];
  const merchImageUrl = productImage || `/byom/${resolvedParams.type}-black.svg`;

  const getTextDecoration = (text: CustomText) => {
    const decorations = [];
    if (text.underline) decorations.push('underline');
    if (text.strikethrough) decorations.push('line-through');
    return decorations.join(' ') || 'none';
  };

  const getAssetSource = (assetId: string) => {
    const asset = selectedAssets.find(a => a.id.toString() === assetId);
    return asset?.image_url || asset?.image || '';
  };

  return (
    <>
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white border border-accent-2 rounded-lg p-6 space-y-6 sticky top-4">
              {/* Placement Zones */}
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
                          ? 'bg-primary/5 text-primary'
                          : 'border-accent-2 text-grey hover:border-accent-1'
                      )}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
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

              {/* Add Text */}
              <div className="border-t border-accent-2 pt-6">
                <h3 className="text-primary font-semibold mb-3">Add Text</h3>
                <div className="space-y-3">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your text here..."
                    className="w-full min-h-20 px-3 py-2 border border-accent-2 rounded-lg focus:outline-none resize-none text-black placeholder:text-grey text-sm"
                  />
                  
                  <div className="relative dropdown-container">
                    <label className="text-xs text-grey mb-1 block">Font</label>
                    <button
                      onClick={() => setShowFontDropdown(!showFontDropdown)}
                      className="w-full px-3 py-2 border border-accent-2 rounded-lg text-left text-sm"
                    >
                      {textSettings.fontFamily}
                    </button>
                    {showFontDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-accent-2 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                        {fonts.map((font) => (
                          <button
                            key={font}
                            onClick={() => {
                              setTextSettings({ ...textSettings, fontFamily: font });
                              setShowFontDropdown(false);
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-left hover:bg-accent-1 transition-colors text-sm',
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

                  <div>
                    <label className="text-xs text-grey mb-1 block">Text Size</label>
                    <div className="flex items-center justify-between border border-accent-2 rounded-lg px-3 py-2">
                      <button
                        onClick={() => setTextSettings(prev => ({
                          ...prev,
                          fontSize: Math.max(12, prev.fontSize - 2)
                        }))}
                        className="hover:bg-accent-1 rounded transition-colors p-1"
                      >
                        <Minus className="w-4 h-4 text-primary" />
                      </button>
                      <span className="text-sm font-semibold text-primary">
                        {textSettings.fontSize}
                      </span>
                      <button
                        onClick={() => setTextSettings(prev => ({
                          ...prev,
                          fontSize: Math.min(72, prev.fontSize + 2)
                        }))}
                        className="hover:bg-accent-1 rounded transition-colors p-1"
                      >
                        <PlusIcon className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddText}
                    disabled={!textInput.trim()}
                    size="sm"
                    className="w-full"
                  >
                    Add Text
                  </Button>
                </div>
              </div>

              {/* Select Asset */}
              <div className="border-t border-accent-2 pt-6">
                <h3 className="text-primary font-semibold mb-3">Select an Asset</h3>
                <Button
                  onClick={() => setShowAssetModal(true)}
                  variant="outline"
                  size="sm"
                  className="w-full border-accent-2"
                >
                  Browse Assets
                </Button>
              </div>
            </div>
          </div>

          {/* Main Preview Area */}
          <div className="lg:w-3/4 space-y-6">
            <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 sm:gap-4">
                  <button
                    onClick={() => router.back()}
                    className="hover:bg-accent-1 rounded-lg transition-colors"
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
                      {/* Render Texts */}
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
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'text', text.id, text.x, text.y)}
                        >
                          {text.content}
                          <button
                            onClick={() => handleRemoveText(text.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <AiOutlineDelete className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Render Assets */}
                      {currentDesign?.assets.map((asset) => {
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
                              width: '80px',
                              height: '80px',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'asset', asset.id, asset.x, asset.y)}
                          >
                            <Image
                              src={assetSrc}
                              alt="Asset"
                              fill
                              className="object-contain"
                            />
                            <button
                              onClick={() => handleRemoveAsset(asset.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                            >
                              <AiOutlineDelete className="w-4 h-4" />
                            </button>
                            {selectedAssetForScale === asset.id && (
                              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1 z-10">
                                <button
                                  onClick={() => handleAssetScale(asset.id, -0.2)}
                                  className="p-1 hover:bg-accent-1 rounded"
                                  title="Make smaller"
                                >
                                  <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAssetScale(asset.id, 0.2)}
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
        </div>
      </div>

      {/* Asset Selection Modal */}
      <AssetSelectorModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        onSelectAsset={handleAssetSelected}
      />
    </>
  );
}