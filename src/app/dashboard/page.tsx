"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<"point" | "polygon" | null>(
    null
  );
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [currentAnnotationData, setCurrentAnnotationData] = useState<any>(null);
  const [currentAnnotationType, setCurrentAnnotationType] =
    useState<AnnotationType | null>(null);
  const [annotationLabel, setAnnotationLabel] = useState("");
  const [annotationNotes, setAnnotationNotes] = useState("");
  const [skipCount, setSkipCount] = useState(0);
  const MAX_SKIP = 3;

  const [pastAnnotations, setPastAnnotations] = useState<Annotation[]>([]);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<
    { name: string; count: number }[]
  >([]);
  const [newTileAssigned, setNewTileAssigned] = useState(false);
  const [loadingTile, setLoadingTile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user) {
      fetchAssignedTile();
      fetchUserStats();
    }
  }, [user, loading]);

  const fetchAssignedTile = async () => {
    if (!user?.id) return;
    try {
      setLoadingTile(true);
      const token = localStorage.getItem("token");
      const tile = await getAssignedTile(token);
      if (tile?.imageUrl && tile.imageUrl.startsWith("/uploads")) {
        tile.imageUrl = `http://localhost:5000${tile.imageUrl}`;
      }
      setSelectedTile(tile);
      console.log("🧩 Selected tile:", tile);
      setSelectedTile(tile);
      setNewTileAssigned(true);
    } catch (err) {
      console.error("Tile assignment error:", err);
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

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (currentTool === "point" && selectedTile && e.latLng) {
        setCurrentAnnotationData({
          coordinates: { lat: e.latLng.lat(), lng: e.latLng.lng() },
        });
        setCurrentAnnotationType("point");
        setIsAnnotationDialogOpen(true);
      }
    },
    [currentTool, selectedTile]
  );

  const handleAnnotationComplete = useCallback(
    (data: any) => {
      if (currentTool === "polygon") {
        setCurrentAnnotationData(data);
        setCurrentAnnotationType("polygon");
        setIsAnnotationDialogOpen(true);
      }
    },
    [currentTool]
  );

  const saveAnnotation = () => {
    if (
      !selectedTile ||
      !user ||
      !currentAnnotationType ||
      !currentAnnotationData
    )
      return;

    const newAnn: Annotation = {
      id: Date.now().toString(),
      tileId: selectedTile.id,
      userId: user.id,
      type: currentAnnotationType,
      data: currentAnnotationData,
      label: annotationLabel,
      notes: annotationNotes,
      createdAt: new Date().toISOString(),
    };
    setAnnotations((prev) => [...prev, newAnn]);
    setAnnotationLabel("");
    setAnnotationNotes("");
    setIsAnnotationDialogOpen(false);
    setCurrentTool(null);
    toast({ title: "Annotation Added" });
  };

  const completeTile = async () => {
    if (!selectedTile) return;
    try {
      const token = localStorage.getItem("token");
      await submitTile({ tileId: selectedTile.id, annotations }, token);
      toast({ title: "Tile Completed!" });
      await fetchAssignedTile();
      setAnnotations([]);
      fetchUserStats();
    } catch (err) {
      toast({ variant: "destructive", title: "Error submitting tile" });
    }
  };

  const skipTile = async () => {
    if (skipCount >= MAX_SKIP) {
      toast({ variant: "destructive", title: "Skip limit reached" });
      return;
    }
    await fetchAssignedTile();
    setSkipCount((prev) => prev + 1);
  };

  if (loading || !user || loadingTile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {newTileAssigned && selectedTile && (
        <div className="bg-yellow-100 p-3 rounded border">
          New tile assigned: <strong>{selectedTile.name || "Untitled"}</strong>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-4">
          <AnnotationToolbar
            currentTool={currentTool}
            onToolSelect={setCurrentTool}
          />

          {selectedTile?.imageUrl ? (
            <div className="border bg-white rounded-xl overflow-hidden shadow h-[500px]">
              <img
                src={selectedTile.imageUrl}
                alt={`Tile - ${selectedTile.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center bg-gray-100 text-gray-600 border rounded shadow">
              No tile image available.
            </div>
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
              <CardDescription>
                {selectedTile?.name || "Untitled"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Status: {selectedTile?.status}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isAnnotationDialogOpen}
        onOpenChange={setIsAnnotationDialogOpen}
      >
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
