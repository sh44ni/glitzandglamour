import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { serviceCategories } from '@/data/services';

export const metadata: Metadata = {
    title: 'Services & Pricing',
    description: 'View our full menu of nail services, facials, pedicures, and waxing services at Glitz & Glamour Studio in Oceanside, CA.',
};

// Service to image mapping
const serviceImages: Record<string, string> = {
    // Nails
    'acrylic-set': '/services/Full Set  GelX.jpeg',
    'full-set': '/services/Full Set  GelX.jpeg',
    'fill': '/services/Fill  Rebalance.jpeg',
    'rebalance': '/services/Fill  Rebalance.jpeg',
    'soak-off': '/services/Soak Off.jpeg',
    'acrylic-toes': '/services/Acrylic Toes.jpeg',
    // Pedicures
    'classic-pedi': '/services/Classic Foot Soak Detox.jpeg',
    'jelly-pedi': '/services/Jelly Hydrating Foot Detox.jpeg',
    // Facials
    'basic-facial': '/services/Basic Facial.jpeg',
    'deep-cleansing': '/services/Deep Cleansing + Extraction Facial.jpeg',
    'anti-aging': '/services/Anti-Aging & Enzyme Facial.jpeg',
    'mini-facial': '/services/Mini Facials.jpeg',
    // Waxing
    'waxing': '/services/Clean_professional_waxing_202601022049.jpeg',
};

// Default images per category
const categoryDefaultImages: Record<string, string> = {
    nails: '/services/Full Set  GelX.jpeg',
    pedicures: '/services/Jelly Hydrating Foot Detox.jpeg',
    haircolor: '/services/Deep Cleansing + Extraction Facial.jpeg',
    haircuts: '/services/Full Set  GelX.jpeg',
    facials: '/services/Deep Cleansing + Extraction Facial.jpeg',
    waxing: '/services/Clean_professional_waxing_202601022049.jpeg',
};

export default function ServicesPage() {
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
                        <span className="text-white">Our </span>
                        <span className="text-[#FF1493]">Services</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Premium beauty services tailored to make you feel glamorous
                    </p>
                </div>
            </section>

            {/* Services Menu */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {serviceCategories.map((category, index) => {
                        const categoryImage = categoryDefaultImages[category.id] || categoryDefaultImages.nails;

                        return (
                            <div
                                key={category.id}
                                id={category.id}
                                className={`${index > 0 ? 'mt-20' : ''}`}
                            >
                                {/* Category Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                                        {category.name}
                                    </h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-[#FF1493]/50 to-transparent" />
                                </div>

                                {/* Service Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {category.services.map((service) => {
                                        // Try to find a matching image for this service
                                        const imageKey = Object.keys(serviceImages).find(key =>
                                            service.id.includes(key) || service.name.toLowerCase().includes(key.replace('-', ' '))
                                        );
                                        const serviceImage = imageKey
                                            ? serviceImages[imageKey]
                                            : categoryImage;

                                        return (
                                            <div
                                                key={service.id}
                                                className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#FF1493]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            >
                                                {/* Image Container */}
                                                <div className="relative h-48 overflow-hidden">
                                                    <Image
                                                        src={serviceImage}
                                                        alt={service.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-transparent" />
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 -mt-6 relative">
                                                    <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-[#FF1493] transition-colors line-clamp-1">
                                                        {service.name}
                                                    </h3>
                                                    {service.description && (
                                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                    <p className="text-[#FF1493] font-bold text-lg">
                                                        {service.price}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Note Section */}
                    <div className="mt-16 p-6 bg-[#1A1A1A] rounded-2xl border border-[#FF1493]/20">
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF1493]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Please Note
                        </h3>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>• Prices may vary based on design complexity and nail length</li>
                            <li>• A deposit is required to secure your appointment</li>
                            <li>• Please arrive 5 minutes early for your appointment</li>
                            <li>• View our full <a href="/policy" className="text-[#FF1493] hover:underline">policies</a> for more information</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#1A1A1A]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Book?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Schedule your appointment today and let us pamper you
                    </p>
                    <Link href="/book">
                        <Button variant="primary" size="lg">
                            Book Appointment
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
