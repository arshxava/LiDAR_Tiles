"use client";

import React, { ReactNode } from 'react';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { loading } = useAuth();
  const pathname = usePathname();

  const noHeaderPaths = ['/login', '/register'];
  const showHeader = !noHeaderPaths.includes(pathname);

  if (loading && !noHeaderPaths.includes(pathname)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse text-xl text-primary">Loading LiDAR Explorer...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className={`flex-grow ${showHeader ? 'container mx-auto px-4 py-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}
