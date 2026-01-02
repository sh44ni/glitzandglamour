import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
    const sizes = {
        xs: { width: 100, height: 50 },  // For navbar
        sm: { width: 120, height: 60 },
        md: { width: 160, height: 80 },
        lg: { width: 200, height: 100 }, // For footer
    };

    const { width, height } = sizes[size];

    return (
        <Link href="/" className={`block flex-shrink-0 ${className}`}>
            <Image
                src="/logo.svg"
                alt="Glitz & Glamour Studio"
                width={width}
                height={height}
                priority
            />
        </Link>
    );
}
