import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Glitz & Glamour OS — Case Study',
  description: 'Custom Business Platform built for a US-based nail salon.',
};

export default function CaseStudyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
