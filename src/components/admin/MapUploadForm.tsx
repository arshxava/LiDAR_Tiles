// "use client";

// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import { UploadCloud, Loader2 } from "lucide-react";

// export default function MapUploadForm() {
//   const [mapFile, setMapFile] = useState<File | null>(null);
//   const [mapName, setMapName] = useState("");
//   const [mapDescription, setMapDescription] = useState("");
//   const [minLat, setMinLat] = useState("");
//   const [maxLat, setMaxLat] = useState("");
//   const [minLng, setMinLng] = useState("");
//   const [maxLng, setMaxLng] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const { toast } = useToast();
// const token = localStorage.getItem("lidarToken");
//    const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL ;

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files[0]) {
//       setMapFile(event.target.files[0]);
//     } else {
//       setMapFile(null);
//     }
//   };

//  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//   event.preventDefault();

//   if (!mapFile || !mapName.trim()) {
//     toast({
//       variant: "destructive",
//       title: "All fields required",
//       description: "Please provide the map name and file.",
//     });
//     return;
//   }

// const token = localStorage.getItem("lidarToken");

//   if (!token) {
//     toast({
//       variant: "destructive",
//       title: "Unauthorized",
//       description: "Please login to upload maps.",
//     });
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", mapFile);
//   formData.append("name", mapName);
//   formData.append("description", mapDescription);
//   formData.append("minLat", minLat);
//   formData.append("maxLat", maxLat);
//   formData.append("minLng", minLng);
//   formData.append("maxLng", maxLng);
//   formData.append("tileSizeKm", "10");
//   formData.append("fileType", mapFile.name.split('.').pop()?.toLowerCase() || "");


//   setIsUploading(true);
//   // console.log("token",token)
//   try {
//     const res = await fetch(`${baseUrl}/api/maps/upload`, {
//       method: "POST",
//       body: formData,
//       headers: {
//         Authorization: `Bearer ${token}`, // ✅ Important
//         // DO NOT manually set Content-Type when using FormData
//       },

//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data?.msg || "Upload failed");
//     }

//     toast({
//       title: "Map uploaded successfully",
//       description: `${data.name} has been processed.`,
//     });

//     // Reset form
//     setMapFile(null);
//     setMapName("");
//     setMapDescription("");
//     setMinLat("");
//     setMaxLat("");
//     setMinLng("");
//     setMaxLng("");
//     const fileInput = document.getElementById(
//       "map-file-input"
//     ) as HTMLInputElement;
//     if (fileInput) fileInput.value = "";
//   } catch (err) {
//     toast({
//       variant: "destructive",
//       title: "Upload Failed",
//       description: (err as any)?.message || "Something went wrong",
//     });
//   }
//   setIsUploading(false);
// };


//   return (
//     <Card className="shadow-lg">
//       <CardHeader>
//         <div className="flex items-center space-x-2">
//           <UploadCloud className="h-6 w-6 text-primary" />
//           <CardTitle className="font-headline">Upload New LiDAR Map</CardTitle>
//         </div>
//         <CardDescription>
//   Upload a GeoTIFF, ASC, LAS, or LAZ file and define its properties.
// </CardDescription>

//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <Label htmlFor="map-file-input">Map File</Label>
//             <Input
//   id="map-file-input"
//   type="file"
//   onChange={handleFileChange}
//   accept=".tif,.tiff,.asc,.las,.laz,image/*"  
//   required
//   className="mt-1"
// />

//             {mapFile && (
//               <p className="text-xs text-muted-foreground mt-1">
//                 Selected: {mapFile.name}
//               </p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="map-name">Map Name</Label>
//             <Input
//               id="map-name"
//               value={mapName}
//               onChange={(e) => setMapName(e.target.value)}
//               placeholder="e.g., San Francisco Bay Area LiDAR"
//               required
//               className="mt-1"
//             />
//           </div>

//           <div>
//             <Label htmlFor="map-description">Map Description (Optional)</Label>
//             <Textarea
//               id="map-description"
//               value={mapDescription}
//               onChange={(e) => setMapDescription(e.target.value)}
//               placeholder="Brief description of the map or dataset"
//               className="mt-1"
//             />
//           </div>
// {!['las','laz'].includes(mapFile?.name.split('.').pop()?.toLowerCase() || '') && (
//           <fieldset className="space-y-4 rounded-md border p-4">
//             <legend className="-ml-1 px-1 text-sm font-medium text-foreground">
//               Geographic Bounds
//             </legend>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="min-lat">Min Latitude</Label>
//                 <Input
//                   id="min-lat"
//                   type="number"
//                   step="any"
//                   value={minLat}
//                   onChange={(e) => setMinLat(e.target.value)}
//                   placeholder="e.g., 37.0000"
//                   required
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="max-lat">Max Latitude</Label>
//                 <Input
//                   id="max-lat"
//                   type="number"
//                   step="any"
//                   value={maxLat}
//                   onChange={(e) => setMaxLat(e.target.value)}
//                   placeholder="e.g., 38.0000"
//                   required
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="min-lng">Min Longitude</Label>
//                 <Input
//                   id="min-lng"
//                   type="number"
//                   step="any"
//                   value={minLng}
//                   onChange={(e) => setMinLng(e.target.value)}
//                   placeholder="e.g., -123.0000"
//                   required
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="max-lng">Max Longitude</Label>
//                 <Input
//                   id="max-lng"
//                   type="number"
//                   step="any"
//                   value={maxLng}
//                   onChange={(e) => setMaxLng(e.target.value)}
//                   placeholder="e.g., -122.0000"
//                   required
//                   className="mt-1"
//                 />
//               </div>
//             </div>
//             <p className="text-xs text-muted-foreground">
//               Define the bounding box for the map. This will be used for tile
//               generation.
//             </p>
//           </fieldset>
// )}
//           <Button
//             type="submit"
//             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
//             disabled={isUploading}
//           >
//             {isUploading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Uploading...
//               </>
//             ) : (
//               <>
//                 <UploadCloud className="mr-2 h-4 w-4" />
//                 Upload and Process Map
//               </>
//             )}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
  // }
  "use client";

  import React, { useState, useEffect } from "react";
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
  import { Progress } from "@/components/ui/progress";

  export default function MapUploadForm() {
    const [mapFile, setMapFile] = useState<File | null>(null);
    const [mapName, setMapName] = useState("");
    const [mapDescription, setMapDescription] = useState("");
    const [minLat, setMinLat] = useState("");
    const [maxLat, setMaxLat] = useState("");
    const [minLng, setMinLng] = useState("");
    const [maxLng, setMaxLng] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentStatus, setCurrentStatus] = useState("");
    const [mapId, setMapId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const token = localStorage.getItem("lidarToken");
    const baseUrl = process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL;
const [mapUrl, setMapUrl] = useState("");
 


    // Poll for upload status
    useEffect(() => {
      if (!mapId) return;

      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${baseUrl}/api/maps/status/${mapId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();

          setCurrentStatus(data.status);
          setUploadProgress(data.progress);

          if (data.status === "completed" || data.status === "failed") {
            clearInterval(interval);
            setIsUploading(false);

            if (data.status === "completed") {
              toast({
                title: "Processing complete",
                description: `Created ${data.tileCount} tiles`,
              });
            }
          }
        } catch (err) {
          console.error("Status check failed:", err);
        }
      }, 5000);

      return () => clearInterval(interval);
    }, [mapId, token, baseUrl, toast]);

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if ((!mapFile && !mapUrl.trim()) || !mapName.trim()) {
    toast({
      variant: "destructive",
      title: "All fields required",
      description: "Please provide either a map file or a file URL along with the map name.",
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

  // If using a URL instead of file
  if (mapUrl.trim()) {
    try {
      const res = await fetch(`${baseUrl}/api/maps/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: mapUrl,
          name: mapName,
          description: mapDescription,
          minLat,
          maxLat,
          minLng,
          maxLng,
          tileSizeKm: 10,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Map submitted",
          description: "Your map link has been queued for processing.",
        });
        resetForm();
      } else {
        throw new Error(data.message || "Failed to submit map link");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
    return;
  }

  const fileExtension = mapFile.name.split('.').pop()?.toLowerCase() || '';
  const isLidarFile = ['las', 'laz', 'zip', 'tar'].includes(fileExtension);
  console.log("File extension:", fileExtension, "isLidarFile:", isLidarFile);

  const formData = new FormData();
  formData.append("file", mapFile);
  formData.append("name", mapName);
  formData.append("description", mapDescription);

  if (!isLidarFile) {
    console.log("Appending geographic bounds:", { minLat, maxLat, minLng, maxLng });
    formData.append("minLat", minLat);
    formData.append("maxLat", maxLat);
    formData.append("minLng", minLng);
    formData.append("maxLng", maxLng);
    formData.append("tileSizeKm", "10");
  }

  setIsUploading(true);
  setCurrentStatus("uploading");
  setUploadProgress(0);

  console.time("Total upload time");
  console.time("Network upload time");

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/api/maps/upload`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        console.log(`Upload progress: ${percent}%`);
        setUploadProgress(percent);
        setCurrentStatus(percent === 100 ? "Processing..." : "Uploading...");

        if (percent === 100) {
          console.timeEnd("Network upload time");
          console.time("Server processing time");
        }
      }
    };

    xhr.onload = () => {
      console.log("XHR load event, status:", xhr.status);
      console.timeEnd("Total upload time");

      if (xhr.status >= 200 && xhr.status < 300) {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
          console.log("Server response:", data);
        } catch (err) {
          console.error("Invalid JSON from server:", xhr.responseText);
          throw new Error("Invalid server response");
        }

        if (data.mapId) {
          console.timeEnd("Server processing time");
          setMapId(data.mapId);
          setCurrentStatus("processing");
          toast({
            title: "Upload started",
            description: "Your file is being processed in the background.",
          });
        } else {
          console.log("Upload complete without mapId, assuming final state.");
          toast({
            title: "Upload complete",
            description: `${data.name || "Map"} has been processed.`,
          });
          resetForm();
        }
      } else {
        console.error("XHR error response:", xhr.responseText);
        try {
          const errData = JSON.parse(xhr.responseText);
          throw new Error(errData.message || `Server error: ${xhr.status}`);
        } catch {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      console.error("Network error during upload");
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Please check your internet connection and try again.",
      });
      setIsUploading(false);
      setCurrentStatus("");
    };

    console.log("Sending form data...");
    xhr.send(formData);
  } catch (error) {
    console.error("Upload failed:", error);
    toast({
      variant: "destructive",
      title: "Upload failed",
      description: error instanceof Error ? error.message : "Unknown error occurred",
    });
    setIsUploading(false);
    setCurrentStatus("");
  }
};



    const resetForm = () => {
  setMapFile(null);
  setMapUrl(""); // <--- reset URL too
  setMapName("");
  setMapDescription("");
  setMinLat("");
  setMaxLat("");
  setMinLng("");
  setMaxLng("");
  setUploadProgress(0);
  setCurrentStatus("");
  setMapId("");
  const fileInput = document.getElementById("map-file-input") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
  setIsUploading(false);
};


    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UploadCloud className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Link New LiDAR Map</CardTitle>
          </div>
          <CardDescription>
            paste a link to a map archive (.tar/.zip)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
         <div>
  <Label htmlFor="map-url">Map URL</Label>
  <Input
    id="map-url"
    type="url"
    value={mapUrl}
    onChange={(e) => setMapUrl(e.target.value)}
    placeholder="https://lidar-map-ti."
    className="mt-1"
  />
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

            {!mapUrl &&!['las', 'laz', 'tar', 'zip'].includes(mapFile?.name.split('.').pop()?.toLowerCase() || '') && (
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

              </fieldset>
            )}

            {(isUploading || currentStatus) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status: {currentStatus || "Uploading..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStatus === "completed" ? "Finalizing..." : "Processing..."}
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