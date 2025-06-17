"use client";

import React, { useState, useEffect } from 'react';
import TileStatusGrid from '@/components/admin/TileStatusGrid';
import AdminStats from '@/components/admin/AdminStats';
import type { Tile } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // For potential actions

// Mock data - in a real app, this would come from a database via API/Server Action
const MOCK_TILES_DATA: Tile[] = [
  { id: 'tile1', name: 'SF Downtown Sector A', status: 'available', center: { lat: 37.795, lng: -122.395 }, zoom: 15, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+A', dataAiHint: "city aerial" },
  { id: 'tile2', name: 'Golden Gate Park Area', status: 'assigned', assignedTo: 'user1', center: { lat: 37.770, lng: -122.470 }, zoom: 14, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+B', dataAiHint: "park map" },
  { id: 'tile3', name: 'Oakland Waterfront Zone', status: 'completed', center: { lat: 37.800, lng: -122.270 }, zoom: 15, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+C', dataAiHint: "waterfront city" },
  { id: 'tile4', name: 'Presidio National Park', status: 'available', center: { lat: 37.802, lng: -122.472 }, zoom: 14, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+D', dataAiHint: "national park" },
  { id: 'tile5', name: 'Berkeley Hills Region', status: 'assigned', assignedTo: 'user2', center: { lat: 37.880, lng: -122.255 }, zoom: 13, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+E', dataAiHint: "hills region" },
  { id: 'tile6', name: 'South San Francisco Industrial', status: 'completed', center: { lat: 37.650, lng: -122.400 }, zoom: 15, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+F', dataAiHint: "industrial area" },
];

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/login'); // Or a generic unauthorized page
    } else if (!loading && user) {
      // Fetch admin-specific data here
      setTiles(MOCK_TILES_DATA);
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline text-foreground">Admin Dashboard</h2>
        {/* Potential actions like "Add New Tile" could go here */}
        {/* <Button>Add New Tile</Button> */}
      </div>
      
      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">Tile Statistics</h3>
        <AdminStats tiles={tiles} />
      </section>

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">Tile Status Overview</h3>
        <TileStatusGrid tiles={tiles} />
      </section>
    </div>
  );
}
