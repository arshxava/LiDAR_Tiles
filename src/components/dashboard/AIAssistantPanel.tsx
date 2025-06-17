"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestAnnotations as suggestAnnotationsAction } from '@/app/actions/aiActions'; // Server Action
import type { AISuggestion } from '@/types';

interface AIAssistantPanelProps {
  onSuggestionLoaded: (geoJsonString: string) => void;
}

export default function AIAssistantPanel({ onSuggestionLoaded }: AIAssistantPanelProps) {
  const [lidarFile, setLidarFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLidarFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!lidarFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a LiDAR data file.' });
      return;
    }
    if (!instructions.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide annotation instructions.' });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(lidarFile);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        if (!base64Data) {
          throw new Error("Failed to read file data.");
        }
        
        const result = await suggestAnnotationsAction({
          lidarData: base64Data,
          annotationInstructions: instructions,
        });
        
        setSuggestion(result);
        toast({ title: 'AI Suggestion Ready', description: 'Annotations suggested by AI.' });
      };
      reader.onerror = () => {
        throw new Error("Error reading file.");
      };
    } catch (error: any) {
      console.error("AI suggestion error:", error);
      toast({ variant: 'destructive', title: 'AI Suggestion Failed', description: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadOnMap = () => {
    if (suggestion?.suggestedAnnotations) {
      onSuggestionLoaded(suggestion.suggestedAnnotations);
      toast({ title: 'Suggestions Loaded', description: 'AI suggestions are now visible on the map.' });
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-accent" />
          <CardTitle className="font-headline">AI Annotation Assistant</CardTitle>
        </div>
        <CardDescription>Get AI-powered suggestions for your LiDAR data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="lidar-file" className="text-sm font-medium">LiDAR Data File</Label>
          <Input id="lidar-file" type="file" onChange={handleFileChange} className="mt-1" accept=".las,.laz,.pcd,image/*" />
          <p className="text-xs text-muted-foreground mt-1">Upload your LiDAR data (e.g., .las, .laz, .pcd, or image representation for demo).</p>
        </div>
        <div>
          <Label htmlFor="instructions" className="text-sm font-medium">Annotation Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="e.g., 'Identify all buildings and vegetation over 2 meters height'"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1 min-h-[80px]"
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading || !lidarFile || !instructions.trim()} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Suggestions...
            </>
          ) : (
            'Get AI Suggestions'
          )}
        </Button>
      </CardContent>
      {suggestion && (
        <CardFooter className="flex flex-col items-start space-y-3 pt-4 border-t">
          <div>
            <h4 className="font-semibold text-foreground">AI Reasoning:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestion.reasoning}</p>
          </div>
           {/* For brevity, we might not display raw GeoJSON directly in UI unless needed for debugging */}
          {/* <div>
            <h4 className="font-semibold text-foreground">Suggested Annotations (GeoJSON):</h4>
            <pre className="text-xs bg-muted p-2 rounded-md max-h-40 overflow-auto">{suggestion.suggestedAnnotations}</pre>
          </div> */}
          <Button onClick={handleLoadOnMap} variant="outline" className="w-full">Load Suggestions on Map</Button>
        </CardFooter>
      )}
    </Card>
  );
}
