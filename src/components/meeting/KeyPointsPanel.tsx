
import React, { useEffect, useState } from 'react';

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
  
  // In a real implementation, this would be an API call to a summarization service
  useEffect(() => {
    if (transcript.length > 0 && transcript.length % 2 === 0) {
      // Generate a simulated key point every few transcript entries
      const mockKeyPoint: KeyPoint = {
        id: Date.now().toString(),
        text: `Key insight from discussion point ${transcript.length / 2}`,
        type: 'point'
      };
      
      setTimeout(() => {
        setKeyPoints(prev => [...prev, mockKeyPoint]);
      }, 1500);
      
      // Sometimes generate an action item
      if (transcript.length % 4 === 0) {
        const mockActionItem: KeyPoint = {
          id: (Date.now() + 1).toString(),
          text: `Action required: Follow up on item ${transcript.length / 4}`,
          type: 'action'
        };
        
        setTimeout(() => {
          setKeyPoints(prev => [...prev, mockActionItem]);
        }, 2500);
      }
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
