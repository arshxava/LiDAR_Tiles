
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import MapView from '@/components/map/MapView';
import AnnotationToolbar from '@/components/map/AnnotationToolbar';
import AIAssistantPanel from '@/components/dashboard/AIAssistantPanel';
import type { Tile, Annotation, AnnotationType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Added import for Label
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Loader2 } from 'lucide-react'; // Added Loader2

// Mock data for tiles
const MOCK_TILES: Tile[] = [
  { id: 'tile1', name: 'SF Downtown Sector A', status: 'available', center: { lat: 37.795, lng: -122.395 }, zoom: 15, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+A' , dataAiHint: "city aerial" },
  { id: 'tile2', name: 'Golden Gate Park Area', status: 'assigned', assignedTo: 'user1', center: { lat: 37.770, lng: -122.470 }, zoom: 14, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+B', dataAiHint: "park map" },
  { id: 'tile3', name: 'Oakland Waterfront Zone', status: 'completed', center: { lat: 37.800, lng: -122.270 }, zoom: 15, previewImageUrl: 'https://placehold.co/300x200.png?text=Tile+C', dataAiHint: "waterfront city" },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tiles, setTiles] = useState<Tile[]>(MOCK_TILES);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<'point' | 'polygon' | null>(null);
  const [aiSuggestedGeoJson, setAiSuggestedGeoJson] = useState<string | null>(null);

  // Annotation details dialog
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [currentAnnotationData, setCurrentAnnotationData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [annotationLabel, setAnnotationLabel] = useState('');
  const [annotationNotes, setAnnotationNotes] = useState('');
  const [currentAnnotationType, setCurrentAnnotationType] = useState<AnnotationType | null>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role === 'SUPER_ADMIN') {
      // Optionally, redirect admin to admin page if they land here, or allow access
      // For now, allow access to user dashboard for admins too.
    }
  }, [user, loading, router]);

  const handleTileSelect = (tile: Tile) => {
    if (tile.status === 'available' && user) {
      // Simulate assignment
      const updatedTiles = tiles.map(t => 
        t.id === tile.id ? { ...t, status: 'assigned' as 'assigned', assignedTo: user.id } : t
      );
      setTiles(updatedTiles);
      setSelectedTile({ ...tile, status: 'assigned', assignedTo: user.id });
      toast({ title: "Tile Assigned", description: `${tile.name} has been assigned to you.` });
    } else if (tile.status === 'assigned' && tile.assignedTo !== user?.id) {
      toast({ variant: "destructive", title: "Tile Locked", description: `${tile.name} is assigned to another user.` });
      return;
    }
    else {
       setSelectedTile(tile);
    }
    setAnnotations([]); // Clear annotations for new tile
    setAiSuggestedGeoJson(null); // Clear AI suggestions
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (currentTool === 'point' && selectedTile && event.latLng) {
      const newAnnotationData = {
        coordinates: { lat: event.latLng.lat(), lng: event.latLng.lng() },
      };
      setCurrentAnnotationData(newAnnotationData);
      setCurrentAnnotationType('point');
      setIsAnnotationDialogOpen(true);
    }
  }, [currentTool, selectedTile]);


  const handleAnnotationComplete = useCallback((annotationData: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (selectedTile && (currentTool === 'polygon')) {
      setCurrentAnnotationData(annotationData);
      setCurrentAnnotationType(currentTool);
      setIsAnnotationDialogOpen(true);
    }
  }, [selectedTile, currentTool]);

  const saveAnnotation = () => {
    if (!selectedTile || !user || !currentAnnotationData || !currentAnnotationType) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      tileId: selectedTile.id,
      userId: user.id,
      type: currentAnnotationType,
      data: currentAnnotationData,
      label: annotationLabel,
      notes: annotationNotes,
      createdAt: new Date().toISOString(),
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setIsAnnotationDialogOpen(false);
    setAnnotationLabel('');
    setAnnotationNotes('');
    setCurrentAnnotationData(null);
    setCurrentAnnotationType(null);
    setCurrentTool(null); // Reset tool after annotation
    toast({ title: "Annotation Saved", description: `${currentAnnotationType} added to ${selectedTile.name}.` });
  };
  
  const handleToolSelect = (tool: 'point' | 'polygon' | null) => {
    if (!selectedTile) {
      toast({ variant: 'destructive', title: 'No Tile Selected', description: 'Please select a tile first to start annotating.' });
      return;
    }
    setCurrentTool(tool);
  };

  const handleSuggestionLoaded = (geoJsonString: string) => {
    setAiSuggestedGeoJson(geoJsonString);
  };

  const completeTile = () => {
    if (selectedTile && user && selectedTile.assignedTo === user.id) {
      const updatedTiles = tiles.map(t => 
        t.id === selectedTile.id ? { ...t, status: 'completed' as 'completed' } : t
      );
      setTiles(updatedTiles);
      setSelectedTile({ ...selectedTile, status: 'completed' });
      toast({ title: "Tile Completed!", description: `${selectedTile.name} marked as completed.` });
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-var(--header-height,80px)-2rem)] gap-4 p-0 m-0 max-w-full">
      {/* Left Panel: Tile List & AI Assistant */}
      <div className="lg:w-1/3 xl:w-1/4 flex flex-col gap-4 h-full">
        <Card className="flex-shrink-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Available Tiles</CardTitle>
            <CardDescription>Select a tile to start annotating.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-3">
              {tiles.map(tile => (
                <Button
                  key={tile.id}
                  variant={selectedTile?.id === tile.id ? 'default' : 'outline'}
                  className="w-full justify-start mb-2 text-left h-auto py-2"
                  onClick={() => handleTileSelect(tile)}
                  disabled={tile.status === 'assigned' && tile.assignedTo !== user.id}
                >
                  <div>
                    <p className="font-semibold">{tile.name}</p>
                    <p className={`text-xs ${
                      tile.status === 'available' ? 'text-green-600' :
                      tile.status === 'assigned' ? (tile.assignedTo === user.id ? 'text-blue-600' : 'text-orange-600') :
                      'text-gray-500'
                    }`}>
                      Status: {tile.status} {tile.status === 'assigned' && tile.assignedTo === user.id && "(Yours)"}
                    </p>
                  </div>
                </Button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        
        <div className="flex-grow overflow-y-auto">
         {selectedTile && <AIAssistantPanel onSuggestionLoaded={handleSuggestionLoaded} />}
        </div>
      </div>

      {/* Right Panel: Map & Annotation Toolbar */}
      <div className="lg:w-2/3 xl:w-3/4 h-full flex flex-col gap-4">
        <div className="flex-shrink-0 flex justify-between items-center">
          <AnnotationToolbar currentTool={currentTool} onToolSelect={handleToolSelect} />
          {selectedTile && selectedTile.status === 'assigned' && selectedTile.assignedTo === user.id && (
            <Button onClick={completeTile} variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="mr-2 h-4 w-4" /> Mark Tile as Completed
            </Button>
          )}
        </div>
        <div className="flex-grow bg-muted rounded-lg overflow-hidden">
          <MapView
            tiles={tiles}
            annotations={annotations}
            onTileSelect={handleTileSelect}
            selectedTile={selectedTile}
            drawingMode={currentTool}
            onMapClick={handleMapClick}
            onAnnotationComplete={handleAnnotationComplete}
            aiSuggestedGeoJson={aiSuggestedGeoJson}
          />
        </div>
         {annotations.length > 0 && selectedTile && (
            <Card className="flex-shrink-0 max-h-[150px] shadow-lg">
                <CardHeader className="py-2">
                    <CardTitle className="text-md font-headline">Annotations for {selectedTile.name}</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                    <ScrollArea className="h-[80px]">
                        <ul className="space-y-1">
                            {annotations.filter(a => a.tileId === selectedTile.id).map(ann => (
                                <li key={ann.id} className="text-xs p-1 bg-secondary rounded">
                                    {ann.label || ann.type}: {ann.notes || new Date(ann.createdAt).toLocaleTimeString()}
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
        )}
      </div>
       <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Add {currentAnnotationType} Annotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="annotation-label">Label (Optional)</Label>
              <Input id="annotation-label" value={annotationLabel} onChange={(e) => setAnnotationLabel(e.target.value)} placeholder="e.g., Building A, Tall Tree" />
            </div>
            <div>
              <Label htmlFor="annotation-notes">Notes (Optional)</Label>
              <Textarea id="annotation-notes" value={annotationNotes} onChange={(e) => setAnnotationNotes(e.target.value)} placeholder="Additional details about this annotation..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnotationDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAnnotation} className="bg-primary hover:bg-primary/90">Save Annotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    