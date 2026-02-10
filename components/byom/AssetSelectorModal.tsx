'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Asset } from '@/types/byom.types';
import { byomService } from '@/services/byom.service';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: Asset) => void;
}

export const AssetSelectorModal = ({ isOpen, onClose, onSelectAsset }: AssetSelectorModalProps) => {
  const { getCurrencyParam } = useCurrencyStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const currencyParam = getCurrencyParam();
      const data = await byomService.getAssets(currencyParam);
      setAssets(data);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelectAsset(selectedAsset);
      setSelectedAsset(null);
      onClose();
    } else {
      toast.error('Please select an asset first');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-accent-2 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-primary">Select an Asset</h2>
            <p className="text-sm text-grey">Choose from our collection of designs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-accent-1 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-grey text-lg">No assets available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "group relative aspect-square border-2 rounded-lg overflow-hidden transition-all",
                    selectedAsset?.id === asset.id
                      ? 'border-primary bg-primary/5'
                      : 'border-accent-2 hover:border-accent-1'
                  )}
                >
                  <div className="relative w-full h-full p-4">
                    <Image
                      src={asset.image_url || asset.image}
                      alt={asset.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {selectedAsset?.id === asset.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs text-center truncate">{asset.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-accent-2 px-6 py-4 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAsset}
            className="flex-1"
          >
            Add to Design
          </Button>
        </div>
      </div>
    </div>
  );
};