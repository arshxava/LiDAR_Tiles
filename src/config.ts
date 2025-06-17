export const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

if (!NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.warn(
    "Google Maps API key is not set. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file."
  );
}
