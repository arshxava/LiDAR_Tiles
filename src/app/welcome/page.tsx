"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MountainSnow } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col items-center p-6">
      
      {/* Hero Section */}
      <div className="text-center mt-20 mb-10">
        <div className="flex justify-center mb-4">
          <MountainSnow className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-headline text-foreground mb-4">
          Welcome to LiDAR Explorer
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          Explore and annotate 3D LiDAR data with powerful tools and collaborative features.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <Button
          className="px-6 py-4 text-lg"
          onClick={() => router.push("/register")}
        >
          Sign Up
        </Button>
        <Button
          className="px-6 py-4 text-lg"
          variant="outline"
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
       <Button onClick={() => router.push("/contactus")}>Contact Us</Button>
      </div>
    </div>
  );
}
