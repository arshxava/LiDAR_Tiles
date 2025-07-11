
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TileStatusGrid({ tiles }) {
  const [selectedTile, setSelectedTile] = useState(null);

  const getFullUrl = (url) =>
    url?.startsWith("http") ? url : `http://localhost:5000${url}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {tiles.map((tile, idx) => {
        const isCompleted = tile.status === "completed" && tile.annotations?.length > 0;
        const imageUrl =
          isCompleted && tile.annotatedImageUrl
            ? getFullUrl(tile.annotatedImageUrl)
            : getFullUrl(tile.imageUrl);

        // ✅ Log only completed tiles to check populated data
        if (isCompleted) {
          // console.log(`✅ Completed Tile ${idx + 1}:`, tile);
          // console.log("👤 Assigned User:", tile.assignedTo);
          // console.log("📝 Annotations:", tile.annotations);
        }

        return (
          <Card
            key={tile._id}
            onClick={() => setSelectedTile(tile)}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <CardTitle>{tile.name || `Tile ${idx + 1}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <img
                src={imageUrl}
                alt={`Tile ${idx + 1}`}
                className="w-full h-40 object-cover rounded"
              />
              <p>
                <strong>Status:</strong> {tile.status}
              </p>
              {tile.status !== "available" && (
  <p>
    <strong>
      {tile.status === "in_progress" ? "Assigned To:" : "Completed By:"}
    </strong>{" "}
    {tile.assignedTo?.username || "Unknown"}
  </p>
)}
              

              {isCompleted && tile.annotations?.length > 0 && (
                <div className="mt-2 text-xs">
                  <strong>Annotations:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {tile.annotations.map((ann, i) => (
                      <li key={ann._id || i}>
                        <strong>{ann.label || "No Label"} - {ann.period || "No Period"}</strong>
                        {ann.notes ? `: ${ann.notes}` : ": No notes"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!selectedTile} onOpenChange={() => setSelectedTile(null)}>
        <DialogContent className="max-w-xl">
          {selectedTile && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTile.name || "Tile Details"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={
                    selectedTile.status === "completed" && selectedTile.annotatedImageUrl
                      ? getFullUrl(selectedTile.annotatedImageUrl)
                      : getFullUrl(selectedTile.imageUrl)
                  }
                  alt="Selected Tile"
                  className="w-full h-auto rounded border"
                />
                <p>
                  <strong>Status:</strong> {selectedTile.status}
                </p>
                {/* <p>
                  <strong>Assigned To:</strong> {selectedTile.assignedTo?.username || "Unknown"}
                </p> */}
                {selectedTile.status !== "available" && (
  <p>
    <strong>
      {selectedTile.status === "in_progress" ? "Assigned To:" : "Completed By:"}
    </strong>{" "}
    {selectedTile.assignedTo?.username || "Unknown"}
  </p>
)}


                {selectedTile.annotations?.length > 0 && (
                  <div className="text-sm">
                    <strong>Annotations:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {selectedTile.annotations.map((ann, i) => (
                        <li key={ann._id || i}>
                          <strong>{ann.label || "No Label"}</strong> ({ann.period || "No Period"}): {ann.notes || "No notes"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
