'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { cmsService, FAQ } from '@/services/cms.service';

interface FAQWithCategory extends FAQ {
    category: string;
}

const fallbackFaqs: FAQWithCategory[] = [
    {
        id: 1,
        category: 'Orders & Shipping',
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 5-7 business days within Nigeria. For custom BYOM orders, please allow an additional 3-5 business days for production before shipping. Express shipping options are available at checkout for faster delivery.'
    },
    {
        id: 2,
        category: 'Orders & Shipping',
        question: 'Do you ship internationally?',
        answer: 'Yes, we deliver internationally. We ship to countries outside Nigeria, and delivery timelines and fees may vary based on your location. Shipping costs will be calculated at checkout. If you need help confirming delivery to your country, feel free to contact our support team.'
    },
];

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQWithCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        const fetchFAQs = async () => {
            setLoading(true);
            try {
                const data = await cmsService.getAllFAQs();
                
                if (data.length > 0) {
                    const faqsWithCategory = data.map((faq) => ({
                        ...faq,
                        category: faq.category || 'General'
                    }));
                    setFaqs(faqsWithCategory);
                } else {
                    setFaqs(fallbackFaqs);
                }
            } catch (error) {
                console.error('Failed to fetch FAQs:', error);
                setFaqs(fallbackFaqs);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    const categories = Array.from(new Set(faqs.map(faq => faq.category)));

    const filteredFaqs = selectedCategory === 'All'
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory);

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-5 sm:px-10 py-12">
                <div className="text-center mb-10 flex items-center justify-center gap-2">
                    <span>HOME </span>
                    <span><ChevronRight /></span>
                    <span className='text-grey'>FAQS</span>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-5 sm:px-10 py-12">
            <div className="text-center mb-10 flex items-center justify-center gap-2">
                <span>HOME </span>
                <span><ChevronRight /></span>
                <span className='text-grey'>FAQS</span>
            </div>

            {categories.length > 0 && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={cn(
                                'px-4 py-2 rounded-full font-medium transition-colors',
                                selectedCategory === 'All'
                                    ? 'bg-primary text-white'
                                    : 'bg-accent-1 text-grey hover:bg-accent-2'
                            )}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={cn(
                                    'px-4 py-2 rounded-full font-medium transition-colors',
                                    selectedCategory === category
                                        ? 'bg-primary text-white'
                                        : 'bg-accent-1 text-grey hover:bg-accent-2'
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-grey text-lg">No FAQs found.</p>
                    </div>
                ) : (
                    filteredFaqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="bg-white border border-accent-2 rounded-lg overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => toggleFAQ(faq.id)}
                                className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-accent-1 transition-colors"
                            >
                                <div className="flex-1 pr-4">
                                    {faq.category && (
                                        <span className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1 block">
                                            {faq.category}
                                        </span>
                                    )}
                                    <h3 className="text-lg font-semibold text-primary">
                                        {faq.question}
                                    </h3>
                                </div>
                                <div className="shrink-0">
                                    {openId === faq.id ? (
                                        <ChevronUp className="w-6 h-6 text-primary" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-grey" />
                                    )}
                                </div>
                            </button>

                            <div
                                className={cn(
                                    'overflow-hidden transition-all duration-300 ease-in-out',
                                    openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                )}
                            >
                                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
                                    <p className="text-grey leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-12 bg-accent-1 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-primary mb-3">Still have questions?</h2>
                <p className="text-grey mb-6">
                    Can't find the answer you're looking for? Please reach out to our friendly team.
                </p>
                <a href="/contact">
                    <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Contact Support
                    </button>
                </a>
            </div>
        </div>
    );
}