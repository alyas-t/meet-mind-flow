
import React, { useEffect, useState } from 'react';
import summaryService from '@/services/aws/summaryService';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface KeyPointsPanelProps {
  transcript: string[];
}

interface KeyPoint {
  id: string;
  text: string;
  type: 'point' | 'action';
}

const KeyPointsPanel: React.FC<KeyPointsPanelProps> = ({ transcript }) => {
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  useEffect(() => {
    // Only generate key points if there's a substantial amount of transcript
    // Use modulo to avoid generating points too frequently
    if (transcript.length > 0 && transcript.length % 5 === 0 && !isGenerating) {
      const generateKeyPoints = async () => {
        try {
          setIsGenerating(true);
          setError(null);
          
          // Get key points from our AWS Bedrock summary service
          const newPoints = await summaryService.generateKeyPoints(transcript);
          
          // Add the key points with unique IDs
          const formattedPoints = newPoints.map(point => ({
            id: Date.now() + Math.random().toString(36).substring(2, 9),
            text: point.text,
            type: point.type
          }));
          
          setKeyPoints(prev => [...prev, ...formattedPoints]);
        } catch (error) {
          console.error("Error generating key points:", error);
          if (error instanceof Error) {
            if (error.message.includes("security token") || error.message.includes("invalid")) {
              setError("AWS security token is invalid. Using simulated key points.");
            } else if (error.message.includes("AWS credentials expired")) {
              setError("AWS credentials have expired. Using simulated key points.");
            } else {
              setError("Could not connect to AI services. Using simulated key points.");
            }
          }
          
          // Generate mock key points regardless of error
          try {
            const mockPoints = await summaryService.generateMockKeyPoints(transcript);
            const formattedMockPoints = mockPoints.map(point => ({
              id: Date.now() + Math.random().toString(36).substring(2, 9),
              text: point.text,
              type: point.type
            }));
            setKeyPoints(prev => [...prev, ...formattedMockPoints]);
          } catch (mockError) {
            console.error("Failed to generate even mock key points:", mockError);
          }
        } finally {
          setIsGenerating(false);
        }
      };
      
      generateKeyPoints();
    }
  }, [transcript, isGenerating]);

  if (keyPoints.length === 0) {
    return (
      <div className="bg-white rounded-lg border h-full flex flex-col items-center justify-center p-6 text-gray-500">
        {error ? (
          <div className="text-amber-600 flex flex-col items-center text-center">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-2">Key points will be simulated instead.</p>
          </div>
        ) : (
          <p>Key points and action items will appear here as they are detected...</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border h-full overflow-y-auto p-6">
      <h3 className="text-xl font-medium mb-4 pb-2 border-b sticky top-0 bg-white">Key Points & Actions</h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {keyPoints.map((point) => (
          <div 
            key={point.id} 
            className={`p-3 rounded-md animate-fade-in ${
              point.type === 'action' 
                ? 'bg-app-blue bg-opacity-10 border-l-4 border-app-blue' 
                : 'bg-gray-50'
            }`}
          >
            <p className={`${point.type === 'action' ? 'font-medium' : ''}`}>{point.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyPointsPanel;
