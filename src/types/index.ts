export type Role = 'SUPER_ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  username: string;
}

export type TileStatus = 'available' | 'assigned' | 'completed';

export interface Tile {
  id: string;
  name: string;
  status: TileStatus;
  assignedTo?: string; // User ID
  dataUrl?: string; // URL or reference to LiDAR data
  previewImageUrl?: string; // URL for a preview image
  center: { lat: number; lng: number }; // For map display
  zoom: number;
}

export type AnnotationType = 'point' | 'polygon' | 'label' | 'note';

export interface Annotation {
  id: string;
  tileId: string;
  userId: string;
  type: AnnotationType;
  data: any; // GeoJSON feature or similar structure
  label?: string;
  notes?: string;
  createdAt: string;
}

// For AI Assistant
export interface AISuggestion {
  suggestedAnnotations: string; // GeoJSON string
  reasoning: string;
}
