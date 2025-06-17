# **App Name**: LiDAR Explorer

## Core Features:

- Tile Viewer: Interactive map display using Mapbox/Leaflet, allowing users to pan, zoom, and explore LiDAR tiles.
- Annotation Tools: Basic annotation tools for users to mark findings on tiles (points, polygons, labels, notes).
- Authentication: User registration and login system with role-based access control (Super Admin and End Users).
- Tile Assignment: Random tile assignment to users, ensuring no overlapping work on the same tile.
- Admin Dashboard: Real-time progress visualization for the Super Admin, showing tile status (available, assigned, completed).
- AI Annotation Assistant: AI Tool for suggesting relevant annotations, based on patterns observed in the LiDAR data. AI will determine whether patterns warrant a suggestion.

## Style Guidelines:

- Primary color: Forest green (#388E3C) for a natural, explorative feel.
- Background color: Light grey (#F0F0F0), provides a neutral backdrop.
- Accent color: Sky blue (#3F51B5), used to highlight interactive elements and progress indicators, to stand out from the background.
- Font pairing: 'Poppins' (sans-serif) for headlines and 'PT Sans' (sans-serif) for body text, creating a clean, readable interface.
- Simple, clear icons representing annotation types (points, polygons, labels) and dashboard actions.
- Tile-based layout for the admin dashboard, providing a clear overview of map progress. The user dashboard should prioritize the map and annotation tools.
- Smooth transitions when zooming and panning on the map. Subtle animations to indicate tile loading and assignment.