"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TileStatusGrid from '@/components/admin/TileStatusGrid';
import AdminStats from '@/components/admin/AdminStats';
import MapUploadForm from '@/components/admin/MapUploadForm';
import type { Tile } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [tileLoading, setTileLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/login');
    } else if (!loading && user) {
      fetchTiles();
    }
  }, [user, loading, router]);

  const fetchTiles = async () => {
    try {
      setTileLoading(true);
      const response = await axios.get('/api/tiles'); 
      setTiles(response.data.tiles); // Ensure this matches your API's response shape
    } catch (error) {
      console.error("Error fetching tiles:", error);
    } finally {
      setTileLoading(false);
    }
  };

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline text-foreground">Admin Dashboard</h2>
        {/* Removed Create New User button */}
      </div>

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">LiDAR Map Management</h3>
        <MapUploadForm />
      </section>

      <Separator />

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">Tile Statistics</h3>
        {tileLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        ) : (
          <AdminStats tiles={tiles} />
        )}
      </section>

      <Separator />

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">Tile Status Overview</h3>
        {tileLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        ) : (
          <TileStatusGrid tiles={tiles} />
        )}
      </section>
    </div>
  );
}
