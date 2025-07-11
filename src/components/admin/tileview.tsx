"use client";
 
import React, { useRef, useState } from "react";
 
type Tile = {
  bounds: [number, number, number, number];
  status: "completed" | "available" | string;
  imageUrl: string;
  annotatedImageUrl?: string;
};
 
interface Props {
  mapUrl: string;
  tiles: Tile[];
}
 
export default function TileOverlayViewer({ mapUrl, tiles }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState("center");
   const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL ;
  const CANVAS_W = 1000;
  const CANVAS_H = 1000;
 
  if (!mapUrl || tiles.length === 0) return null;
 
  const minLat = Math.min(...tiles.map((t) => t.bounds[0]));
  const maxLat = Math.max(...tiles.map((t) => t.bounds[1]));
  const minLng = Math.min(...tiles.map((t) => t.bounds[2]));
  const maxLng = Math.max(...tiles.map((t) => t.bounds[3]));
 
  const getFullUrl = (url: string) =>
    url?.startsWith("http") ? url : `${baseUrl}${url}`;
 
  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
 
  const drawMap = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
 
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
 
    try {
      const baseImg = await loadImage(getFullUrl(mapUrl));
      ctx.drawImage(baseImg, 0, 0, CANVAS_W, CANVAS_H);
 
      for (const tile of tiles) {
        const [minLatT, maxLatT, minLngT, maxLngT] = tile.bounds;
 
        const top = ((minLatT - minLat) / (maxLat - minLat)) * CANVAS_H;
        const left = ((minLngT - minLng) / (maxLng - minLng)) * CANVAS_W;
        const tHeight = ((maxLatT - minLatT) / (maxLat - minLat)) * CANVAS_H;
        const tWidth = ((maxLngT - minLngT) / (maxLng - minLng)) * CANVAS_W;
 
        const url =
          tile.status === "completed" && tile.annotatedImageUrl
            ? getFullUrl(tile.annotatedImageUrl)
            : getFullUrl(tile.imageUrl);
 
        const img = await loadImage(url);
        ctx.drawImage(img, left, top, tWidth, tHeight);
      }
 
      const link = document.createElement("a");
      link.download = "annotated_map.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error generating map:", err);
    }
  };
 
  const handleTileClick = (tile: Tile) => {
    setSelectedTile(tile);
    setZoom(1);
    setOrigin("center");
  };
 
  const closeModal = () => {
    setSelectedTile(null);
    setZoom(1);
    setOrigin("center");
  };
 
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const originX = ((x / bounds.width) * 100).toFixed(1);
    const originY = ((y / bounds.height) * 100).toFixed(1);
    setOrigin(`${originX}% ${originY}%`);
    setZoom((z) => Math.min(z + 0.5, 5));
  };
 
  return (
    <>
      {/* Main Grid Map */}
      <div className="relative w-full max-w-[800px] mx-auto">
        <img src={mapUrl} alt="Base Map" className="w-full" />
        <div className="absolute inset-0 pointer-events-none">
          {tiles.map((tile, idx) => {
            const [minLatT, maxLatT, minLngT, maxLngT] = tile.bounds;
            const top = ((minLatT - minLat) / (maxLat - minLat)) * 100;
            const left = ((minLngT - minLng) / (maxLng - minLng)) * 100;
            const h = ((maxLatT - minLatT) / (maxLat - minLat)) * 100;
            const w = ((maxLngT - minLngT) / (maxLng - minLng)) * 100;
 
            const url =
              tile.status === "completed" && tile.annotatedImageUrl
                ? getFullUrl(tile.annotatedImageUrl)
                : getFullUrl(tile.imageUrl);
 
            return (
              <div
                key={idx}
                onClick={() => handleTileClick(tile)}
                className="pointer-events-auto cursor-pointer"
                style={{
                  position: "absolute",
                  top: `${top}%`,
                  left: `${left}%`,
                  height: `${h}%`,
                  width: `${w}%`,
                  border: "2px solid red",
                  overflow: "hidden",
                }}
              >
                <img
                  src={url}
                  alt={`Tile ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            );
          })}
        </div>
 
        {/* Hidden canvas for download */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
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
 
      {/* ─────────────── Modal (Taller + Wider) ─────────────── */}
      {selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="relative bg-white w-[600px] h-[90vh] rounded-xl shadow-lg p-4 flex flex-col items-center overflow-hidden">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold rounded"
            >
              ✕
            </button>
 
            {/* Zoom Controls - Vertical */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.2, 5))}
                className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
              >
                −
              </button>
            </div>
 
            {/* Tile image display */}
            <div className="mt-12 flex-1 flex justify-center items-center overflow-auto w-full">
              <img
                src={
                  selectedTile.status === "completed" &&
                  selectedTile.annotatedImageUrl
                    ? getFullUrl(selectedTile.annotatedImageUrl)
                    : getFullUrl(selectedTile.imageUrl)
                }
                onClick={handleImageClick}
                alt="Selected Tile"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: origin,
                  transition: "transform 0.3s ease",
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  cursor: "zoom-in",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
 
 