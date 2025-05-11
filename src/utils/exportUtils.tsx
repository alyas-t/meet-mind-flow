
import React from 'react';
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";

/**
 * Downloads text content as a file
 */
export function downloadAsFile(content: string, filename: string, type: string = "text/plain") {
  try {
    // Create blob from content
    const blob = new Blob([content], { type });
    
    // Create URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    
    // Append to body, click to download, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Release the URL object
    URL.revokeObjectURL(url);
    
    toast.success("Download started", {
      description: `${filename} is being downloaded`
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    toast.error("Download failed", {
      description: "There was a problem downloading the file."
    });
  }
}

/**
 * Shares content using the Web Share API if available
 * Falls back to copying to clipboard if sharing is not available
 */
export async function shareContent(title: string, text: string, url?: string) {
  try {
    // Check if Web Share API is available and in a secure context (HTTPS)
    if (navigator.share && window.isSecureContext) {
      try {
        // Use Web Share API
        await navigator.share({
          title,
          text,
          url
        });
        
        toast.success("Shared successfully");
        return;
      } catch (shareError) {
        console.error("Error with Web Share API:", shareError);
        // If user cancelled sharing, don't proceed to clipboard
        if (shareError instanceof DOMException && shareError.name === 'AbortError') {
          toast.info("Share cancelled");
          return;
        }
        // For other errors like permission denied, fall back to clipboard
      }
    }
    
    // Fall back to clipboard copy
    await navigator.clipboard.writeText(text);
    
    toast.success("Copied to clipboard", {
      description: "The content has been copied to your clipboard."
    });
  } catch (error) {
    console.error("Error sharing content:", error);
    toast.error("Sharing failed", {
      description: "Unable to share or copy content. Try again or use another method."
    });
  }
}
