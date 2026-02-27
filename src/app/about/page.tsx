import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Me',
    description: 'Learn about Glitz & Glamour Studio and JoJany Lavalle - your trusted nail, hair, and beauty expert in Vista, CA.',
};

export default function AboutPage() {
    return (
        <div className="animate-fade-in bg-[#0A0A0A] min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Decorative bow elements */}
                <div className="absolute top-10 left-10 opacity-10">
                    <svg width="60" height="36" viewBox="0 0 40 24" fill="#FF1493">
                        <ellipse cx="10" cy="12" rx="10" ry="8" />
                        <ellipse cx="30" cy="12" rx="10" ry="8" />
                        <circle cx="20" cy="12" r="5" />
                    </svg>
                </div>
                <div className="absolute bottom-20 right-10 opacity-10">
                    <svg width="40" height="24" viewBox="0 0 40 24" fill="#FF1493">
                        <ellipse cx="10" cy="12" rx="10" ry="8" />
                        <ellipse cx="30" cy="12" rx="10" ry="8" />
                        <circle cx="20" cy="12" r="5" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">About </span>
                        <span className="text-[#FF1493]">Me</span>
                    </h1>
                    <p className="text-xl text-[#FF1493] italic">
                        &ldquo;Unleash the Glitz, Embrace the Glamour&rdquo;
                    </p>
                </div>
            </section>

            {/* About Content */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#1A1A1A] rounded-2xl p-8 md:p-12 border border-gray-800">
                        {/* Decorative top bow */}
                        <div className="flex justify-center mb-8">
                            <svg width="50" height="30" viewBox="0 0 40 24" fill="#FF1493" className="opacity-30">
                                <ellipse cx="10" cy="12" rx="10" ry="8" />
                                <ellipse cx="30" cy="12" rx="10" ry="8" />
                                <circle cx="20" cy="12" r="5" />
                            </svg>
                        </div>

                        <div className="space-y-6 text-gray-300 leading-relaxed">
                            <p>
                                Welcome to <span className="text-[#FF1493] font-semibold">Glitz & Glamour Studio</span>,
                                your premier destination for nail artistry, hair color, haircuts, and beauty services in Vista, CA.
                                Founded by <span className="text-white font-medium">JoJany Lavalle</span>, my studio
                                is dedicated to making every client feel pampered, confident, and absolutely glamorous.
                            </p>

                            <p>
                                With years of experience and a passion for nail art and hair, JoJany brings creativity and
                                precision to every service. Whether you&apos;re looking for a classic manicure, trendy
                                GelX extensions, stunning hair color, a fresh cut, rejuvenating facials, or professional waxing services, I&apos;ve got
                                you covered. Each appointment is tailored to your unique style and preferences.
                            </p>

                            <p>
                                At Glitz & Glamour Studio, I believe beauty should be an experience, not just
                                a service. My welcoming atmosphere, attention to detail, and commitment to quality
                                ensure you leave feeling refreshed and looking stunning. I can&apos;t wait to
                                welcome you to my studio!
                            </p>
                        </div>

                        {/* Signature */}
                        <div className="mt-10 pt-8 border-t border-gray-700 text-center">
                            <p className="text-[#FF1493] font-semibold text-lg">JoJany Lavalle</p>
                            <p className="text-gray-500 text-sm">Owner & Beauty Artist</p>
                            <p className="text-gray-600 text-sm mt-1">812 Frances Dr, Vista, CA 92084</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to Experience the Glamour?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Book your appointment today and let me make you shine!
                    </p>
                    <a
                        href="/book"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#FF1493] text-white font-medium rounded-full hover:bg-[#C71185] transition-colors shadow-lg hover:shadow-xl"
                    >
                        Book Appointment
                    </a>
                </div>
            </section>
        </div>
    );
}
