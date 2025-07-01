// AdminDashboardPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import TileStatusGrid from "@/components/admin/TileStatusGrid";
import AdminStats from "@/components/admin/AdminStats";
import MapUploadForm from "@/components/admin/MapUploadForm";
import UploadedMapsModal from "@/components/admin/uploadedmaps";
import TileOverlayViewer from "@/components/admin/tileview";
import type { Tile } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [tileLoading, setTileLoading] = useState<boolean>(true);
  const [mapName, setMapName] = useState<string>("");
  const [latestMap, setLatestMap] = useState<any>(null);
  const [showMapModal, setShowMapModal] = useState(false);
const [statusFilter, setStatusFilter] = useState<string>("all");
const filteredTiles = statusFilter === "all"
  ? tiles
  : tiles.filter((tile) => tile.status === statusFilter);
  useEffect(() => {
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
      router.push("/login");
    } else if (!loading && user) {
      fetchTiles();
    }
  }, [user, loading, router]);

  const fetchTiles = async () => {
  try {
    setTileLoading(true);
    const token = localStorage.getItem("lidarToken");

    const mapsRes = await axios.get("http://localhost:5000/api/maps", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const maps = mapsRes.data;
    const latest = maps[maps.length - 1];

    if (!latest?._id) {
      console.error("No map found.");
      return;
    }

    setMapName(latest.name || latest._id);
    setLatestMap(latest);

    const tileRes = await axios.get(
      `http://localhost:5000/api/maps/${latest._id}/tiles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setTiles(tileRes.data);
  } catch (error) {
    console.error("Error fetching tiles:", error);
  } finally {
    setTileLoading(false);
  }
};


  if (loading || !user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline text-foreground">
          Admin Dashboard
        </h2>
      </div>

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">
          LiDAR Map Management
        </h3>
        <MapUploadForm onUploadSuccess={fetchTiles} />
      </section>

      <Separator />

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">
          Map Tile View
        </h3>
        {!tileLoading && latestMap?.fileUrl && (
        <TileOverlayViewer
  mapUrl={latestMap?.fileUrl}
  tiles={tiles}
/>
        )}
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => setShowMapModal(true)}
          className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 transition"
        >
          View Uploaded Maps
        </button>
      </div>

      {showMapModal && (
        <UploadedMapsModal
          onClose={() => setShowMapModal(false)}
          onSelectMap={(map) => {
            setMapName(map.name || map._id);
            setLatestMap(map);
            setTiles(map.tiles || []);
            setShowMapModal(false);
          }}
        />
      )}

      <section>
        <h3 className="text-xl font-semibold font-headline text-foreground mb-4">
          Tile Statistics {mapName ? `for map: ${mapName}` : ""}
        </h3>
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
       <div className="flex items-center justify-between mb-4">
  <h3 className="text-xl font-semibold font-headline text-foreground">
    Tile Status Overview
  </h3>
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-input rounded px-3 py-1 text-sm"
  >
    <option value="all">All</option>
    <option value="available">Available</option>
    <option value="in_progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>
</div>

        
        {tileLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        ) : (
          <TileStatusGrid tiles={filteredTiles} />

        )}
      </section>
    </div>
  );
}
