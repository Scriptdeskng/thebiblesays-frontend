'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem } from '@/types/product.types';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { formatPrice } from '@/utils/format';

interface BYOMCartItemProps {
  item: CartItem;
  compact?: boolean;
}

export const BYOMCartItem = ({ item, compact = false }: BYOMCartItemProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { currency } = useCurrencyStore();
  const customization = item.customization;

  if (!customization) return null;

  const frontTextCount = customization.front?.texts?.length || 0;
  const frontStickerCount = customization.front?.stickers?.length || 0;
  const backTextCount = customization.back?.texts?.length || 0;
  const backStickerCount = customization.back?.stickers?.length || 0;
  const sideTextCount = customization.side?.texts?.length || 0;
  const sideStickerCount = customization.side?.stickers?.length || 0;

  const totalTexts = frontTextCount + backTextCount + sideTextCount;
  const totalStickers = frontStickerCount + backStickerCount + sideStickerCount;

  return (
    <div className="bg-accent-1 rounded-lg p-4 mt-3">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-primary mb-1">Custom Design Details</p>
          <p className="text-xs text-grey">
            {totalTexts} text element(s), {totalStickers} sticker(s)
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

          {frontTextCount > 0 && (
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

          {frontStickerCount > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">
                Front - {frontStickerCount} Sticker(s)
              </p>
            </div>
          )}

          {backTextCount > 0 && (
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

          {backStickerCount > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">
                Back - {backStickerCount} Sticker(s)
              </p>
            </div>
          )}

          {sideTextCount > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">Side - Text Elements:</p>
              <div className="space-y-2">
                {customization.side.texts.map((text) => (
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

          {sideStickerCount > 0 && (
            <div>
              <p className="text-sm font-semibold text-primary mb-2">
                Side - {sideStickerCount} Sticker(s)
              </p>
            </div>
          )}

          <div className="border-t border-accent-2 pt-3 text-xs text-grey">
            <p>This is a custom-made item. Production time: 3-5 business days</p>
          </div>
        </div>
      )}
    </div>
  );
};