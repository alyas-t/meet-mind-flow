
import React from 'react';
import { toast } from "@/components/ui/sonner";
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
      description: `${filename} is being downloaded`,
      icon: <Download className="h-4 w-4" />
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
    if (navigator.share) {
      // Use Web Share API if available
      await navigator.share({
        title,
        text,
        url
      });
      
      toast.success("Shared successfully", {
        icon: <Share2 className="h-4 w-4" />
      });
    } else {
      // Fall back to clipboard copy
      await navigator.clipboard.writeText(text);
      
      toast.success("Copied to clipboard", {
        description: "The content has been copied to your clipboard.",
        icon: <Share2 className="h-4 w-4" />
      });
    }
  } catch (error) {
    console.error("Error sharing content:", error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      // User canceled share operation
      toast.info("Share cancelled");
    } else {
      toast.error("Sharing failed", {
        description: "There was a problem sharing the content."
      });
    }
  }
}
