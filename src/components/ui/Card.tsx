import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
    children,
    className = '',
    hover = true,
    padding = 'md',
}: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`
        glass-card
        ${hover ? 'glass-card-hover glow-pink-hover' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
