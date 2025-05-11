
import React from 'react';
import { toast } from "sonner";
import { Download } from "lucide-react";

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
