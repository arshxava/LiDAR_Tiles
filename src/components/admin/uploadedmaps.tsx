"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UploadedMapsModal({ onClose, onSelectMap }) {
  const [maps, setMaps] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL;

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const token = localStorage.getItem("lidarToken");
        const res = await axios.get(`${baseUrl}/api/maps`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMaps(res.data || []);
      } catch (err) {
        console.error("Error fetching maps:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load maps.",
        });
      }
    };

    fetchMaps();
  }, [baseUrl, toast]);

  const handleDelete = async (mapId: string) => {
    try {
      setDeletingId(mapId);
      const token = localStorage.getItem("lidarToken");
      await axios.delete(`${baseUrl}/api/maps/${mapId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMaps((prev) => prev.filter((m) => m._id !== mapId));
      toast({
        title: "Deleted",
        description: "Map and its tiles were successfully deleted.",
      });

      // ✅ Close dialog AFTER success
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Error deleting map:", err);
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not delete map. Try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto rounded shadow-lg relative p-4">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Uploaded Maps</h2>
        {maps.length === 0 ? (
          <p className="text-muted-foreground">No maps uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {maps.map((map) => (
              <Card key={map._id} className="relative group">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(map._id); // ✅ open confirm dialog
                  }}
                  disabled={deletingId === map._id}
                >
                  {deletingId === map._id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>

                <CardHeader
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("lidarToken");
                      const tileRes = await axios.get(
                        `${baseUrl}/api/maps/${map._id}/tiles`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      onSelectMap({ ...map, tiles: tileRes.data });
                    } catch (error) {
                      console.error("Error fetching tiles:", error);
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to fetch tiles for this map.",
                      });
                    }
                  }}
                >
                  <CardTitle className="text-base">
                    {map.name || "Untitled Map"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>Tiles: {map.tiles?.length || 0}</p>
                  <p>Tile Size: {map.tileSizeKm} km</p>
                  <p>Uploaded: {new Date(map.createdAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Map?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the map and all its tiles. This action
            cannot be undone.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
            >
              {deletingId === confirmDeleteId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
