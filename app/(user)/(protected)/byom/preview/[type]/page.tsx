'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Clock3, Truck, AlertCircle, Save, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BYOMCustomization, MerchType, PlacementZone } from '@/types/byom.types';
import { useAuthStore } from '@/store/useAuthStore';
import { byomService } from '@/services/byom.service';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

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
    name: `Sticker ${i + 1}`,
    isCustom: false
}));

export default function PreviewPage({ params }: { params: Promise<{ type: MerchType }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { accessToken, user } = useAuthStore();
    const [customization, setCustomization] = useState<BYOMCustomization & {
        uploadedImages?: any[],
        requiresApproval?: boolean
    } | null>(null);
    const [currentView, setCurrentView] = useState<PlacementZone>('front');
    const [uploadedImages, setUploadedImages] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [draggedItem, setDraggedItem] = useState<{ type: 'text' | 'sticker', id: string } | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [submitStatus, setSubmitStatus] = useState<'uploading' | 'processing' | 'success' | 'error'>('uploading');
    const [submitError, setSubmitError] = useState<string>('');

    useEffect(() => {
        const stored = localStorage.getItem('byom-customization');
        if (stored) {
            const parsedData = JSON.parse(stored);

            const normalizedData = {
                ...parsedData,
                front: parsedData.front || { texts: [], stickers: [] },
                back: parsedData.back || { texts: [], stickers: [] },
                side: parsedData.side || { texts: [], stickers: [] },
                requiresApproval: true
            };

            setCustomization(normalizedData);

            if (typeof window !== 'undefined' && (window as any).__byom_uploaded_images) {
                const images = (window as any).__byom_uploaded_images;
                setUploadedImages(images);

                delete (window as any).__byom_uploaded_images;
            }
            else {
                const storedMetadata = sessionStorage.getItem('byom-image-metadata');
                if (storedMetadata) {
                    try {

                        const metadata = JSON.parse(storedMetadata);
                        console.warn('Image files were lost. User may need to go back and re-upload.');
                    } catch (error) {
                        console.error('Failed to parse image metadata:', error);
                    }
                }
            }
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
    const textCount = (customization.front?.texts?.length || 0) +
        (customization.back?.texts?.length || 0) +
        (customization.side?.texts?.length || 0);
    const stickerCount = (customization.front?.stickers?.length || 0) +
        (customization.back?.stickers?.length || 0) +
        (customization.side?.stickers?.length || 0);
    const customizationCost = (textCount * 1000) + (stickerCount * 500);
    const total = basePrice + customizationCost;

    const currentDesign = customization[currentView] || { texts: [], stickers: [] };
    const merchImageUrl = `/byom/${resolvedParams.type}-${customization.colorName || 'black'}.svg`;

    const getStickerSource = (stickerId: string) => {
        const uploadedImage = uploadedImages.find(img => img.id === stickerId);
        if (uploadedImage) return uploadedImage.url;

        const defaultSticker = stickers.find(s => s.id === stickerId);
        return defaultSticker?.url || '';
    };

    const getTextDecoration = (text: any) => {
        const decorations = [];
        if (text.underline) decorations.push('underline');
        if (text.strikethrough) decorations.push('line-through');
        return decorations.join(' ') || 'none';
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
        if (!draggedItem || !previewRef.current || !customization) return;

        const rect = previewRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100 - dragOffset.x));
        const y = Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100 - dragOffset.y));

        const newState = { ...customization };
        if (draggedItem.type === 'text') {
            const textIndex = newState[currentView]!.texts.findIndex(t => t.id === draggedItem.id);
            if (textIndex !== -1) {
                newState[currentView]!.texts[textIndex].x = x;
                newState[currentView]!.texts[textIndex].y = y;
            }
        } else {
            const stickerIndex = newState[currentView]!.stickers.findIndex(s => s.id === draggedItem.id);
            if (stickerIndex !== -1) {
                newState[currentView]!.stickers[stickerIndex].x = x;
                newState[currentView]!.stickers[stickerIndex].y = y;
            }
        }
        setCustomization(newState);
    };

    const handleMouseUp = () => {
        if (draggedItem && customization) {
            const customizationData = {
                ...customization,
                uploadedImages: uploadedImages,
                requiresApproval: true
            };
            localStorage.setItem('byom-customization', JSON.stringify(customizationData));
            setDraggedItem(null);
        }
    };

    const handleStickerScale = (stickerId: string, delta: number) => {
        if (!customization) return;

        const newState = { ...customization };
        const stickerIndex = newState[currentView]!.stickers.findIndex(s => s.id === stickerId);
        if (stickerIndex !== -1) {
            const currentScale = newState[currentView]!.stickers[stickerIndex].scale;
            newState[currentView]!.stickers[stickerIndex].scale = Math.max(0.5, Math.min(3, currentScale + delta));
            setCustomization(newState);

            const customizationData = {
                ...newState,
                uploadedImages: uploadedImages,
                requiresApproval: true
            };
            localStorage.setItem('byom-customization', JSON.stringify(customizationData));
        }
    };

    const handleSubmitForApproval = async () => {
        if (!accessToken || !user) {
            toast.error('Please login to continue');
            router.push(`/login?redirect=/byom/preview/${resolvedParams.type}`);
            return;
        }

        const hasText = (customization.front?.texts?.length || 0) > 0 ||
            (customization.back?.texts?.length || 0) > 0 ||
            (customization.side?.texts?.length || 0) > 0;

        const hasStickers = (customization.front?.stickers?.length || 0) > 0 ||
            (customization.back?.stickers?.length || 0) > 0 ||
            (customization.side?.stickers?.length || 0) > 0;

        if (!hasText && !hasStickers) {
            toast.error('Please add some customization (text, stickers, or images) to your design');
            return;
        }

        const uploadedFiles: File[] = [];
        if (uploadedImages && uploadedImages.length > 0) {

            for (let index = 0; index < uploadedImages.length; index++) {
                const image = uploadedImages[index];

                if (image.file instanceof File) {
                    uploadedFiles.push(image.file);
                } else if (image.url && image.url.startsWith('data:')) {
                    try {
                        const file = byomService['base64ToFile'](image.url, image.name || `custom-image-${index + 1}.png`);
                        uploadedFiles.push(file);
                    } catch (error) {
                        console.error(`❌ Failed to reconstruct file ${index + 1}:`, error);
                    }
                } else {
                    console.warn(`⚠️ Image ${index + 1} has no valid File object or base64 data`);
                }
            }
        }

        if (uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                if (file.size > 10 * 1024 * 1024) {
                    toast.error('One or more images exceed 10MB. Please use smaller images.');
                    return;
                }
            }
        } else if (uploadedImages && uploadedImages.length > 0) {
            console.warn('⚠️ Had uploaded images but could not extract any valid files');
            toast.error('Failed to process uploaded images. Please try uploading again.');
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);
        setShowSubmitModal(true);
        setSubmitProgress(0);
        setSubmitStatus('uploading');
        setSubmitError('');

        try {
            const payload = byomService.prepareDesignPayload(customization);
            const hasCustomImages = uploadedFiles.length > 0;

            setSubmitProgress(20);
            const savedDesign = await byomService.createDesign(
                accessToken,
                payload,
                uploadedFiles.length > 0 ? uploadedFiles : undefined
            );

            setSubmitProgress(70);

            setSubmitStatus('processing');
            setSubmitProgress(80);
            await byomService.submitForApproval(accessToken, savedDesign.id);

            setSubmitProgress(100);
            setSubmitStatus('success');

            await new Promise(resolve => setTimeout(resolve, 1000));

            localStorage.removeItem('byom-customization');
            sessionStorage.removeItem('byom-uploaded-images');
            router.push('/profile?tab=drafts');
        } catch (error: any) {
            console.error('❌ Error submitting design:', error);
            console.error('Error response:', error?.response?.data);

            const errorData = error?.response?.data;
            let errorMessage = 'Failed to submit design. Please try again.';

            if (error?.message?.includes('already submitted for approval')) {
                errorMessage = 'This design has already been submitted. Check your Drafts section.';
            } else if (errorData?.error) {
                errorMessage = errorData.error;
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.detail) {
                errorMessage = errorData.detail;
            } else if (typeof errorData === 'object' && errorData !== null) {
                const errors = Object.entries(errorData)
                    .map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return `${key}: ${value.join(', ')}`;
                        }
                        return `${key}: ${value}`;
                    })
                    .join('; ');
                if (errors) errorMessage = errors;
            }

            setSubmitStatus('error');
            setSubmitError(errorMessage);
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-accent-1 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-primary" />
                </button>
                <h1 className="text-2xl font-bold text-primary">Preview Your Design</h1>
            </div>

            <div className="mb-6 bg-secondary border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary/80 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-primary mb-1">
                        Approval Required
                    </p>
                    <p className="text-sm text-primary/90">
                        All custom designs require approval before production. Your design will be reviewed within 1-2 business days.
                        You can track the approval status in your profile under the Drafts section.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white border border-accent-2 rounded-lg p-2 sm:p-6">
                        <div className="flex gap-2 mb-4 justify-center flex-wrap">
                            {(['front', 'back', 'side'] as PlacementZone[]).map((view) => {
                                const design = customization[view] || { texts: [], stickers: [] };
                                const hasContent = design.texts.length > 0 || design.stickers.length > 0;

                                return (
                                    <button
                                        key={view}
                                        onClick={() => setCurrentView(view)}
                                        className={cn(
                                            'px-6 py-2 border rounded-md font-medium capitalize transition-colors relative',
                                            currentView === view
                                                ? 'border-primary text-primary'
                                                : 'border-accent-1 text-grey'
                                        )}
                                    >
                                        {view}
                                        {hasContent && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative max-w-2xl mx-auto aspect-square bg-accent-1 rounded-lg overflow-hidden">
                            <div
                                ref={previewRef}
                                className="absolute inset-0 flex items-center justify-center p-2 sm:p-12"
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <div className="relative w-full h-full">
                                    <Image
                                        src={merchImageUrl}
                                        alt={resolvedParams.type}
                                        fill
                                        className="object-contain"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-16">
                                        {currentDesign.texts && currentDesign.texts.map((text) => (
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
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-grey/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Drag to reposition
                                                </div>
                                            </div>
                                        ))}

                                        {currentDesign.stickers && currentDesign.stickers.map((sticker) => (
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
                                    <span className="text-lg font-semibold text-primary">Estimated Total</span>
                                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                                </div>
                                <p className="text-xs text-grey mt-1">Final price confirmed after approval</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <Button
                                onClick={handleSubmitForApproval}
                                size="lg"
                                className="w-full"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Submitting...' : 'Submit for Approval'}
                            </Button>
                            <p className="text-xs text-center text-grey">
                                You'll be notified once your design is approved
                            </p>
                        </div>

                        <div className="bg-accent-1 rounded-lg p-2 sm:p-4 space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Clock3 className="w-5 h-5 text-grey shrink-0 mt-0.5" />
                                <div className='flex flex-col gap-1'>
                                    <span className="font-semibold text-primary">Timeline</span>
                                    <span className="text-grey">1-2 days approval + 3-5 days production</span>
                                </div>
                            </div>
                        </div>

                        {uploadedImages && uploadedImages.length > 0 && (
                            <div className="mt-4 border-t border-accent-2 pt-4">
                                <h3 className="text-sm font-semibold text-primary mb-2">Custom Uploads</h3>
                                <div className="flex flex-wrap gap-2">
                                    {uploadedImages.map((image) => (
                                        <div key={image.id} className="relative w-12 h-12 border-2 border-primary/70 rounded-lg overflow-hidden">
                                            <Image
                                                src={image.url}
                                                alt={image.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <div className="text-center">
                            {submitStatus === 'uploading' && (
                                <>
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Uploading Merch...</h3>
                                    <p className="text-grey mb-6">Please wait while we upload your custom merch</p>
                                </>
                            )}

                            {submitStatus === 'processing' && (
                                <>
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Processing...</h3>
                                    <p className="text-grey mb-6">Submitting your design for approval</p>
                                </>
                            )}

                            {submitStatus === 'success' && (
                                <>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Success!</h3>
                                    <p className="text-grey mb-6">Your design has been submitted for approval</p>
                                </>
                            )}

                            {submitStatus === 'error' && (
                                <>
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Custom Merch Failed</h3>
                                    <p className="text-grey mb-6">{submitError}</p>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => {
                                                setShowSubmitModal(false);
                                                setSubmitStatus('uploading');
                                                setSubmitError('');
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowSubmitModal(false);
                                                setSubmitStatus('uploading');
                                                setSubmitError('');
                                                setTimeout(() => handleSubmitForApproval(), 100);
                                            }}
                                            className="flex-1"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                </>
                            )}

                            {submitStatus !== 'error' && (
                                <>
                                    <div className="w-full bg-accent-2 rounded-full h-3 overflow-hidden mb-2">
                                        <div
                                            className="bg-primary h-full transition-all duration-500 ease-out"
                                            style={{ width: `${submitProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-grey">{submitProgress}% Complete</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}