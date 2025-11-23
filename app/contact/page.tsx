'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const messageTypes = [
    'Order Issue',
    'Product Question',
    'Collaboration',
    'Support',
    'Others'
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        messageType: '',
        message: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.messageType) newErrors.messageType = 'Please select a message type';
        if (!formData.message.trim()) newErrors.message = 'Message is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        setSuccess(true);
        setFormData({ fullName: '', email: '', messageType: '', message: '' });
        setIsSubmitting(false);

        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-8">
            <div className="text-center mb-10 flex items-center justify-center gap-2">
                <span>HOME </span>
                <span><ChevronRight /></span>
                <span className='text-grey '>CONTACT US</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
                <div className="bg-white border border-accent-2 rounded-lg p-8 w-full lg:w-3/12">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-primary mb-1">Email</h3>
                            <a href="mailto:support@thebiblesays.com" className="text-[#115A99]">
                                hello@thebiblesays.com
                            </a>
                            <p className='text-[#616161] mt-1'>Reach out for orders, collabs, or general inquiries</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-primary mb-1">Phone</h3>
                            <a href="tel:+2348105551290" className="text-[#115A99]">
                                +234 810 555 1290
                            </a>
                            <p className='text-[#616161] mt-1'>Available Mon–Fri, 9am–5pm</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-primary mb-1">Address</h3>
                            <p className="text-primary">
                                No. 12 Grace Avenue, Lekki Phase 1,<br />
                                Lagos, Nigeria
                            </p>
                            <p className='text-[#616161] mt-1'>Visit our studio for pickups, fittings, or to explore new drops in person</p>
                        </div>

                    </div>
                </div>

                <div className="bg-white border border-accent-2 rounded-lg p-8 w-full lg:w-3/4">
                    <h2 className="text-2xl font-bold text-primary mb-6">Send us a Message</h2>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-medium">Thank you! Your message has been sent successfully.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={errors.fullName}
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />

                        <div>
                            <label className="block text-sm font-medium text-grey mb-1.5">
                                Message Type
                            </label>
                            <select
                                name="messageType"
                                value={formData.messageType}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none transition-colors ${errors.messageType ? 'border-red-500' : 'border-accent-2'
                                    }`}
                            >
                                <option value="">Select a type</option>
                                {messageTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.messageType && (
                                <p className="mt-1 text-sm text-red-500">{errors.messageType}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-grey mb-1.5">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none resize-none transition-colors ${errors.message ? 'border-red-500' : 'border-accent-2'
                                    }`}
                                placeholder="Tell us how we can help you..."
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </div>
            </div>

            <div className="bg-white border border-accent-2 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Find Us Here</h2>
                <div className="w-full h-[400px] rounded-lg overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.617752872712!2d3.4657827758930897!3d6.443103193548185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf452309858f5%3A0xa232676033886bba!2s12%20Grace%20Anjous%20Dr%2C%20Lekki%20Phase%20I%2C%20Lekki%20106104%2C%20Lagos!5e0!3m2!1sen!2sng!4v1763926856016!5m2!1sen!2sng"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Store Location"
                    />
                </div>
                <p className="text-sm text-grey mt-4 text-center">
                    Visit our store at No. 12 Grace Avenue, Lekki Phase 1, Lagos, Nigeria
                </p>
            </div>
        </div>
    );
}