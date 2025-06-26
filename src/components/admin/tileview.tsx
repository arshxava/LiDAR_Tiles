"use client";

import React, { useRef } from "react";

export default function TileOverlayViewer({ mapUrl, tiles }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!mapUrl || tiles.length === 0) return null;

  const minLat = Math.min(...tiles.map((t) => t.bounds[0]));
  const maxLat = Math.max(...tiles.map((t) => t.bounds[1]));
  const minLng = Math.min(...tiles.map((t) => t.bounds[2]));
  const maxLng = Math.max(...tiles.map((t) => t.bounds[3]));

  const width = 1000;
  const height = 1000;

  const drawMap = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);

    try {
      // Draw base map
      const baseImg = await loadImage(mapUrl);
      ctx.drawImage(baseImg, 0, 0, width, height);

      // Draw tiles
      for (const tile of tiles) {
        const [tileMinLat, tileMaxLat, tileMinLng, tileMaxLng] = tile.bounds;

        const top = ((tileMinLat - minLat) / (maxLat - minLat)) * height;
        const left = ((tileMinLng - minLng) / (maxLng - minLng)) * width;
        const tileHeight =
          ((tileMaxLat - tileMinLat) / (maxLat - minLat)) * height;
        const tileWidth =
          ((tileMaxLng - tileMinLng) / (maxLng - minLng)) * width;

        const tileImageUrl =
          tile.status === "completed" && tile.annotatedImageUrl
            ? `http://localhost:5000${tile.annotatedImageUrl}`
            : `http://localhost:5000${tile.imageUrl}`;

        const tileImg = await loadImage(tileImageUrl);
        ctx.drawImage(tileImg, left, top, tileWidth, tileHeight);
      }

      // Download
      const link = document.createElement("a");
      link.download = "annotated_map.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error generating map:", err);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  return (
    <>
    <div className="relative w-full max-w-[800px] mx-auto">
      <img src={mapUrl} alt="Base Map" className="w-full" />

      <div className="absolute inset-0 pointer-events-none">
        {tiles.map((tile, index) => {
          const [tileMinLat, tileMaxLat, tileMinLng, tileMaxLng] = tile.bounds;

          const top = ((tileMinLat - minLat) / (maxLat - minLat)) * 100;
          const left = ((tileMinLng - minLng) / (maxLng - minLng)) * 100;
          const height = ((tileMaxLat - tileMinLat) / (maxLat - minLat)) * 100;
          const width = ((tileMaxLng - tileMinLng) / (maxLng - minLng)) * 100;

          const tileImageUrl =
            tile.status === "completed" && tile.annotatedImageUrl
              ? `http://localhost:5000${tile.annotatedImageUrl}`
              : `http://localhost:5000${tile.imageUrl}`;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`,
                border: "1px solid red",
                overflow: "hidden",
              }}
            >
              <img
                src={tileImageUrl}
                alt={`Tile ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          );
        })}
      </div>

      

      {/* Hidden canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "none" }}
      />
    </div>
    <div className="text-center mt-4">
        <button
          onClick={drawMap}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Download Annotated Map
        </button>
      </div>
      </>
  );
}
