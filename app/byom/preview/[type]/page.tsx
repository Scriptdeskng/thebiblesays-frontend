'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, ShoppingCart, Save, Clock3, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BYOMCustomization, MerchType, PlacementZone } from '@/types/byom.types';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

const BASE_PRICES: Record<MerchType, number> = {
    tshirt: 15000,
    longsleeve: 20000,
    hoodie: 35000,
    trouser: 28000,
    short: 18000,
    hat: 8000,
};

const stickers = Array.from({ length: 13 }, (_, i) => ({
    id: `sticker-${i + 1}`,
    url: `/stickers/sticker-${i + 1}.png`,
    name: `Sticker ${i + 1}`
}));

export default function PreviewPage({ params }: { params: Promise<{ type: MerchType }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);
    const [customization, setCustomization] = useState<BYOMCustomization | null>(null);
    const [currentView, setCurrentView] = useState<PlacementZone>('front');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('byom-customization');
        if (stored) {
            setCustomization(JSON.parse(stored));
        } else {
            router.push('/byom');
        }
    }, [router]);

    if (!customization) {
        return (
            <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
                <p className="text-grey">Loading...</p>
            </div>
        );
    }

    const basePrice = BASE_PRICES[resolvedParams.type];
    const textCount = customization.front.texts.length + customization.back.texts.length;
    const stickerCount = customization.front.stickers.length + customization.back.stickers.length;
    const customizationCost = (textCount * 1000) + (stickerCount * 500);
    const total = basePrice + customizationCost;

    const currentDesign = customization[currentView];
    const merchImageUrl = `/byom/${resolvedParams.type}-${customization.colorName || 'black'}.png`;

    const handleAddToCart = () => {
        const byomProduct = {
            id: `byom-${Date.now()}`,
            name: `Custom ${resolvedParams.type}`,
            price: total,
            images: [{ url: merchImageUrl, color: 'Custom', alt: `Custom ${resolvedParams.type}` }],
            colors: [{ name: 'Custom', hex: customization.color }],
            sizes: [customization.size],
            category: 'Shirts' as const,
            inStock: true,
            description: `Custom ${resolvedParams.type} with personalized design`,
            features: ['Custom design', 'Premium quality'],
            rating: 5,
            reviewCount: 0,
        };

        addItem({
            productId: byomProduct.id,
            product: byomProduct,
            quantity: 1,
            color: 'Custom',
            size: customization.size,
            customization: customization,
        });

        localStorage.removeItem('byom-customization');
        router.push('/cart');
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-grey hover:text-primary font-medium"
                >
                    ← Back to Customization
                </button>
            </div>

            <h1 className="text-2xl font-bold text-primary mb-8">Preview Your Design</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6">
                        <div className="flex gap-2 mb-4 justify-center">
                            {(['front', 'back'] as PlacementZone[]).map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setCurrentView(view)}
                                    className={cn(
                                        'px-6 py-2 border rounded-md font-medium capitalize transition-colors',
                                        currentView === view
                                            ? 'border-primary text-primary'
                                            : 'border-accent-1 text-grey'
                                    )}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>

                        <div className="relative max-w-2xl mx-auto aspect-square bg-accent-1 rounded-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-12">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={merchImageUrl}
                                        alt={resolvedParams.type}
                                        fill
                                        className="object-contain"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-16">
                                        {currentDesign?.texts.map((text) => (
                                            <div
                                                key={text.id}
                                                className="absolute"
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
                                            >
                                                {text.content}
                                            </div>
                                        ))}

                                        {currentDesign?.stickers.map((sticker) => (
                                            <div
                                                key={sticker.id}
                                                className="absolute"
                                                style={{
                                                    left: `${sticker.x}%`,
                                                    top: `${sticker.y}%`,
                                                    transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                                                    width: '80px',
                                                    height: '80px',
                                                }}
                                            >
                                                <Image
                                                    src={stickers.find(s => s.id === sticker.stickerId)?.url || ''}
                                                    alt="Sticker"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6 sticky top-4">
                        <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-primary">Base Price</span>
                                <span className="font-semibold text-primary">{formatPrice(basePrice)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-primary">Size</span>
                                <span className="font-semibold text-primary">{customization.size}</span>
                            </div>

                            <div className="border-t border-accent-2 pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-grey text-sm">Text Elements ({textCount})</span>
                                    <span className="text-sm text-grey">{formatPrice(textCount * 1000)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-grey text-sm">Stickers ({stickerCount})</span>
                                    <span className="text-sm text-grey">{formatPrice(stickerCount * 500)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-primary">Customization</span>
                                    <span className="text-primary">{formatPrice(customizationCost)}</span>
                                </div>
                            </div>

                            <div className="border-t border-accent-2 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-primary">Total</span>
                                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <Button
                                onClick={handleAddToCart}
                                size="lg"
                                className="w-full"
                                leftIcon={<ShoppingCart className="w-5 h-5" />}
                            >
                                Add to Cart
                            </Button>
                        </div>

                        <div className="bg-accent-1 rounded-lg p-2 sm:p-4 space-y-2 text-sm flex flex-col sm:flex-row gap-5 justify-between">
                            <div className="flex flex-row items-center gap-4">
                                <div><Clock3 /></div>
                                <div className='flex flex-col gap-2'>
                                    <span className="text-grey">Production Time</span>
                                    <span className="font-medium text-primary">3-5 business days</span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <div><Truck /></div>
                                <div className='flex flex-col gap-2'>
                                    <span className="text-grey">Delivery</span>
                                    <span className="font-medium text-primary">5-7 business days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}