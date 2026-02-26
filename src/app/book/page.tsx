'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { getServiceOptions } from '@/data/services';

interface FormData {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    notes: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    date?: string;
    time?: string;
}

// Time slots from 9am to 6pm
const timeSlots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '12:30', label: '12:30 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '13:30', label: '1:30 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '17:30', label: '5:30 PM' },
    { value: '18:00', label: '6:00 PM' },
];

export default function BookingPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        notes: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Format phone number as (xxx) xxx-xxxx
    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length !== 10) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.service) {
            newErrors.service = 'Please select a service';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        }

        if (!formData.time) {
            newErrors.time = 'Please select a time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    timestamp: new Date().toISOString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit booking');
            }

            setIsSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                service: '',
                date: '',
                time: '',
                notes: '',
            });
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'Something went wrong. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center animate-fade-in bg-[#0A0A0A] pt-20">
                <Card className="max-w-md text-center mx-4">
                    {/* Decorative bow */}
                    <div className="flex justify-center mb-4">
                        <svg width="50" height="30" viewBox="0 0 40 24" fill="#FF1493" className="opacity-50">
                            <ellipse cx="10" cy="12" rx="10" ry="8" />
                            <ellipse cx="30" cy="12" rx="10" ry="8" />
                            <circle cx="20" cy="12" r="5" />
                        </svg>
                    </div>
                    <div className="w-16 h-16 bg-[#FF1493]/20 border-2 border-[#FF1493] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-[#FF1493]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Booking Request Received!</h2>
                    <div className="bg-[#0A0A0A] rounded-lg p-4 mb-4 border border-gray-800">
                        <p className="text-gray-300 text-sm leading-relaxed">
                            I will be reaching out shortly to confirm your appointment details and collect the deposit required to secure your booking. Please note, your appointment is not confirmed until you receive confirmation from me.
                        </p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-lg p-4 mb-6 border border-[#FF1493]/20">
                        <p className="text-[#FF1493] text-xs font-semibold uppercase tracking-wide mb-2">Accepted Payment Methods</p>
                        <p className="text-gray-400 text-sm">Cash · Cash App · Venmo · Zelle</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsSuccess(false)}>
                        Book Another Appointment
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-fade-in bg-[#0A0A0A] min-h-screen">
            {/* Hero Section */}
            <section className="py-16 relative overflow-hidden">
                {/* Decorative bow */}
                <div className="absolute top-10 right-10 opacity-10">
                    <svg width="60" height="36" viewBox="0 0 40 24" fill="#FF1493">
                        <ellipse cx="10" cy="12" rx="10" ry="8" />
                        <ellipse cx="30" cy="12" rx="10" ry="8" />
                        <circle cx="20" cy="12" r="5" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Book Your </span>
                        <span className="text-[#FF1493]">Appointment</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Schedule your beauty session and let us pamper you
                    </p>
                </div>
            </section>

            {/* Booking Form */}
            <section className="py-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card padding="lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {submitError && (
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {submitError}
                                </div>
                            )}

                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                                placeholder="Your full name"
                                required
                            />

                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                placeholder="your@email.com"
                                required
                            />

                            <Input
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                placeholder="(xxx) xxx-xxxx"
                                required
                            />

                            <Select
                                label="Service"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                error={errors.service}
                                options={getServiceOptions()}
                                placeholder="Select a service"
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Preferred Date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    error={errors.date}
                                    min={getMinDate()}
                                    required
                                />

                                <Select
                                    label="Preferred Time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    error={errors.time}
                                    options={timeSlots}
                                    placeholder="Select a time"
                                    required
                                />
                            </div>

                            <Textarea
                                label="Special Requests (Optional)"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any design ideas, inspiration photos, or special requests..."
                                maxLength={500}
                                showCharCount
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                isLoading={isSubmitting}
                            >
                                Submit Booking Request
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                A deposit may be required to confirm your appointment.
                                View our <a href="/policy" className="text-[#FF1493] hover:underline">policies</a> for details.
                            </p>
                        </form>
                    </Card>
                </div>
            </section>
        </div>
    );
}
