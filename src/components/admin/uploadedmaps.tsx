"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadedMapsModal({ onClose, onSelectMap }) {
  const [maps, setMaps] = useState([]);

 useEffect(() => {
  const fetchMaps = async () => {
    try {
      const token = localStorage.getItem("lidarToken");
      const res = await axios.get("http://localhost:5000/api/maps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMaps(res.data || []);
    } catch (err) {
      console.error("Error fetching maps:", err);
    }
  };

  fetchMaps();
}, []);


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
              <Card
                key={map._id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSelectMap(map)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{map.name || "Untitled Map"}</CardTitle>
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
    </div>
  );
}
