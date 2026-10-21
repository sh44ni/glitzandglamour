import type { Metadata } from 'next';
import SignContractGate from './SignContractGate';

export const metadata: Metadata = {
    title: 'Special Event Service Agreement & Digital Contract | Glitz & Glamour Studio',
    description:
        'Review and electronically sign your Special Event Bridal & Beauty Service Agreement with Glitz & Glamour Studio in San Marcos, CA.',
    robots: { index: true, follow: true },
    openGraph: {
        title: 'Special Event Service Agreement & Digital Contract | Glitz & Glamour Studio',
        description:
            'Review and electronically sign your Special Event Bridal & Beauty Service Agreement with Glitz & Glamour Studio in San Marcos, CA.',
        type: 'website',
    },
};

export default async function SignContractPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <SignContractGate token={token} />;
}
