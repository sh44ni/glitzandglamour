'use client';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
}

export default function FeaturedImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="featured-card-bg"
      onError={() => setFailed(true)}
    />
  );
}
