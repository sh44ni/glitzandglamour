import { Suspense } from 'react';
import MobileOAuthRelay from './relay';

type Props = {
  searchParams: Promise<{ provider?: string }>;
};

export default async function MobileOAuthPage({ searchParams }: Props) {
  const params = await searchParams;
  const provider = params.provider ?? 'google';

  return (
    <Suspense>
      <MobileOAuthRelay provider={provider} />
    </Suspense>
  );
}
