'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken } = useAuthStore();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !accessToken)) {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?redirect=${returnUrl}`);
    }
  }, [isHydrated, isAuthenticated, accessToken, router, pathname]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return null; 
  }

  return <>{children}</>;
}