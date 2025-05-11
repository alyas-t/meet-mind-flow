import React, { useRef, useEffect } from 'react';

interface TranscriptPanelProps {
  transcript: string[] | Array<{text: string, speaker?: string}>;
  autoScroll?: boolean;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, autoScroll = true }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  // Convert transcript to standard format
  const normalizedTranscript = transcript.map(entry => 
    typeof entry === 'string' ? { text: entry } : entry
  );
  
  // Filter out duplicate messages (especially AWS Configuration messages)
  const filteredTranscript = normalizedTranscript.reduce((acc: Array<{text: string, speaker?: string}>, current) => {
    // For AWS Configuration and S3 Bucket messages, only keep the first occurrence
    if (
      (current.text.startsWith("AWS Configuration:") || current.text.startsWith("S3 Bucket:")) && 
      acc.some(item => item.text === current.text)
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
        {filteredTranscript.map((entry, index) => (
          <div key={index} className={`animate-fade-in ${entry.text.startsWith("Error:") ? "text-red-500" : ""}`}>
            {entry.text.startsWith("Transcription status:") || entry.text.startsWith("Uploading") || entry.text.startsWith("Audio uploaded") ? (
              <p className="text-blue-600 font-medium">{entry.text}</p>
            ) : entry.text.startsWith("Starting") || entry.text.includes("job started") ? (
              <p className="text-green-600">{entry.text}</p>
            ) : entry.text.startsWith("AWS Configuration:") ? (
              <p className="text-purple-600">{entry.text}</p>
            ) : entry.text.startsWith("S3 Bucket:") ? (
              <p className="text-orange-600 font-medium">{entry.text}</p>
            ) : (
              <div className="text-gray-800">
                {entry.speaker && (
                  <span className="font-semibold text-app-blue mr-2">{entry.speaker}:</span>
                )}
                <span>{entry.text}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
};

export default TranscriptPanel;
