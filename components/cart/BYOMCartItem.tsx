'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem } from '@/types/product.types';
import { formatPrice } from '@/utils/format';

const stickers = Array.from({ length: 13 }, (_, i) => ({
  id: `sticker-${i + 1}`,
  url: `/stickers/sticker-${i + 1}.png`,
  name: `Sticker ${i + 1}`
}));

interface BYOMCartItemProps {
  item: CartItem;
  compact?: boolean;
}

export const BYOMCartItem = ({ item, compact = false }: BYOMCartItemProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const customization = item.customization;

  if (!customization) return null;

  const textCount = customization.front.texts.length + customization.back.texts.length;
  const stickerCount = customization.front.stickers.length + customization.back.stickers.length;

  return (
    <div className="bg-accent-1 rounded-lg p-4 mt-3">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-primary mb-1">Custom Design Details</p>
          <p className="text-xs text-grey">
            {textCount} text element(s), {stickerCount} sticker(s)
          </p>
        </div>
        {showDetails ? (
          <ChevronUp className="w-5 h-5 text-grey" />
        ) : (
          <ChevronDown className="w-5 h-5 text-grey" />
        )}
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4 border-t border-accent-2 pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-grey mb-1">Merch Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-accent-2"
                  style={{ backgroundColor: customization.color }}
                />
                <span className="text-primary font-medium capitalize">{customization.colorName || 'Custom'}</span>
              </div>
            </div>
            <div>
              <p className="text-grey mb-1">Size</p>
              <p className="text-primary font-medium">{customization.size}</p>
            </div>
          </div>

          {customization.front.texts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Front - Text Elements:</p>
              <div className="space-y-2">
                {customization.front.texts.map((text) => (
                  <div key={text.id} className="bg-white rounded p-2 text-xs">
                    <p className="font-medium text-primary mb-1">
                      "{text.content}"
                    </p>
                    <div className="flex flex-wrap gap-2 text-grey">
                      <span>Font: {text.fontFamily}</span>
                      <span>Size: {text.fontSize}px</span>
                      {text.bold && <span className="font-bold">Bold</span>}
                      {text.italic && <span className="italic">Italic</span>}
                      {text.underline && <span className="underline">Underline</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customization.front.stickers.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Front - Stickers:</p>
              <div className="flex flex-wrap gap-2">
                {customization.front.stickers.map((sticker) => (
                  <div key={sticker.id} className="w-12 h-12 bg-white rounded border border-accent-2 p-1">
                    <div className="relative w-full h-full">
                      <Image
                        src={stickers.find(s => s.id === sticker.stickerId)?.url || ''}
                        alt="Sticker"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customization.back.texts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Back - Text Elements:</p>
              <div className="space-y-2">
                {customization.back.texts.map((text) => (
                  <div key={text.id} className="bg-white rounded p-2 text-xs">
                    <p className="font-medium text-primary mb-1" style={{ color: text.color }}>
                      "{text.content}"
                    </p>
                    <div className="flex flex-wrap gap-2 text-grey">
                      <span>Font: {text.fontFamily}</span>
                      <span>Size: {text.fontSize}px</span>
                      {text.bold && <span className="font-bold">Bold</span>}
                      {text.italic && <span className="italic">Italic</span>}
                      {text.underline && <span className="underline">Underline</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customization.back.stickers.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Back - Stickers:</p>
              <div className="flex flex-wrap gap-2">
                {customization.back.stickers.map((sticker) => (
                  <div key={sticker.id} className="w-12 h-12 bg-white rounded border border-accent-2 p-1">
                    <div className="relative w-full h-full">
                      <Image
                        src={stickers.find(s => s.id === sticker.stickerId)?.url || ''}
                        alt="Sticker"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-accent-2 pt-3 text-xs text-grey">
            <p>💡 This is a custom-made item. Production time: 3-5 business days</p>
          </div>
        </div>
      )}
    </div>
  );
};