// TranscriptionService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getAwsConfig } from "./config";

class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isTranscribing: boolean = false;
  private transcriptCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private transcriptSegments: string[] = [];
  private geminiApi: GoogleGenerativeAI | null = null;
  private geminiModel: any = null;
  private processingInterval: number | null = null;
  private uploadInterval: number | null = null;
  private geminiApiKey: string;
  private sessionId: string;
  private s3Client: S3Client;
  private s3Bucket: string;
  private s3KeyPrefix = 'meeting-recordings/';

  constructor() {
    // Generate a unique session ID
    this.sessionId = `meeting-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Get API key from environment variables or config
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    // Initialize AWS S3 client
    const awsConfig = getAwsConfig();
    this.s3Client = new S3Client(awsConfig);
    this.s3Bucket = awsConfig.s3BucketName;
    
    console.log("S3 Configuration:", {
      bucket: this.s3Bucket,
      keyPrefix: this.s3KeyPrefix,
      sessionId: this.sessionId
    });
    
    // Check if browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser");
    } else {
      console.log("Speech recognition is supported");
    }
    
    // Initialize Gemini if API key is available
    if (this.geminiApiKey) {
      try {
        this.geminiApi = new GoogleGenerativeAI(this.geminiApiKey);
        this.geminiModel = this.geminiApi.getGenerativeModel({ model: "gemini-pro" });
        console.log("Gemini API initialized successfully");
      } catch (error) {
        console.error("Error initializing Gemini API:", error);
      }
    } else {
      console.warn("No Gemini API key provided. Will use mock processing.");
    }
  }
  
  async startTranscription(
    onTranscriptUpdate: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      console.log("Starting transcription service");
      this.transcriptCallback = onTranscriptUpdate;
      this.onErrorCallback = onError || null;
      this.transcriptSegments = [];
      this.audioChunks = [];
      
      // Request audio permission
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Audio permission granted");
      
      // Start audio recording for storage
      this.startAudioRecording();
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure speech recognition
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      // Set up event handlers
      this.recognition.onresult = this.handleSpeechResult.bind(this);
      this.recognition.onerror = this.handleSpeechError.bind(this);
      this.recognition.onend = this.handleSpeechEnd.bind(this);
      
      // Inform user transcription is starting
      if (this.transcriptCallback) {
        this.transcriptCallback("Starting transcription...");
      }
      
      // Start listening
      this.recognition.start();
      this.isTranscribing = true;
      
      // Set up periodic processing of transcript with Gemini
      this.processingInterval = window.setInterval(() => {
        this.processTranscriptWithGemini();
      }, 30000); // Process every 30 seconds
      
      // Set up periodic upload to S3
      this.uploadInterval = window.setInterval(() => {
        this.uploadTranscriptToS3();
      }, 15000); // Upload every 15 seconds
      
    } catch (error) {
      console.error("Error starting transcription:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error.message : "Unknown error starting transcription");
      }
      throw error;
    }
  }
  
  private startAudioRecording(): void {
    if (!this.stream) return;
    
    try {
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.addEventListener('stop', () => {
        this.uploadAudioToS3();
      });
      
      // Start recording in chunks
      this.mediaRecorder.start(5000); // 5-second chunks
      console.log("Audio recording started");
    } catch (error) {
      console.error("Error starting audio recording:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(`Error starting audio recording: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }
  
  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    // Get the most recent result
    const currentResult = event.results[event.results.length - 1];
    
    // If this is a final result (not interim)
    if (currentResult.isFinal) {
      const finalTranscript = currentResult[0].transcript;
      console.log("Final transcript segment:", finalTranscript);
      
      // Add to transcript segments
      this.transcriptSegments.push(finalTranscript);
      
      // Output speaker label and transcript
      if (this.transcriptCallback) {
        this.transcriptCallback(`Speaker: ${finalTranscript}`);
      }
    } else {
      // For interim results, just log them
      const interimTranscript = currentResult[0].transcript;
      console.log("Interim transcript:", interimTranscript);
    }
  }
  
  private handleSpeechError(event: SpeechRecognitionErrorEvent): void {
    console.error("Speech recognition error:", event.error, event.message);
    
    if (this.onErrorCallback) {
      this.onErrorCallback(`Speech recognition error: ${event.error}`);
    }
    
    // Restart recognition if it was network-related
    if (event.error === 'network' && this.isTranscribing) {
      console.log("Attempting to restart speech recognition after network error");
      setTimeout(() => {
        if (this.recognition && this.isTranscribing) {
          this.recognition.start();
        }
      }, 1000);
    }
  }
  
  private handleSpeechEnd(): void {
    console.log("Speech recognition ended");
    
    // Restart if we're still supposed to be transcribing
    if (this.isTranscribing && this.recognition) {
      console.log("Restarting speech recognition");
      this.recognition.start();
    }
  }
  
  private async processTranscriptWithGemini(): Promise<void> {
    // Skip if no transcript or not transcribing
    if (!this.isTranscribing || this.transcriptSegments.length === 0) {
      return;
    }
    
    console.log("Processing transcript with Gemini");
    
    // Get the last few transcript segments to process
    const recentTranscript = this.transcriptSegments.slice(-10).join(' ');
    
    if (this.geminiApi && this.geminiModel && this.geminiApiKey) {
      try {
        // Call Gemini API for insights
        const prompt = `
          You are an AI assistant helping with meeting transcription. 
          Please analyze this recent part of a meeting transcript and extract:
          1. Key points or topics discussed
          2. Any action items or follow-ups mentioned
          
          Format your response with "Key Points:" and "Action Items:" sections.
          
          Transcript:
          ${recentTranscript}
        `;
        
        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        const insights = response.text();
        
        console.log("Gemini insights:", insights);
        
        if (this.transcriptCallback) {
          this.transcriptCallback(`\n---- INSIGHTS ----\n${insights}\n-----------------\n`);
        }
        
        // Upload insights to S3
        await this.uploadInsightsToS3(insights);
        
      } catch (error) {
        console.error("Error processing with Gemini:", error);
        if (this.onErrorCallback) {
          this.onErrorCallback(`Error processing transcript with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    } else {
      // Mock processing for when Gemini isn't available
      const mockInsights = this.mockProcessTranscript(recentTranscript);
      this.uploadInsightsToS3(mockInsights);
    }
  }
  
  private mockProcessTranscript(transcript: string): string {
    console.log("Using mock transcript processing");
    
    // Simple word-based analysis to identify potential key points and actions
    const words = transcript.toLowerCase().split(/\s+/);
    const actionPhrases = ['need to', 'should', 'will', 'must', 'going to', 'plan', 'task'];
    
    let hasActionItem = false;
    for (const phrase of actionPhrases) {
      if (transcript.toLowerCase().includes(phrase)) {
        hasActionItem = true;
        break;
      }
    }
    
    const mockInsights = `
Key Points:
• Discussed recent meeting topics
• Reviewed project progress
${words.length > 50 ? '• Covered multiple discussion points in detail' : '• Brief discussion of primary topic'}

${hasActionItem ? `Action Items:
• Follow up on items mentioned in the transcript
• Schedule next discussion on these topics` : 'No specific action items identified.'}
`;
    
    if (this.transcriptCallback) {
      this.transcriptCallback(`\n---- INSIGHTS ----\n${mockInsights}\n-----------------\n`);
    }
    
    return mockInsights;
  }
  
  private async uploadTranscriptToS3(): Promise<void> {
    if (this.transcriptSegments.length === 0) return;
    
    try {
      const timestamp = new Date().toISOString();
      const key = `${this.s3KeyPrefix}${this.sessionId}/transcripts/transcript-${timestamp}.json`;
      
      // Prepare data to upload
      const data = {
        sessionId: this.sessionId,
        timestamp,
        transcript: this.transcriptSegments.join(' '),
        segments: this.transcriptSegments
      };
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });
      
      await this.s3Client.send(command);
      console.log(`Transcript uploaded to S3: ${this.s3Bucket}/${key}`);
      
      if (this.transcriptCallback) {
        this.transcriptCallback(`(Transcript saved to S3)`);
      }
    } catch (error) {
      console.error("Error uploading transcript to S3:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(`Error saving transcript: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }
  
  private async uploadInsightsToS3(insights: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const key = `${this.s3KeyPrefix}${this.sessionId}/insights/insights-${timestamp}.json`;
      
      // Prepare data to upload
      const data = {
        sessionId: this.sessionId,
        timestamp,
        insights
      };
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });
      
      await this.s3Client.send(command);
      console.log(`Insights uploaded to S3: ${this.s3Bucket}/${key}`);
    } catch (error) {
      console.error("Error uploading insights to S3:", error);
    }
  }
  
  private async uploadAudioToS3(): Promise<void> {
    if (this.audioChunks.length === 0) return;
    
    try {
      // Combine audio chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const timestamp = new Date().toISOString();
      const key = `${this.s3KeyPrefix}${this.sessionId}/audio/recording-${timestamp}.webm`;
      
      // Convert blob to buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = new Uint8Array(arrayBuffer);
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: audioBuffer,
        ContentType: 'audio/webm',
      });
      
      await this.s3Client.send(command);
      console.log(`Audio uploaded to S3: ${this.s3Bucket}/${key}`);
      
      // Clear audio chunks after upload
      this.audioChunks = [];
    } catch (error) {
      console.error("Error uploading audio to S3:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(`Error saving audio: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }
  
  async stopTranscription(): Promise<void> {
    console.log("Stopping transcription service");
    this.isTranscribing = false;
    
    // Stop speech recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
      this.recognition = null;
    }
    
    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.error("Error stopping media recorder:", error);
      }
    }
    
    // Stop audio tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // Final processing and uploads
    await this.processTranscriptWithGemini();
    await this.uploadTranscriptToS3();
    
    // Upload final audio if needed
    if (this.audioChunks.length > 0) {
      await this.uploadAudioToS3();
    }
    
    // Clear intervals
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    if (this.uploadInterval) {
      clearInterval(this.uploadInterval);
      this.uploadInterval = null;
    }
    
    // Generate and display final summary
    if (this.transcriptCallback && this.transcriptSegments.length > 0) {
      const fullText = this.transcriptSegments.join(' ');
      this.transcriptCallback(`\n==== MEETING ENDED ====\nFull transcript saved to S3\n====================\n`);
      
      // Create final meeting summary file
      await this.createFinalSummary(fullText);
    }
    
    this.transcriptCallback = null;
    this.onErrorCallback = null;
    console.log("Transcription service stopped");
  }
  
  private async createFinalSummary(fullTranscript: string): Promise<void> {
    try {
      // Generate final summary with Gemini or mock
      let summary = "Meeting summary not available.";
      
      if (this.geminiApi && this.geminiModel && this.geminiApiKey) {
        try {
          const prompt = `
            You are an AI assistant creating meeting summaries.
            Please analyze this complete meeting transcript and provide:
            1. A concise summary of the key points (3-5 bullet points)
            2. All action items identified, with assigned people if mentioned
            3. Any decisions made during the meeting
            
            Format your response in markdown with sections for "Summary", "Action Items", and "Decisions".
            
            Meeting Transcript:
            ${fullTranscript}
          `;
          
          const result = await this.geminiModel.generateContent(prompt);
          const response = await result.response;
          summary = response.text();
        } catch (error) {
          console.error("Error generating final summary:", error);
          summary = "Error generating meeting summary. See transcript for details.";
        }
      } else {
        summary = "Meeting ended. Summary not available without Gemini API.";
      }
      
      // Upload final summary to S3
      const key = `${this.s3KeyPrefix}${this.sessionId}/summary.json`;
      
      const data = {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        summary,
        fullTranscript
      };
      
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });
      
      await this.s3Client.send(command);
      console.log(`Final summary uploaded to S3: ${this.s3Bucket}/${key}`);
      
      // Create index file with metadata about the meeting
      await this.createMeetingIndex(summary);
      
    } catch (error) {
      console.error("Error creating final summary:", error);
    }
  }
  
  private async createMeetingIndex(summary: string): Promise<void> {
    try {
      // Create an index file containing metadata about this meeting session
      const key = `${this.s3KeyPrefix}${this.sessionId}/index.json`;
      
      const data = {
        sessionId: this.sessionId,
        startTime: this.sessionId.split('-')[1], // Extract timestamp from session ID
        endTime: Date.now(),
        segmentsCount: this.transcriptSegments.length,
        summary: summary.substring(0, 500) + (summary.length > 500 ? '...' : ''),
        paths: {
          audio: `${this.s3KeyPrefix}${this.sessionId}/audio/`,
          transcripts: `${this.s3KeyPrefix}${this.sessionId}/transcripts/`,
          insights: `${this.s3KeyPrefix}${this.sessionId}/insights/`,
          summary: `${this.s3KeyPrefix}${this.sessionId}/summary.json`
        }
      };
      
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });
      
      await this.s3Client.send(command);
      console.log(`Meeting index uploaded to S3: ${this.s3Bucket}/${key}`);
      
    } catch (error) {
      console.error("Error creating meeting index:", error);
    }
  }
  
  async getMeetingSummary(sessionId: string): Promise<any> {
    try {
      const key = `${this.s3KeyPrefix}${sessionId}/summary.json`;
      
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: key
      });
      
      const response = await this.s3Client.send(command);
      
      if (response.Body) {
        const summaryData = await this.streamToString(response.Body);
        return JSON.parse(summaryData);
      }
      
      throw new Error("No summary found");
    } catch (error) {
      console.error("Error retrieving meeting summary:", error);
      throw error;
    }
  }
  
  async listMeetings(): Promise<any[]> {
    try {
      // This would require AWS SDK's ListObjectsV2Command
      // For simplicity, we're simulating it here
      console.warn("listMeetings: This method would normally use ListObjectsV2Command");
      
      return [{
        sessionId: this.sessionId,
        date: new Date().toISOString(),
        summary: "Most recent meeting (actual listing not implemented)"
      }];
    } catch (error) {
      console.error("Error listing meetings:", error);
      return [];
    }
  }
  
  // Helper function to convert stream to string
  private async streamToString(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }
}

export default new TranscriptionService();

