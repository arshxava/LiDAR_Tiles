"use client";

import React, { useState, useEffect, useRef } from "react";
import AnnotationToolbar from "@/components/map/AnnotationToolbar";
import type { Tile, Annotation, AnnotationType } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, SkipForward } from "lucide-react";
import { getAssignedTile, submitTile } from "../../service/tiles";
import { getUserAnnotations, getLeaderboard } from "../../service/user";
import { saveAnnotationToDB } from "../../service/annotations";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<"point" | "polygon" | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [currentAnnotationData, setCurrentAnnotationData] = useState<any>(null);
  const [currentAnnotationType, setCurrentAnnotationType] = useState<AnnotationType | null>(null);
  const [annotationLabel, setAnnotationLabel] = useState("");
  const [annotationNotes, setAnnotationNotes] = useState("");
  const [skipCount, setSkipCount] = useState(0);
  const MAX_SKIP = 3;

  const [pastAnnotations, setPastAnnotations] = useState<Annotation[]>([]);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; count: number }[]>([]);
  const [newTileAssigned, setNewTileAssigned] = useState(false);
  const [loadingTile, setLoadingTile] = useState(true);
  const [drawingPolygon, setDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);

  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
  if (!loading && !user) {
    router.push("/login");
  } else if (user) {
    const savedTile = localStorage.getItem("currentTile");
    const savedAnnotations = localStorage.getItem("currentAnnotations");
    if (savedTile) {
      const parsedTile = JSON.parse(savedTile);

      if (parsedTile.imageUrl && parsedTile.imageUrl.startsWith("/uploads")) {
        parsedTile.imageUrl = `http://localhost:5000${parsedTile.imageUrl}`;
      }

      setSelectedTile(parsedTile);
      setLoadingTile(false); 
    } else {
      fetchAssignedTile();
    }

    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }

    fetchUserStats();
  }
}, [user, loading]);


  useEffect(() => {
    if (selectedTile) {
      localStorage.setItem("currentTile", JSON.stringify(selectedTile));
    }
    localStorage.setItem("currentAnnotations", JSON.stringify(annotations));
  }, [selectedTile, annotations]);

  const fetchAssignedTile = async () => {
    if (!user?.id) return;
    try {
      setLoadingTile(true);
      const token = localStorage.getItem("lidarToken");
      const tile = await getAssignedTile(token);

      if (tile?._id) {
        tile.id = tile._id;
      }

      if (tile?.imageUrl && tile.imageUrl.startsWith("/uploads")) {
        tile.imageUrl = `http://localhost:5000${tile.imageUrl}`;
      }

      setSelectedTile(tile);
      setNewTileAssigned(true);
    } catch (err) {
      toast({ variant: "destructive", title: "No available tiles" });
    } finally {
      setLoadingTile(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem("token");
      const [annotationsData, leaderboardData] = await Promise.all([
        getUserAnnotations(user.id, token),
        getLeaderboard(token),
      ]);
      setPastAnnotations(annotationsData);
      const count = annotationsData.length;
      setLevel(Math.floor(count / 5) + 1);
      setBadges(count >= 10 ? ["Veteran Annotator"] : ["Newcomer"]);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === "point") {
      setCurrentAnnotationData({ pixelX: x, pixelY: y });
      setCurrentAnnotationType("point");
      setIsAnnotationDialogOpen(true);
    }

    if (currentTool === "polygon") {
      setPolygonPoints((prev) => [...prev, { x, y }]);
      setDrawingPolygon(true);
    }
  };

  const saveAnnotation = async () => {
    if (!selectedTile || !user || !currentAnnotationType || !currentAnnotationData) return;

    const newAnn: Annotation = {
      tileId: selectedTile.id,
      userId: user.id,
      type: currentAnnotationType,
      data: currentAnnotationData,
      label: annotationLabel,
      notes: annotationNotes,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveAnnotationToDB(newAnn);
      setAnnotations((prev) => [...prev, newAnn]);
      setAnnotationLabel("");
      setAnnotationNotes("");
      setIsAnnotationDialogOpen(false);
      setCurrentTool(null);
      setPolygonPoints([]);
      setDrawingPolygon(false);
      toast({ title: "Annotation saved ✅" });
    } catch (err) {
      console.error("Annotation save failed:", err);
      toast({ variant: "destructive", title: "Failed to save annotation" });
    }
  };



  const skipTile = async () => {
    if (skipCount >= MAX_SKIP) {
      toast({ variant: "destructive", title: "Skip limit reached" });
      return;
    }
    setAnnotations([]);
    localStorage.removeItem("currentTile");
    localStorage.removeItem("currentAnnotations");
    await fetchAssignedTile();
    setSkipCount((prev) => prev + 1);
  };

  const filteredPastAnnotations = pastAnnotations.filter(
    (a) => a.tileId === selectedTile?.id
  );

  if (loading || !user || loadingTile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  const completeTile = async () => {
  if (!selectedTile || annotations.length === 0) {
    toast({
      variant: "destructive",
      title: "No annotations to submit",
    });
    return;
  }

  try {
    await submitTile({
      tileId: selectedTile.id,
      annotations,
    });

    toast({ title: "Tile submitted successfully ✅" });

    // Clear local data and fetch a new tile
    setAnnotations([]);
    localStorage.removeItem("currentTile");
    localStorage.removeItem("currentAnnotations");
    await fetchAssignedTile();
  } catch (err) {
    console.error("Tile submission failed:", err);
    toast({
      variant: "destructive",
      title: "Failed to submit tile",
    });
  }
};


  return (
    <div className="container mx-auto p-6 space-y-6">
      {newTileAssigned && selectedTile && (
        <div className="bg-yellow-100 p-3 rounded border">
          New tile assigned: <strong>{selectedTile.name || "Untitled"}</strong>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-4">
          <AnnotationToolbar currentTool={currentTool} onToolSelect={setCurrentTool} />

          {selectedTile?.imageUrl ? (
            <div className="relative w-full h-[500px] overflow-hidden border bg-white rounded-xl shadow">
              <img
                src={selectedTile.imageUrl}
                alt={`Tile - ${selectedTile.name}`}
                className="w-full h-full object-cover"
                ref={imageRef}
                onClick={handleImageClick}
              />

              {[...annotations, ...filteredPastAnnotations].map((ann) =>
                ann.type === "point" ? (
                  <div
                    key={ann.id}
                    className="absolute w-4 h-4 bg-red-600 rounded-full border border-white"
                    style={{
                      left: `${ann.data.pixelX}px`,
                      top: `${ann.data.pixelY}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={ann.label}
                  />
                ) : null
              )}

              {[...annotations, ...filteredPastAnnotations].map((ann) =>
                ann.type === "polygon" && Array.isArray(ann.data?.points) ? (
                  <svg
                    key={ann.id}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  >
                    <polygon
                      points={ann.data.points.map((p: any) => `${p.x},${p.y}`).join(" ")}
                      fill="rgba(255, 0, 0, 0.3)"
                      stroke="red"
                      strokeWidth={2}
                    />
                    <text
                      x={ann.data.points[0].x + 5}
                      y={ann.data.points[0].y - 5}
                      fill="red"
                      fontSize="12px"
                    >
                      {ann.label}
                    </text>
                  </svg>
                ) : null
              )}

              {drawingPolygon && polygonPoints.length > 1 && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                  <polygon
                    points={polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="rgba(0,123,255,0.4)"
                    stroke="#007bff"
                    strokeWidth={2}
                  />
                </svg>
              )}
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center bg-gray-100 text-gray-600 border rounded shadow">
              No tile image available.
            </div>
          )}

          {currentTool === "polygon" && drawingPolygon && polygonPoints.length > 2 && (
            <Button
              onClick={() => {
                setCurrentAnnotationData({ points: polygonPoints });
                setCurrentAnnotationType("polygon");
                setIsAnnotationDialogOpen(true);
              }}
              className="mt-2"
            >
              Complete Polygon
            </Button>
          )}

          <div className="flex space-x-4 mt-4">
            <Button onClick={completeTile} disabled={loadingTile}>
              {loadingTile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Submit
            </Button>
            <Button
              onClick={skipTile}
              variant="outline"
              disabled={skipCount >= MAX_SKIP}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip ({skipCount}/{MAX_SKIP})
            </Button>
          </div>

          <Card className="mt-4 shadow">
            <CardHeader>
              <CardTitle>Your Past Annotations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {pastAnnotations.map((a) => (
                  <div key={a.id} className="p-2 border-b">
                    <strong>{a.label || a.type}</strong> at{" "}
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3 space-y-6">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <p>🏅 Level: {level}</p>
              <p>Badges: {badges.join(", ")}</p>
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.map((u, idx) => (
                <div key={u.name} className="p-1">
                  {idx + 1}. {u.name} — {u.count} tiles
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader>
              <CardTitle>Available Tile</CardTitle>
              <CardDescription>{selectedTile?.name || "Untitled"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Status: {selectedTile?.status}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={annotationLabel}
                onChange={(e) => setAnnotationLabel(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={annotationNotes}
                onChange={(e) => setAnnotationNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAnnotationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveAnnotation}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
