"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";

export default function MapUploadForm() {
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [mapName, setMapName] = useState("");
  const [mapDescription, setMapDescription] = useState("");
  const [minLat, setMinLat] = useState("");
  const [maxLat, setMaxLat] = useState("");
  const [minLng, setMinLng] = useState("");
  const [maxLng, setMaxLng] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
const token = localStorage.getItem("lidarToken");
   const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL ;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMapFile(event.target.files[0]);
    } else {
      setMapFile(null);
    }
  };

 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!mapFile || !mapName.trim()) {
    toast({
      variant: "destructive",
      title: "All fields required",
      description: "Please provide the map name and file.",
    });
    return;
  }

const token = localStorage.getItem("lidarToken");

  if (!token) {
    toast({
      variant: "destructive",
      title: "Unauthorized",
      description: "Please login to upload maps.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", mapFile);
  formData.append("name", mapName);
  formData.append("description", mapDescription);
  formData.append("minLat", minLat);
  formData.append("maxLat", maxLat);
  formData.append("minLng", minLng);
  formData.append("maxLng", maxLng);
  formData.append("tileSizeKm", "10");

  setIsUploading(true);
  // console.log("token",token)
  try {
    const res = await fetch(`${baseUrl}/api/maps/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Important
        // DO NOT manually set Content-Type when using FormData
      },
      
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.msg || "Upload failed");
    }

    toast({
      title: "Map uploaded successfully",
      description: `${data.name} has been processed.`,
    });

    // Reset form
    setMapFile(null);
    setMapName("");
    setMapDescription("");
    setMinLat("");
    setMaxLat("");
    setMinLng("");
    setMaxLng("");
    const fileInput = document.getElementById(
      "map-file-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: (err as any)?.message || "Something went wrong",
    });
  }
  setIsUploading(false);
};


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UploadCloud className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">Upload New LiDAR Map</CardTitle>
        </div>
        <CardDescription>
          Upload a GeoTIFF or raster map file and define its properties. This
          will simulate the upload and tiling process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="map-file-input">Map File</Label>
            <Input
              id="map-file-input"
              type="file"
              onChange={handleFileChange}
              accept=".tif,.tiff,.asc,image/*"
              required
              className="mt-1"
            />
            {mapFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {mapFile.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="map-name">Map Name</Label>
            <Input
              id="map-name"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="e.g., San Francisco Bay Area LiDAR"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="map-description">Map Description (Optional)</Label>
            <Textarea
              id="map-description"
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              placeholder="Brief description of the map or dataset"
              className="mt-1"
            />
          </div>

          <fieldset className="space-y-4 rounded-md border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium text-foreground">
              Geographic Bounds
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-lat">Min Latitude</Label>
                <Input
                  id="min-lat"
                  type="number"
                  step="any"
                  value={minLat}
                  onChange={(e) => setMinLat(e.target.value)}
                  placeholder="e.g., 37.0000"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-lat">Max Latitude</Label>
                <Input
                  id="max-lat"
                  type="number"
                  step="any"
                  value={maxLat}
                  onChange={(e) => setMaxLat(e.target.value)}
                  placeholder="e.g., 38.0000"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="min-lng">Min Longitude</Label>
                <Input
                  id="min-lng"
                  type="number"
                  step="any"
                  value={minLng}
                  onChange={(e) => setMinLng(e.target.value)}
                  placeholder="e.g., -123.0000"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-lng">Max Longitude</Label>
                <Input
                  id="max-lng"
                  type="number"
                  step="any"
                  value={maxLng}
                  onChange={(e) => setMaxLng(e.target.value)}
                  placeholder="e.g., -122.0000"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Define the bounding box for the map. This will be used for tile
              generation.
            </p>
          </fieldset>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload and Process Map
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
