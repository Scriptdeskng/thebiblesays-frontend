'use client';

import { use, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Undo,
  RotateCcw,
  Type,
  Sticker,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MerchType, PlacementZone, CustomText, CustomSticker, BYOMCustomization } from '@/types/byom.types';
import { cn } from '@/utils/cn';
import { Size } from "@/types/product.types"

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
  name: `Sticker ${i + 1}`
}));

const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS'];

export default function CustomizePage({ params }: { params: Promise<{ type: MerchType }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'text' | 'sticker'>('text');
  const [selectedColor, setSelectedColor] = useState(colors[0].hex);
  const [selectedColorName, setSelectedColorName] = useState(colors[0].name.toLowerCase());
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [placement, setPlacement] = useState<PlacementZone>('front');

  const [customization, setCustomization] = useState<BYOMCustomization>({
    merchType: resolvedParams.type,
    color: colors[0].hex,
    colorName: colors[0].name.toLowerCase(),
    size: 'M',
    front: { texts: [], stickers: [] },
    back: { texts: [], stickers: [] },
  });

  const [history, setHistory] = useState<BYOMCustomization[]>([customization]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [textInput, setTextInput] = useState('');
  const [textSettings, setTextSettings] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    bold: false,
    italic: false,
    underline: false,
    alignment: 'center' as 'left' | 'center' | 'right',
    color: '#FFFFFF',
  });

  const [draggedItem, setDraggedItem] = useState<{ type: 'text' | 'sticker', id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
      merchType: resolvedParams.type,
      color: selectedColor,
      colorName: selectedColorName,
      size: selectedSize,
      front: { texts: [], stickers: [] },
      back: { texts: [], stickers: [] },
    };
    addToHistory(resetState);
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;

    const newText: CustomText = {
      id: `text-${Date.now()}`,
      content: textInput,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      bold: textSettings.bold,
      italic: textSettings.italic,
      underline: textSettings.underline,
      alignment: textSettings.alignment,
      color: textSettings.color,
      x: 50,
      y: 50,
    };

    const newState = { ...customization };
    newState[placement]!.texts.push(newText);
    addToHistory(newState);
    setTextInput('');
  }

  const handleAddSticker = (stickerId: string) => {
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
      addToHistory(customization);
      setDraggedItem(null);
    }
  };

  const handleNext = () => {
    localStorage.setItem('byom-customization', JSON.stringify(customization));
    router.push(`/byom/preview/${resolvedParams.type}`);
  };

  const currentDesign = customization[placement];
  const merchImageUrl = `/byom/${resolvedParams.type}-${selectedColorName}.png`;

  const livePreviewText = textInput.trim() ? (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: `${textSettings.fontSize}px`,
        fontFamily: textSettings.fontFamily,
        fontWeight: textSettings.bold ? 'bold' : 'normal',
        fontStyle: textSettings.italic ? 'italic' : 'normal',
        textDecoration: textSettings.underline ? 'underline' : 'none',
        textAlign: textSettings.alignment,
        color: textSettings.color,
        opacity: 0.6,
      }}
    >
      {textInput}
    </div>
  ) : null;

  return (
    <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Customize Your {resolvedParams.type}</h1>

      <div className="flex flex-col-reverse lg:flex-row gap-8">

        <div className="lg:w-1/4">
          <div className="bg-white border border-accent-2 rounded-lg p-6 space-y-8 lg:space-y-10">

            <div>
              <h3 className="text-primary mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleColorChange(color.hex, color.name)}
                    className={cn(
                      'w-7 h-7 rounded-full border transition-all',
                      selectedColor === color.hex ? 'border-primary scale-110' : 'border-accent-2'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-primary mb-2">Placement Zones</h3>
              <div className="flex flex-col gap-2">
                {(['front', 'back'] as PlacementZone[]).map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setPlacement(zone)}
                    className={cn(
                      'px-4 py-2 border-b text-left font-medium capitalize transition-colors',
                      placement === zone
                        ? 'border-primary text-primary'
                        : 'text-grey border-accent-1'
                    )}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-primary mb-2">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {(['S', 'M', 'L', 'XL', 'XXL'] as Size[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={cn(
                      'px-4 py-2 border rounded-md font-medium transition-all',
                      selectedSize === size
                        ? 'border-primary text-primary'
                        : 'border-accent-2 text-grey hover:border-primary'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('text')}
                  className={cn(
                    'flex-1 py-2 border px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2',
                    activeTab === 'text' ? 'border-primary text-primary' : 'border-accent-1 text-grey'
                  )}
                >
                  <Type className="w-4 h-4" />
                  Text
                </button>
                <button
                  onClick={() => setActiveTab('sticker')}
                  className={cn(
                    'flex-1 py-2 px-4 border rounded-md font-medium transition-colors flex items-center justify-center gap-2',
                    activeTab === 'sticker' ? 'border-primary text-primary' : 'border-accent-1 text-grey'
                  )}
                >
                  <Sticker className="w-4 h-4" />
                  Stickers
                </button>
              </div>

              {activeTab === 'text' ? (
                <div className="space-y-6">
                  <Input
                    placeholder="Enter your text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />

                  <div>
                    <h4 className="text-primary mb-2">Text Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => setTextSettings({ ...textSettings, color: color.hex })}
                          className={cn(
                            'w-5 h-5 border transition-all',
                            textSettings.color === color.hex ? 'border-primary scale-110' : 'border-accent-2'
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTextSettings({ ...textSettings, bold: !textSettings.bold })}
                      className={cn(
                        'p-2 border rounded-md',
                        textSettings.bold ? 'border-primary text-primary' : 'border-accent-2'
                      )}
                    >
                      <Bold className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setTextSettings({ ...textSettings, italic: !textSettings.italic })}
                      className={cn(
                        'p-2 border rounded-md',
                        textSettings.italic ? 'border-primary text-primary' : 'border-accent-2'
                      )}
                    >
                      <Italic className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setTextSettings({ ...textSettings, underline: !textSettings.underline })}
                      className={cn(
                        'p-2 border rounded-md',
                        textSettings.underline ? 'border-primary text-primary' : 'border-accent-2'
                      )}
                    >
                      <Underline className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  <select
                    value={textSettings.fontFamily}
                    onChange={(e) => setTextSettings({ ...textSettings, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-accent-2 rounded-md focus:outline-none"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>

                  <div>
                    <label className="text-sm text-grey mb-1 block">Font Size: {textSettings.fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={textSettings.fontSize}
                      onChange={(e) => setTextSettings({ ...textSettings, fontSize: parseInt(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setTextSettings({ ...textSettings, alignment: 'left' })}
                      className={cn(
                        'flex-1 p-2 border rounded-md',
                        textSettings.alignment === 'left' ? 'border-primary text-primary' : 'border-accent-2 text-grey'
                      )}
                    >
                      <AlignLeft className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setTextSettings({ ...textSettings, alignment: 'center' })}
                      className={cn(
                        'flex-1 p-2 border rounded-md',
                        textSettings.alignment === 'center' ? 'border-primary text-primary' : 'border-accent-2 text-grey'
                      )}
                    >
                      <AlignCenter className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setTextSettings({ ...textSettings, alignment: 'right' })}
                      className={cn(
                        'flex-1 p-2 border rounded-md',
                        textSettings.alignment === 'right' ? 'border-primary text-primary' : 'border-accent-2 text-grey'
                      )}
                    >
                      <AlignRight className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  <Button onClick={handleAddText} className="w-full" leftIcon={<Plus className="w-4 h-4" />}>
                    Add Text
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {stickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => handleAddSticker(sticker.id)}
                      className="aspect-square border-2 border-accent-2 rounded-lg hover:border-grey transition-colors p-2"
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
              )}
            </div>

            <Button onClick={handleNext} className="w-full">
              Next: Preview
            </Button>
          </div>
        </div>

        <div className="lg:w-3/4">
          <div className="bg-white border border-accent-1 rounded-lg p-2 sm:p-6">
            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={handleUndo}
                variant="outline"
                size="sm"
                disabled={historyIndex === 0}
                leftIcon={<Undo className="w-4 h-4 pr-1" />}
                className='border-accent-1 text-grey'
              >
                Undo
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4 pr-1" />}
                className='border-accent-2 text-grey'
              >
                Reset
              </Button>
            </div>

            <div
              ref={previewRef}
              className="relative w-full max-w-2xl mx-auto aspect-square bg-accent-1 rounded-lg overflow-hidden"
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

                  <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-16">
                    {livePreviewText}

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
                          textDecoration: text.underline ? 'underline' : 'none',
                          textAlign: text.alignment,
                          color: text.color || '#FFFFFF',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'text', text.id, text.x, text.y)}
                      >
                        {text.content}
                        <button
                          onClick={() => handleRemoveText(text.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
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
                          src={stickers.find(s => s.id === sticker.stickerId)?.url || ''}
                          alt="Sticker"
                          fill
                          className="object-contain"
                        />
                        <button
                          onClick={() => handleRemoveSticker(sticker.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                        >
                          <Trash2 className="w-3 h-3" />
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
        </div>

      </div>
    </div>
  );
}