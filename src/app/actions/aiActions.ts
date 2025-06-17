"use server";

import { suggestAnnotations as suggestAnnotationsFlow, type SuggestAnnotationsInput, type SuggestAnnotationsOutput } from '@/ai/flows/suggest-annotations';

export async function suggestAnnotations(input: SuggestAnnotationsInput): Promise<SuggestAnnotationsOutput> {
  // You might add additional validation, logging, or error handling here
  try {
    const result = await suggestAnnotationsFlow(input);
    return result;
  } catch (error) {
    console.error("Error in suggestAnnotations server action:", error);
    // It's good practice to not expose raw error messages to the client
    // For a production app, map to a user-friendly error or log and return a generic message
    if (error instanceof Error) {
      throw new Error(`AI Annotation suggestion failed: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while suggesting annotations.");
  }
}
