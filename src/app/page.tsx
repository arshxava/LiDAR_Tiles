"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
      <p className="text-xl font-semibold text-foreground">Loading LiDAR Explorer...</p>
      <p className="text-muted-foreground">Please wait while we direct you.</p>
    </div>
  );
}
