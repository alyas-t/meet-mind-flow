
import React, { useEffect, useState } from 'react';
import summaryService from '@/services/aws/summaryService';

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
  
  useEffect(() => {
    // Only generate key points if there's a substantial amount of transcript
    if (transcript.length > 0 && transcript.length % 2 === 0) {
      const generateKeyPoints = async () => {
        try {
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
        }
      };
      
      generateKeyPoints();
    }
  }, [transcript]);

  if (keyPoints.length === 0) {
    return (
      <div className="bg-white rounded-lg border h-full flex items-center justify-center p-6 text-gray-500">
        <p>Key points and action items will appear here as they are detected...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border h-full overflow-y-auto p-6">
      <h3 className="text-xl font-medium mb-4 pb-2 border-b sticky top-0 bg-white">Key Points & Actions</h3>
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
