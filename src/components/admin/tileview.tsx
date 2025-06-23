"use client";

import React from "react";

export default function TileOverlayViewer({ mapUrl, tiles }) {
  if (!mapUrl || !tiles?.length) return null;

  // Fix: extract correct bounds
  const minLat = Math.min(...tiles.map((t) => t.bounds[0]));
  const maxLat = Math.max(...tiles.map((t) => t.bounds[1]));
  const minLng = Math.min(...tiles.map((t) => t.bounds[2]));
  const maxLng = Math.max(...tiles.map((t) => t.bounds[3]));

  const containerStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const imageStyle = {
    width: "100%",
    display: "block",
  };

  const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: "none",
  overflow: "hidden", // ✅ ADD THIS
};


  return (
    <div style={containerStyle}>
      <img src={mapUrl} alt="Map" style={imageStyle} />
      <div style={overlayStyle}>
        {tiles.map((tile, index) => {
          const [tileMinLat, tileMaxLat, tileMinLng, tileMaxLng] = tile.bounds;

const top = +(((tileMinLat - minLat) / (maxLat - minLat)) * 100).toFixed(4);
const left = +(((tileMinLng - minLng) / (maxLng - minLng)) * 100).toFixed(4);
const height = +(((tileMaxLat - tileMinLat) / (maxLat - minLat)) * 100).toFixed(4);
const width = +(((tileMaxLng - tileMinLng) / (maxLng - minLng)) * 100).toFixed(4);


          return (
            <div
              key={index}
              style={{
                position: "absolute",
                border: "1px solid red",
                top: `${top}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`,
                boxSizing: "border-box",
              }}
              title={`Tile ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
