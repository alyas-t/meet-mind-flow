
import React, { useRef, useEffect } from 'react';

interface TranscriptPanelProps {
  transcript: string[];
  autoScroll?: boolean;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, autoScroll = true }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, autoScroll]);

  if (transcript.length === 0) {
    return (
      <div className="bg-white rounded-lg border h-full flex items-center justify-center p-6 text-gray-500">
        <p>Transcript will appear here when you start recording...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border h-full overflow-y-auto p-6">
      <h3 className="text-xl font-medium mb-4 pb-2 border-b sticky top-0 bg-white">Transcript</h3>
      <div className="space-y-4">
        {transcript.map((text, index) => (
          <div key={index} className={`animate-fade-in ${text.startsWith("Error:") ? "text-red-500" : ""}`}>
            {text.startsWith("Transcription status:") || text.startsWith("Uploading") || text.startsWith("Audio uploaded") ? (
              <p className="text-blue-600 font-medium">{text}</p>
            ) : text.startsWith("Starting") || text.includes("job started") ? (
              <p className="text-green-600">{text}</p>
            ) : (
              <p className="text-gray-800">{text}</p>
            )}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
};

export default TranscriptPanel;
