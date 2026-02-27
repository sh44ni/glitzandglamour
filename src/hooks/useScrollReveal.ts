'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -60px 0px' } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add visible class to all scroll-reveal children
              const revealElements = entry.target.querySelectorAll('.scroll-reveal');
              revealElements.forEach((el, index) => {
                setTimeout(() => {
                  el.classList.add('visible');
                }, index * 80);
              });
              // Also add to the target itself if it has scroll-reveal
              if (entry.target.classList.contains('scroll-reveal')) {
                entry.target.classList.add('visible');
              }
            }
          });
        },
        { threshold, rootMargin }
      );

      // Observe the node itself and add observer to all scroll-reveal children
      observerRef.current.observe(node);
      const revealElements = node.querySelectorAll('.scroll-reveal');
      revealElements.forEach((el) => {
        observerRef.current!.observe(el);
      });
    },
    [threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return ref;
}

export default useScrollReveal;
