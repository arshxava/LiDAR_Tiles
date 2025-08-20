// AdminDashboardPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import TileStatusGrid from "@/components/admin/TileStatusGrid";
import AdminStats from "@/components/admin/AdminStats";
import MapUploadForm from "@/components/admin/MapUploadForm";
import ChatRoom from "@/components/admin/ChatBox";
import UploadedMapsModal from "@/components/admin/uploadedmaps";
import TileOverlayViewer from "@/components/admin/tileview";
import type { Tile } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";
export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [tileLoading, setTileLoading] = useState<boolean>(true);
  const [mapName, setMapName] = useState<string>("");
  const [latestMap, setLatestMap] = useState<any>(null);
 const [isChatOpen, setIsChatOpen] = useState(false);
const [roomId, setRoomId] = useState("general"); 
const [chatLoading, setChatLoading] = useState(false);

  const [showMapModal, setShowMapModal] = useState(false);
const [statusFilter, setStatusFilter] = useState<string>("all");
   const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL ;

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

    const mapsRes = await axios.get(`${baseUrl}/api/maps`, {
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
      `${baseUrl}/api/maps/${latest._id}/tiles`,
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



{latestMap?.viewerUrl && (
  <section>
    <h3 className="text-xl font-semibold font-headline text-foreground mb-4">
      Potree Viewer
    </h3>
    <div className="w-full aspect-video border rounded shadow overflow-hidden">
      <iframe
        src={latestMap.viewerUrl}
        title="Potree Viewer"
        width="100%"
        height="100%"
        className="w-full h-[600px] border-none"
      />
    </div>
  </section>
)}


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

{/* <section>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold font-headline text-foreground">
      Chatroom
    </h3>
    <select
      value={roomId}
      onChange={(e) => setRoomId(e.target.value)}
      className="border border-input rounded px-3 py-1 text-sm"
    >
      <option value="general">General</option>
      <option value="annotation">Annotation</option>
      <option value="support">Support</option>
    </select>
  </div>

  {chatLoading ? (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted" />
    </div>
  ) : (
<ChatRoom roomId={roomId} user={user} />
  )}
</section>


      <Separator /> */}

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

 {/* <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}
      </div>
{isChatOpen && (
  <div
    className="fixed bottom-20 right-6 w-96 max-w-full h-[500px] bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col z-[9999] transition-transform duration-300"
    style={{
      animation: "slideUp 0.3s ease-out",
    }}
  >
    {/* Header */}
//     <div className="flex justify-between items-center p-3 border-b bg-gray-100 rounded-t-lg">
//       <div className="flex items-center gap-2">
//         <h4 className="text-lg font-semibold">Chatroom</h4>
//         <select
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//           className="border border-input rounded px-2 py-1 text-sm"
//         >
//           <option value="general">General</option>
//           <option value="annotation">Annotation</option>
//           <option value="support">Support</option>
//         </select>
//       </div>
//       <button onClick={() => setIsChatOpen(false)}>
//         <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
//       </button>
//     </div>

//     {/* Chat Messages */}
//     <div className="flex-1 overflow-hidden">
//       <ChatRoom roomId={roomId} user={user} />
//     </div>
//   </div>
// )}