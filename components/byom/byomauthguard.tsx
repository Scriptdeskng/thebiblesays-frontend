'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface BYOMAuthGuardProps {
  children: React.ReactNode;
}

export function BYOMAuthGuard({ children }: BYOMAuthGuardProps) {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!user || !accessToken)) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, accessToken, isLoading, router]);

  if (isLoading) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-grey">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !accessToken) {
    return (
      <div className="max-w-[1536px] mx-auto px-5 sm:px-10 xl:px-20 py-16 text-center">
        <p className="text-grey">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}