
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } from '@/config';
import type { Tile, Annotation } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MapViewProps {
  tiles: Tile[];
  annotations: Annotation[];
  onTileSelect: (tile: Tile) => void;
  selectedTile: Tile | null;
  // drawingMode: 'point' | 'polygon' | null;
  drawingMode:  'polygon' | null;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
  onAnnotationComplete: (annotationData: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  aiSuggestedGeoJson: string | null; // GeoJSON string from AI
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const DEFAULT_ZOOM = 10;

const DrawingManagerComponent: React.FC<{
  drawingMode: 'point' | 'polygon' | null;
  onpolygonComplete: (polygon: google.maps.polygon) => void;
}> = ({ drawingMode, onpolygonComplete }) => {
  const map = useMap();
  const maps = useMapsLibrary('drawing');
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  useEffect(() => {
    if (!map || !maps) return;

    const newDrawingManager = new maps.DrawingManager({
      map,
      drawingControl: false, // We use our own toolbar
      drawingMode: null,
      polygonOptions: {
        fillColor: 'hsla(var(--accent-hsl) / 0.3)',
        strokeColor: 'hsla(var(--accent-hsl))',
        strokeWeight: 2,
        editable: true,
        draggable: true,
      },
      markerOptions: {
        // Not used for point directly, as map click handles it
      }
    });
    setDrawingManager(newDrawingManager);

    google.maps.event.addListener(newDrawingManager, 'polygoncomplete', (polygon: google.maps.polygon) => {
      onpolygonComplete(polygon);
      newDrawingManager.setDrawingMode(null); // Exit drawing mode
    });
    
    return () => {
      newDrawingManager.setMap(null);
    };
  }, [map, maps, onpolygonComplete]);

  useEffect(() => {
    if (drawingManager) {
      if (drawingMode === 'polygon') {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.polygon);
      } else {
        drawingManager.setDrawingMode(null);
      }
    }
  }, [drawingMode, drawingManager]);

  return null;
};


const AISuggestionsLayer: React.FC<{ geoJsonString: string | null }> = ({ geoJsonString }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !geoJsonString) {
      // Clear previous GeoJSON data if new string is null
      map.data.forEach(feature => map.data.remove(feature));
      return;
    }
    
    try {
      const geoJson = JSON.parse(geoJsonString);
      // Clear previous features before adding new ones
      map.data.forEach(feature => map.data.remove(feature));
      map.data.addGeoJson(geoJson);
      map.data.setStyle({
        fillColor: 'hsla(var(--primary-hsl) / 0.3)',
        strokeColor: 'hsla(var(--primary-hsl))',
        strokeWeight: 2,
        icon: { // Default icon for points
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: 'hsla(var(--primary-hsl))',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: 'white'
        }
      });
    } catch (error) {
      console.error("Error parsing or adding GeoJSON to map:", error);
    }
  }, [map, geoJsonString]);

  return null;
};


export default function MapView({
  tiles,
  annotations,
  onTileSelect,
  selectedTile,
  drawingMode,
  onMapClick,
  onAnnotationComplete,
  aiSuggestedGeoJson
}: MapViewProps) {
  const [activeMarker, setActiveMarker] = useState<Annotation | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleMapLoad = useCallback(() => {
    setMapReady(true);
  }, []);
  
  const handlepolygonComplete = (polygon: google.maps.polygon) => {
    const path = polygon.getPath().getArray().map(latLng => ({ lat: latLng.lat(), lng: latLng.lng() }));
    onAnnotationComplete({ type: 'polygon', coordinates: path });
    polygon.setMap(null); // Remove the drawn polygon, parent will handle rendering
  };

  if (!NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg shadow-inner">
        <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
          Google Maps API Key is missing. Please configure it in your environment variables.
        </p>
      </div>
    );
  }

  const mapCenter = selectedTile?.center || DEFAULT_CENTER;
  const mapZoom = selectedTile?.zoom || DEFAULT_ZOOM;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg relative">
      {!mapReady && (
         <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-2 text-lg font-semibold text-foreground">Loading Map...</p>
         </div>
      )}
      <APIProvider apiKey={NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} onLoad={handleMapLoad}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          center={mapCenter}
          zoom={mapZoom}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={'lidarExplorerMap'}
          onClick={drawingMode === 'point' ? onMapClick : undefined}
          className="h-full w-full"
        >
          {tiles.map((tile) => (
            <AdvancedMarker
              key={tile.id}
              position={tile.center}
              onClick={() => onTileSelect(tile)}
              title={tile.name}
            >
              <Pin
                background={selectedTile?.id === tile.id ? 'hsla(var(--accent-hsl))' : 'hsla(var(--primary-hsl))'}
                borderColor={selectedTile?.id === tile.id ? 'hsla(var(--accent-hsl))' : 'hsla(var(--primary-hsl))'}
                glyphColor={'white'}
              />
            </AdvancedMarker>
          ))}

          {annotations.map((annotation) => {
             if (annotation.type === 'point' && annotation.data?.coordinates) {
              return (
                <AdvancedMarker
                  key={annotation.id}
                  position={annotation.data.coordinates}
                  onClick={() => setActiveMarker(annotation)}
                  title={annotation.label || 'Annotation'}
                >
                  <Pin background={'hsla(var(--destructive-hsl))'} borderColor={'hsla(var(--destructive-hsl))'} glyphColor={'white'} />
                </AdvancedMarker>
              );
            }
            // TODO: Render polygons (data layer or polygon component)
            // For now, polygons are drawn by DrawingManager and AI suggestions layer
            return null;
          })}
          
          {activeMarker && (
            <InfoWindow
              position={activeMarker.data.coordinates}
              onCloseClick={() => setActiveMarker(null)}
              pixelOffset={new google.maps.Size(0, -30)}
            >
              <div className="p-2">
                <h4 className="font-bold text-sm mb-1">{activeMarker.label || 'Annotation Details'}</h4>
                <p className="text-xs">{activeMarker.notes || `Type: ${activeMarker.type}`}</p>
                <p className="text-xs mt-1">Created: {new Date(activeMarker.createdAt).toLocaleDateString()}</p>
              </div>
            </InfoWindow>
          )}

          <DrawingManagerComponent drawingMode={drawingMode} onpolygonComplete={handlepolygonComplete} />
          <AISuggestionsLayer geoJsonString={aiSuggestedGeoJson} />

        </Map>
      </APIProvider>
      {selectedTile && (
        <div className="absolute top-2 left-2 bg-card p-2 rounded-md shadow-md max-w-xs">
          <h3 className="font-bold text-sm text-primary font-headline">{selectedTile.name}</h3>
          <p className="text-xs text-muted-foreground">Status: {selectedTile.status}</p>
          {selectedTile.previewImageUrl && (
             <img src={selectedTile.previewImageUrl} alt={selectedTile.name} data-ai-hint="map tile" className="mt-2 rounded h-20 w-auto object-cover" />
          )}
        </div>
      )}
    </div>
  );
}
