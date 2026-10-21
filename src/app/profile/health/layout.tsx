import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Confidential Client Health & Skin Intake Record | Glitz & Glamour Studio',
    description:
        'Access and review your confidential client health, skincare, allergy, and contraindication intake record for facials, waxing, lash extensions, and nail services at Glitz & Glamour Studio in San Marcos, CA.',
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://www.glitzandglamours.com/profile/health' },
    openGraph: {
        title: 'Confidential Client Health & Skin Intake Record | Glitz & Glamour Studio',
        description:
            'Review our studio hygiene, skin safety screening protocols, and your confidential client health intake record at Glitz & Glamour Studio in San Marcos, CA.',
        type: 'website',
        url: 'https://www.glitzandglamours.com/profile/health',
    },
};

export default function HealthRecordLayout({ children }: { children: React.ReactNode }) {
    return children;
}
