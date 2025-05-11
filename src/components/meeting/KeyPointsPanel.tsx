
// src/components/KeyPointsPanel.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KeyPointsPanelProps {
  keyPoints: string[];
  actionItems: string[];
  isLoading: boolean;
  error: string;
}

const KeyPointsPanel: React.FC<KeyPointsPanelProps> = ({ 
  keyPoints, 
  actionItems, 
  isLoading, 
  error 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meeting Insights</CardTitle>
        <CardDescription>AI-generated summary of your meeting</CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing meeting content...</p>
          </div>
        ) : (
          <>
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                  {keyPoints.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1.5">
                      {keyPoints.map((point, index) => (
                        <li key={index} className="text-sm">{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No key points generated yet.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Action Items</h3>
                  {actionItems.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1.5">
                      {actionItems.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No action items identified.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyPointsPanel;
