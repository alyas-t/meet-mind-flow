import React, { useRef, useEffect } from 'react';

interface TranscriptPanelProps {
  transcript: string[];
  autoScroll?: boolean;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, autoScroll = true }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  // Filter out duplicate messages (especially AWS Configuration messages)
  const filteredTranscript = transcript.reduce((acc: string[], current: string) => {
    // For AWS Configuration and S3 Bucket messages, only keep the first occurrence
    if (
      (current.startsWith("AWS Configuration:") || current.startsWith("S3 Bucket:")) && 
      acc.some(item => item === current)
    ) {
      return acc;
    }
    return [...acc, current];
  }, []);

  useEffect(() => {
    if (autoScroll && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredTranscript, autoScroll]);

  if (filteredTranscript.length === 0) {
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
        {filteredTranscript.map((text, index) => (
          <div key={index} className={`animate-fade-in ${text.startsWith("Error:") ? "text-red-500" : ""}`}>
            {text.startsWith("Transcription status:") || text.startsWith("Uploading") || text.startsWith("Audio uploaded") ? (
              <p className="text-blue-600 font-medium">{text}</p>
            ) : text.startsWith("Starting") || text.includes("job started") ? (
              <p className="text-green-600">{text}</p>
            ) : text.startsWith("AWS Configuration:") ? (
              <p className="text-purple-600">{text}</p>
            ) : text.startsWith("S3 Bucket:") ? (
              <p className="text-orange-600 font-medium">{text}</p>
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
