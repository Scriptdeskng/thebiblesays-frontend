'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setIsHydrated(true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated && accessToken) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.replace(redirectTo);
    }
  }, [isHydrated, isAuthenticated, accessToken, router, searchParams]);

  if (!isHydrated) return null;

  if (isAuthenticated && accessToken) return null;

  return <>{children}</>;
}