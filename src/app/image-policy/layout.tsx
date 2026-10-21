import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Image Usage & Release Policy | Glitz & Glamour Studio — San Marcos, CA',
    description:
        'Review our optional photo, video, and image usage & release policy for portfolio, social media, and client photography at Glitz & Glamour Studio in San Marcos, CA.',
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://www.glitzandglamours.com/image-policy' },
    openGraph: {
        title: 'Image Usage & Release Policy | Glitz & Glamour Studio',
        description:
            'Optional photo and video release policy for clients at Glitz & Glamour Studio in San Marcos, CA.',
        type: 'website',
        url: 'https://www.glitzandglamours.com/image-policy',
    },
};

export default function ImagePolicyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
