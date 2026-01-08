'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQ[] = [
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
        answer: 'Currently, we only ship within Nigeria. However, we are working on expanding our shipping to other African countries. Subscribe to our newsletter to be notified when international shipping becomes available.'
    },
    {
        id: 3,
        category: 'Orders & Shipping',
        question: 'How can I track my order?',
        answer: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or through the courier\'s website. You can also check your order status in the "My Orders" section of your account.'
    },
    {
        id: 4,
        category: 'Products',
        question: 'What materials are your products made from?',
        answer: 'We use premium quality materials for all our products. Our t-shirts are made from 100% cotton, hoodies from cotton-polyester blends for comfort and durability, and caps from cotton twill. All materials are carefully selected to ensure comfort and longevity.'
    },
    {
        id: 5,
        category: 'Products',
        question: 'How do I choose the right size?',
        answer: 'Each product page includes a detailed size chart. We recommend measuring your favorite fitting garment and comparing it to our size chart. If you\'re between sizes, we suggest sizing up for a more comfortable fit. For custom BYOM orders, ensure you select the correct size as exchanges may be limited.'
    },
    {
        id: 6,
        category: 'Products',
        question: 'Are your products machine washable?',
        answer: 'Yes, all our products are machine washable. For best results and longevity, we recommend washing in cold water, turning garments inside out, and avoiding bleach. For custom printed items, air drying is recommended to preserve the print quality.'
    },
    {
        id: 7,
        category: 'BYOM (Build Your Own Merch)',
        question: 'What is BYOM?',
        answer: 'BYOM (Build Your Own Merch) is our custom merchandise creation service. You can design your own unique apparel by choosing the product type, color, adding custom text with various fonts and styles, and placing stickers. It\'s perfect for personal expression, events, or gifts!'
    },
    {
        id: 8,
        category: 'BYOM (Build Your Own Merch)',
        question: 'Can I see a preview of my custom design before ordering?',
        answer: 'Absolutely! Our BYOM tool provides a real-time preview of your design as you create it. You can see exactly how your custom text and stickers will appear on the front and back of your chosen product. You can also toggle between views before adding to cart.'
    },
    {
        id: 9,
        category: 'BYOM (Build Your Own Merch)',
        question: 'Can I cancel or modify my BYOM order after placing it?',
        answer: 'Due to the custom nature of BYOM orders, modifications are limited. Please contact our support team within 2 hours of placing your order if you need to make changes. Once production begins, we cannot make modifications or accept cancellations.'
    },
    {
        id: 10,
        category: 'Returns & Exchanges',
        question: 'What is your return policy?',
        answer: 'We offer a 14-day return policy for regular products in unworn, unwashed condition with original tags attached. Custom BYOM orders are non-returnable unless there is a manufacturing defect. Please contact our support team to initiate a return.'
    },
    {
        id: 11,
        category: 'Returns & Exchanges',
        question: 'How do I exchange an item?',
        answer: 'If you need to exchange an item for a different size or color, please contact our support team within 14 days of receiving your order. You\'ll need to return the original item (in unworn, unwashed condition) before we can ship the replacement. Exchange shipping costs may apply.'
    },
    {
        id: 12,
        category: 'Returns & Exchanges',
        question: 'What if my item is damaged or defective?',
        answer: 'We\'re sorry if you received a damaged or defective item! Please contact us within 7 days of delivery with photos of the issue. We\'ll arrange for a replacement or full refund at no additional cost to you. Quality is our priority!'
    },
    {
        id: 13,
        category: 'Payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, Mastercard, Verve), bank transfers, and mobile payment options including Paystack and Flutterwave. All transactions are secure and encrypted for your protection.'
    },
    {
        id: 14,
        category: 'Payment',
        question: 'Is my payment information secure?',
        answer: 'Yes! We use industry-standard encryption and secure payment gateways to protect your information. We never store your complete card details on our servers. All payment processing is handled by certified payment providers.'
    },
    {
        id: 15,
        category: 'Account',
        question: 'Do I need an account to make a purchase?',
        answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save your wishlist, store multiple shipping addresses, and access exclusive member benefits. It only takes a minute to sign up!'
    }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export default function FAQPage() {
    const [openId, setOpenId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const filteredFaqs = selectedCategory === 'All'
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory);

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="max-w-4xl mx-auto px-5 sm:px-10 py-12">
            <div className="text-center mb-10 flex items-center justify-center gap-2">
                <span>HOME </span>
                <span><ChevronRight /></span>
                <span className='text-grey '>FAQS</span>
            </div>

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

            <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                    <div
                        key={faq.id}
                        className="bg-white border border-accent-2 rounded-lg overflow-hidden transition-all"
                    >
                        <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-accent-1 transition-colors"
                        >
                            <div className="flex-1 pr-4">
                                <span className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1 block">
                                    {faq.category}
                                </span>
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
                ))}
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