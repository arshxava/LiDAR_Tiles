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
import { getAssignedTile, submitTile , markTileAsNoEcho } from "../../service/tiles";
import { getUserAnnotations, getLeaderboard } from "../../service/user";
import { saveAnnotationToDB } from "../../service/annotations";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL;

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  // const [currentTool, setCurrentTool] = useState<"point" | "polygon" | null>(null);
  const [currentTool, setCurrentTool] = useState<"polygon" | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [currentAnnotationData, setCurrentAnnotationData] = useState<any>(null);
  const [currentAnnotationType, setCurrentAnnotationType] =
    useState<AnnotationType | null>(null);
  const [annotationLabel, setAnnotationLabel] = useState("");
  const [annotationPeriod, setAnnotationPeriod] = useState("");
  const [annotationNotes, setAnnotationNotes] = useState("");
  const [skipCount, setSkipCount] = useState(0);
  const MAX_SKIP = 3;

  const [pastAnnotations, setPastAnnotations] = useState<Annotation[]>([]);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<
    { username?: string; name?: string; count: number }[]
  >([]);

  const [newTileAssigned, setNewTileAssigned] = useState(false);
  const [loadingTile, setLoadingTile] = useState(true);
  const [drawingpolygon, setDrawingpolygon] = useState(false);
  const [polygonPoints, setpolygonPoints] = useState<
    { x: number; y: number }[]
  >([]);

  const imageRef = useRef<HTMLImageElement | null>(null);
  console.log("response", user);

  useEffect(() => {
    if (!loading && user) {
      const storedUserId = localStorage.getItem("lastUserId");

      // 🔁 If a different user logs in, clear previous tile/annotations
      if (storedUserId && storedUserId !== user.id) {
        // console.log("🔄 Detected user switch, clearing localStorage data");
        localStorage.removeItem("currentTile");
        localStorage.removeItem("currentAnnotations");
      }

      // 📝 Save the current user ID
      localStorage.setItem("lastUserId", user.id);

      const savedTileRaw = localStorage.getItem("currentTile");
      const savedAnnotations = localStorage.getItem("currentAnnotations");

      let savedTile = null;
      if (savedTileRaw) {
        savedTile = JSON.parse(savedTileRaw);
      }

      const shouldFetchNewTile =
        !savedTile ||
        !savedTile.status ||
        savedTile.status !== "in_progress" ||
        savedTile.assignedTo !== user.id;

      if (shouldFetchNewTile) {
        // console.log("📡 No valid saved tile, calling fetchAssignedTile()");
        fetchAssignedTile();
      } else {
        if (savedTile.imageUrl?.startsWith("/uploads")) {
          savedTile.imageUrl = `${baseUrl}${savedTile.imageUrl}`;
        }

        setSelectedTile(savedTile);
        setLoadingTile(false);
      }

      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }

      fetchUserStats();
    } else if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    if (selectedTile) {
      localStorage.setItem("currentTile", JSON.stringify(selectedTile));
    }
    localStorage.setItem("currentAnnotations", JSON.stringify(annotations));
  }, [selectedTile, annotations]);

  const fetchAssignedTile = async () => {
    if (!user?.id) {
      // console.warn("❗ fetchAssignedTile: user.id not available");
      return;
    }

    try {
      setLoadingTile(true);
      const token = localStorage.getItem("lidarToken");

      if (!token) {
        // console.error("❌ Token not found in localStorage");
        return;
      }

      // console.log("📡 Fetching tile from backend with token:", token);

      const tile = await getAssignedTile(token);
      // console.log("✅ Received tile:", tile);

      if (!tile) {
        // console.warn("⚠️ No tile returned from API");
        return;
      }

      if (tile?._id) tile.id = tile._id;

      if (tile?.imageUrl?.startsWith("/uploads")) {
        tile.imageUrl = `${baseUrl}${tile.imageUrl}`;
      }

      setSelectedTile(tile);
      setNewTileAssigned(true);
    } catch (err) {
      // console.error("❌ fetchAssignedTile error:", err);
      toast({ variant: "destructive", title: "No available tiles" });
    } finally {
      setLoadingTile(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem("lidarToken");
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
      // console.error("Stats fetch error:", err);
    }
  };

  // const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
  //   if (!imageRef.current) return;
  //   const rect = imageRef.current.getBoundingClientRect();
  //   const x = e.clientX - rect.left;
  //   const y = e.clientY - rect.top;

  //   if (currentTool === "point") {
  //     setCurrentAnnotationData({ pixelX: x, pixelY: y });
  //     setCurrentAnnotationType("point");
  //     setIsAnnotationDialogOpen(true);
  //   }

  //   if (currentTool === "polygon") {
  //     setpolygonPoints((prev) => [...prev, { x, y }]);
  //     setDrawingpolygon(true);
  //   }
  // };

  const getScreenPosition = (x: number, y: number) => {
    if (!imageRef.current) return { x, y };
    const rect = imageRef.current.getBoundingClientRect();
    const scale = Math.min(
      rect.width / imageRef.current.naturalWidth,
      rect.height / imageRef.current.naturalHeight
    );
    const offsetX = (rect.width - imageRef.current.naturalWidth * scale) / 2;
    const offsetY = (rect.height - imageRef.current.naturalHeight * scale) / 2;
    return { x: x * scale + offsetX, y: y * scale + offsetY };
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const scale = Math.min(
      rect.width / imageRef.current.naturalWidth,
      rect.height / imageRef.current.naturalHeight
    );
    const offsetX = (rect.width - imageRef.current.naturalWidth * scale) / 2;
    const offsetY = (rect.height - imageRef.current.naturalHeight * scale) / 2;

    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;

    // if (currentTool === "point") {
    //   setCurrentAnnotationData({ pixelX: x, pixelY: y });
    //   setCurrentAnnotationType("point");
    //   setIsAnnotationDialogOpen(true);
    // }

    if (currentTool === "polygon") {
      setpolygonPoints((prev) => [...prev, { x, y }]);
      setDrawingpolygon(true);
    }
  };

  const saveAnnotation = async () => {
    if (
      !selectedTile ||
      !user ||
      !currentAnnotationType ||
      !currentAnnotationData
    )
      return;

    const newAnn: Annotation = {
      tileId: selectedTile.id,
      userId: user.id,
      type: currentAnnotationType,
      data: currentAnnotationData,
      label: annotationLabel,
      notes: annotationNotes,
      period: annotationPeriod, // ✅ Include period
      createdAt: new Date().toISOString(),
    };

    try {
      const savedAnn = await saveAnnotationToDB(newAnn);
      setAnnotations((prev) => [...prev, savedAnn]);

      setAnnotationLabel("");
      setAnnotationNotes("");
      setAnnotationPeriod(""); // ✅ Reset period
      setIsAnnotationDialogOpen(false);
      setCurrentTool(null);
      setpolygonPoints([]);
      setDrawingpolygon(false);
      toast({ title: "Annotation saved ✅" });

      fetchUserStats();
    } catch (err) {
      console.error("❌ Annotation save failed:", err);
      toast({ variant: "destructive", title: "Failed to save annotation" });
    }
  };

  const skipTile = async () => {
    if (skipCount >= MAX_SKIP) {
      toast({ variant: "destructive", title: "Skip limit reached" });
      return;
    }

    try {
      const token = localStorage.getItem("lidarToken");

      if (!token) {
        toast({ variant: "destructive", title: "Auth token missing" });
        return;
      }

      if (!selectedTile?.id) {
        toast({ variant: "destructive", title: "No tile to skip" });
        return;
      }

      // ✅ Send skip request to backend
      const res = await fetch(
        `${baseUrl}/api/tiles/skip/${selectedTile.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to skip tile");
      }

      // 🧹 Clear local state and storage
      setAnnotations([]);
      setSelectedTile(null);
      localStorage.removeItem("currentTile");
      localStorage.removeItem("currentAnnotations");

      // 🔄 Fetch new tile
      await fetchAssignedTile();
      setSkipCount((prev) => prev + 1);
    } catch (error: any) {
      // console.error("❌ Skip tile error:", error);
      toast({
        variant: "destructive",
        title: "Error skipping tile",
        description: error.message,
      });
    }
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
    // console.log("🔍 Starting completeTile function...");

    const validAnnotations = annotations.filter((a) => a && a.type && a.data);
    // console.log("✅ Valid annotations:", validAnnotations);

    if (!selectedTile) {
      // console.log("⛔ No selected tile.");
      toast({
        variant: "destructive",
        title: "No tile selected",
      });
      return;
    }

    if (validAnnotations.length === 0) {
      // console.log("⛔ No valid annotations to submit.");
      toast({
        variant: "destructive",
        title: "No annotations to submit",
      });
      return;
    }

    if (!user?.id) {
      // console.log("⛔ No user logged in.");
      toast({
        variant: "destructive",
        title: "User information missing",
      });
      return;
    }

    try {
      console.log("📦 Submitting annotations:", {
        tileId: selectedTile.id,
        annotations,
        submittedBy: user.id,  // ✅ added user ID
      });

      await submitTile({
        tileId: selectedTile.id,
        annotationIds: annotations.map((a) => a._id),  // ✅ Only send the IDs
        submittedBy: user.id,
      });

      // console.log("✅ Tile submitted successfully");

      toast({ title: "Tile submitted successfully ✅" });

      // console.log("🧹 Clearing annotations and local storage...");
      setAnnotations([]);
      localStorage.removeItem("currentTile");
      localStorage.removeItem("currentAnnotations");

      // console.log("🔄 Fetching next assigned tile...");
      await fetchAssignedTile();

      // console.log("🎉 Tile submission process completed.");
    } catch (err) {
      // console.error("❌ Failed to submit tile:", err);
      toast({
        variant: "destructive",
        title: "Failed to submit tile",
      });
    }
  };


  const markTileAsNoEchoClick = async () => {
    if (!selectedTile) {
      toast({ variant: "destructive", title: "No tile selected" });
      return;
    }

    if (!user?.id) {
      toast({ variant: "destructive", title: "User information missing" });
      return;
    }

    try {
      await markTileAsNoEcho({
        tileId: selectedTile.id,
        submittedBy: user.id,
      });

      toast({ title: "Tile marked as 'No Echo Found' ✅" });

      // Reset state
      setAnnotations([]);
      localStorage.removeItem("currentTile");
      localStorage.removeItem("currentAnnotations");
      await fetchAssignedTile();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to mark tile",
        description: err.message,
      });
    }
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* {newTileAssigned && selectedTile && (
        <div className="bg-yellow-100 p-3 rounded border">
          New tile assigned: <strong>{selectedTile.name || "Untitled"}</strong>
        </div>
      )} */}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-4">
          <AnnotationToolbar
            currentTool={currentTool}
            onToolSelect={setCurrentTool}
          />

          {selectedTile?.imageUrl ? (
            <div className="relative w-full h-[500px] overflow-hidden border bg-white rounded-xl shadow">
              <img
                src={selectedTile.imageUrl}
                alt={`Tile - ${selectedTile.name}`}
                className="w-full h-full object-contain"
                ref={imageRef}
                onClick={handleImageClick}
              />

              {/* {[...annotations, ...filteredPastAnnotations].map((ann) =>
                ann.type === "point" ? (
                  <div
                    key={ann.id}
                    className="absolute w-4 h-4 bg-red-600 rounded-full border border-white"
                    style={{
                      ...(imageRef.current &&
                        (() => {
                          const rect = imageRef.current.getBoundingClientRect();
                          const scale = Math.min(
                            rect.width / imageRef.current.naturalWidth,
                            rect.height / imageRef.current.naturalHeight
                          );

                          const offsetX =
                            (rect.width -
                              imageRef.current.naturalWidth * scale) /
                            2;
                          const offsetY =
                            (rect.height -
                              imageRef.current.naturalHeight * scale) /
                            2;

                          return {
                            left: `${ann.data.pixelX * scale + offsetX}px`,
                            top: `${ann.data.pixelY * scale + offsetY}px`,
                            transform: "translate(-50%, -50%)",
                          };
                        })()),
                    }}
                    title={ann.label}
                  />
                ) : null
              )} */}

              {[...annotations, ...filteredPastAnnotations].map((ann) =>
                ann.type === "polygon" && Array.isArray(ann.data?.points) ? (
                  <svg
                    key={ann.id}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  >
                    {(() => {
                      if (!imageRef.current) return null;

                      const rect = imageRef.current.getBoundingClientRect();
                      const scale = Math.min(
                        rect.width / imageRef.current.naturalWidth,
                        rect.height / imageRef.current.naturalHeight
                      );
                      const offsetX =
                        (rect.width - imageRef.current.naturalWidth * scale) /
                        2;
                      const offsetY =
                        (rect.height - imageRef.current.naturalHeight * scale) /
                        2;

                      const scaledPoints = ann.data.points
                        .map(
                          (p: any) =>
                            `${p.x * scale + offsetX},${p.y * scale + offsetY}`
                        )
                        .join(" ");

                      return (
                        <>
                          <polygon
                            points={scaledPoints}
                            fill="none"
                            stroke="red"
                            strokeWidth={2}
                          />
                          <text
                            x={ann.data.points[0].x * scale + offsetX + 5}
                            y={ann.data.points[0].y * scale + offsetY - 5}
                            fill="red"
                            fontSize="12px"
                          >
                            {ann.label}
                          </text>
                        </>
                      );
                    })()}
                  </svg>
                ) : null
              )}

              {drawingpolygon && polygonPoints.length > 0 && imageRef.current && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                  {(() => {
                    const rect = imageRef.current.getBoundingClientRect();
                    const scale = Math.min(
                      rect.width / imageRef.current.naturalWidth,
                      rect.height / imageRef.current.naturalHeight
                    );
                    const offsetX = (rect.width - imageRef.current.naturalWidth * scale) / 2;
                    const offsetY = (rect.height - imageRef.current.naturalHeight * scale) / 2;

                    const scaled = polygonPoints.map(p => ({
                      x: p.x * scale + offsetX,
                      y: p.y * scale + offsetY
                    }));

                    return (
                      <>
                        {/* Draw small circle at first point */}
                        <circle
                          cx={scaled[0].x}
                          cy={scaled[0].y}
                          r={4}
                          fill="#007bff"
                          stroke="white"
                          strokeWidth={1}
                        />

                        {/* Draw lines between each point */}
                        {scaled.map((point, idx) => {
                          if (idx === 0) return null;
                          const prev = scaled[idx - 1];
                          return (
                            <line
                              key={idx}
                              x1={prev.x}
                              y1={prev.y}
                              x2={point.x}
                              y2={point.y}
                              stroke="#007bff"
                              strokeWidth={2}
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              )}
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center bg-gray-100 text-gray-600 border rounded shadow">
              No tile image available.
            </div>
          )}

          {currentTool === "polygon" && drawingpolygon && polygonPoints.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => {
                  setpolygonPoints((prev) => prev.slice(0, -1));
                }}
                variant="secondary"
              >
                Undo Last Point
              </Button>

              {polygonPoints.length > 2 && (
                <Button
                  onClick={() => {
                    setCurrentAnnotationData({ points: polygonPoints });
                    setCurrentAnnotationType("polygon");
                    setIsAnnotationDialogOpen(true);
                  }}
                >
                  Complete Echo
                </Button>
              )}
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

            <Button
              onClick={markTileAsNoEchoClick}
              variant="outline"
            >
              No Echo Found
            </Button>

          </div>

          <Card className="mt-4 shadow">
            <CardHeader>
              <CardTitle>Your Past Annotations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {pastAnnotations.map((a) => (
                  <div key={a._id || a.id} className="p-2 border-b">
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
              <p>
                <strong>🏅 Level: </strong>
                {level}
              </p>
              <p>
                <strong>Badges: </strong>
                {badges.join(", ")}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader>
              <CardTitle>Leaderboard Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.map((u, idx) => (
                <div key={u.username || idx} className="p-1">
                  {idx + 1}. {u.username} — {u.count} annotations marked
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow">
            <CardHeader>
              <CardTitle>Tile Status</CardTitle>
              {/* <CardDescription>{selectedTile?.name || "Untitled"}</CardDescription> */}
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

            {/* ✅ Label Dropdown */}
            <div>
              <Label>Echo</Label>
              <Select value={annotationLabel} onValueChange={setAnnotationLabel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Road">Road</SelectItem>
                  <SelectItem value="Burial mound">Burial mound</SelectItem>
                  <SelectItem value="Earth wall">Earth wall</SelectItem>
                  <SelectItem value="Stone wall">Stone wall</SelectItem>
                  <SelectItem value="Depression">Depression</SelectItem>
                  <SelectItem value="Erosion ditch">Erosion ditch</SelectItem>
                  <SelectItem value="Charcoal Meier">Charcoal Meier</SelectItem>
                  <SelectItem value="Water infrastructure">Water infrastructure</SelectItem>
                  <SelectItem value="No idea">No idea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Period Dropdown */}
            <div>
              <Label>What period do you think the structure belongs to?</Label>
              <Select
                value={annotationPeriod}
                onValueChange={setAnnotationPeriod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Neolithic or before">
                    Neolithic or before
                  </SelectItem>
                  <SelectItem value="Bronze Age">Bronze Age</SelectItem>
                  <SelectItem value="Iron Age">Iron Age</SelectItem>
                  <SelectItem value="Roman">Roman</SelectItem>
                  <SelectItem value="Medieval">Medieval</SelectItem>
                  <SelectItem value="Modern">Modern</SelectItem>
                  <SelectItem value="No idea">No idea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
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