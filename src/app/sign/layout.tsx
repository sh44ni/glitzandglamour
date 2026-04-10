import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign agreement | Glitz & Glamour Studio',
    robots: { index: false, follow: false },
};

export default function SignLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
