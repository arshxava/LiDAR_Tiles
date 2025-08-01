
"use client";

import {
  // MapPin,
  DraftingCompass,
  MousePointer2,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnnotationToolbarProps {
  // currentTool: "point" | "polygon" | null;
  currentTool:  "polygon" | null;
  // onToolSelect: (tool: "point" | "polygon" | null) => void;
  onToolSelect: ( "Echo" | null);
  onClearAnnotations?: () => void;
}

const tools = [
  { id: "cursor", name: "Select", icon: MousePointer2, tool: null },
  // { id: "point", name: "Point", icon: MapPin, tool: "point" },
  { id: "polygon", name: "Echo", icon: DraftingCompass, tool: "polygon" },
];

export default function AnnotationToolbar({
  currentTool,
  onToolSelect,
  onClearAnnotations,
}: AnnotationToolbarProps) {
  return (
    <TooltipProvider>
      <div className="bg-card p-2 rounded-lg shadow-md flex space-x-1">
        {tools.map((toolItem) => (
          <Tooltip key={toolItem.id}>
            <TooltipTrigger asChild>
              <Button
                variant={currentTool === toolItem.tool ? "default" : "outline"}
                size="icon"
                onClick={() => onToolSelect(toolItem.tool)}
                className={`${
                  currentTool === toolItem.tool
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                } w-10 h-10`}
              >
                <toolItem.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{toolItem.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {onClearAnnotations && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onClearAnnotations}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive w-10 h-10"
              >
                <Eraser className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Clear Annotations</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
