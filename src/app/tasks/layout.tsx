import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Board | Glitz & Glamour Studio',
  robots: { index: false, follow: false },
};

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
