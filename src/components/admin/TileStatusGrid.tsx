"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const statusIcons = {
  available: <AlertTriangle className="text-yellow-500 w-4 h-4 mr-1" />,
  in_progress: <Loader2 className="text-blue-500 w-4 h-4 mr-1 animate-spin" />,
  completed: <CheckCircle className="text-green-500 w-4 h-4 mr-1" />,
};

export default function TileStatusGrid({ tiles }) {
  if (!tiles?.length) return <p className="text-muted">No tiles to display.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {tiles.map((tile, idx) => (
        <Card key={tile._id || idx}>
          <CardHeader>
            <CardTitle className="text-sm">
              Tile ID:{" "}
              <span className="text-muted-foreground">
                {tile._id ? tile._id.slice(-5) : "N/A"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {/* Tile Image */}
              {tile.imageUrl ? (
                <img
                  src={`http://localhost:5000${tile.imageUrl}`}
                  alt={`Tile ${tile._id}`}
                  className="w-full h-32 object-cover rounded mb-2 border"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded mb-2 border">
                  No Image
                </div>
              )}

              {/* Bounds Info */}
              <div>
                <strong>Bounds:</strong>
                {Array.isArray(tile.bounds) && tile.bounds.length === 4 ? (
                  <div className="text-xs mt-1">
                    <div>
                      Lat: {tile.bounds[1].toFixed(4)} -{" "}
                      {tile.bounds[3].toFixed(4)}
                    </div>
                    <div>
                      Lng: {tile.bounds[0].toFixed(4)} -{" "}
                      {tile.bounds[2].toFixed(4)}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-400 text-xs">Invalid bounds</div>
                )}
              </div>

              {/* Status */}
              <div className="mt-2 flex items-center text-xs">
                {statusIcons[tile.status] || null}
                <Badge variant="outline" className="ml-1">
                  {tile.status}
                </Badge>
              </div>

              {/* Assigned To */}
              {tile.assignedTo && (
                <div className="flex items-center mt-1 text-primary text-xs">
                  <UserIcon className="w-3 h-3 mr-1" />
                  Assigned to: {tile.assignedTo.name || tile.assignedTo.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
