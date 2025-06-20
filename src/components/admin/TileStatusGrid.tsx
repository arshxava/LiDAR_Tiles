// "use client";

// import type { Tile } from '@/types';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { CheckCircle2, Clock, Package, UserCircle } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';

// interface TileStatusGridProps {
//   tiles: Tile[];
// }

// const TileStatusIcon = ({ status }: { status: Tile['status'] }) => {
//   switch (status) {
//     case 'available':
//       return <Package className="h-5 w-5 text-green-500" />;
//     case 'assigned':
//       return <Clock className="h-5 w-5 text-blue-500" />;
//     case 'completed':
//       return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
//     default:
//       return null;
//   }
// };

// export default function TileStatusGrid({ tiles }: TileStatusGridProps) {
//   if (tiles.length === 0) {
//     return <p className="text-muted-foreground">No tiles found.</p>;
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//       {tiles.map((tile) => (
//         <Card key={tile.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
//           <CardHeader className="pb-3">
//             <div className="flex justify-between items-start">
//               <CardTitle className="text-lg font-headline mb-1">{tile.name}</CardTitle>
//               <TileStatusIcon status={tile.status} />
//             </div>
//             <CardDescription className="text-xs">ID: {tile.id}</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             <Badge 
//               variant={
//                 tile.status === 'available' ? 'default' : 
//                 tile.status === 'assigned' ? 'secondary' : 
//                 'outline'
//               }
//               className={`
//                 ${tile.status === 'available' ? 'bg-green-100 text-green-700 border-green-300' : ''}
//                 ${tile.status === 'assigned' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
//                 ${tile.status === 'completed' ? 'bg-purple-100 text-purple-700 border-purple-300' : ''}
//               `}
//             >
//               Status: {tile.status.charAt(0).toUpperCase() + tile.status.slice(1)}
//             </Badge>
//             {tile.assignedTo && (
//               <div className="flex items-center text-sm text-muted-foreground">
//                 <UserCircle className="h-4 w-4 mr-1.5 text-primary" />
//                 Assigned to: User {tile.assignedTo.substring(0,5)}... {/* Mocking user name */}
//               </div>
//             )}
//             {tile.previewImageUrl && (
//               <img 
//                 src={tile.previewImageUrl} 
//                 alt={`Preview of ${tile.name}`} 
//                 data-ai-hint="map tile preview" 
//                 className="mt-2 rounded-md aspect-video object-cover w-full"
//               />
//             )}
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
// components/TileStatusGrid.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const statusIcons = {
  available: <AlertTriangle className="text-yellow-500 w-4 h-4 mr-1" />,
  in_progress: <Loader2 className="text-blue-500 w-4 h-4 mr-1 animate-spin" />,
  completed: <CheckCircle className="text-green-500 w-4 h-4 mr-1" />,
};

export default function TileStatusGrid({ tiles }) {
  if (!tiles?.length) return <p className="text-muted">No tiles to display.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {tiles.map((tile, idx) => (
        <Card key={tile._id || idx}>
          <CardHeader>
            <CardTitle className="text-sm">
              Tile ID:{" "}
              <span className="text-muted-foreground">
                {tile._id ? tile._id.slice(-5) : "N/A"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <div>
                <strong>Bounds:</strong>
                {Array.isArray(tile.bounds) && tile.bounds.length === 4 ? (
                  <div className="text-xs mt-1">
                    <div>Lat: {tile.bounds[1].toFixed(4)} - {tile.bounds[3].toFixed(4)}</div>
                    <div>Lng: {tile.bounds[0].toFixed(4)} - {tile.bounds[2].toFixed(4)}</div>
                  </div>
                ) : (
                  <div className="text-red-400 text-xs">Invalid bounds</div>
                )}
              </div>
              <div className="mt-2 flex items-center text-xs">
                {statusIcons[tile.status] || null}
                <Badge variant="outline" className="ml-1">{tile.status}</Badge>
              </div>
              {tile.assignedTo && (
                <div className="flex items-center mt-1 text-primary text-xs">
                  <UserIcon className="w-3 h-3 mr-1" />
                  Assigned to: {tile.assignedTo.name || tile.assignedTo.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

