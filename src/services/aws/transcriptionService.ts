
import {
  TranscribeClient,
  StartStreamTranscriptionCommand,
  StartStreamTranscriptionCommandInput,
  GetTranscriptionJobCommand,
  TranscriptEvent,
} from "@aws-sdk/client-transcribe";
import { getAwsConfig } from './config';

class TranscriptionService {
  private client: TranscribeClient | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private updateCallback: ((text: string) => void) | null = null;
  private completeCallback: ((fullTranscript: string) => void) | null = null;
  private statusCallback: ((isRecording: boolean) => void) | null = null;
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;
  private mockTranscriptIntervalId: NodeJS.Timeout | null = null;
  private mockTranscript: string[] = [
    "Hello everyone and welcome to our weekly meeting.",
    "Today, we're going to discuss the product roadmap for Q2.",
    "First, let's review our progress from last quarter.",
    "We successfully launched three new features and improved performance by 15%.",
    "For this quarter, we need to focus on user retention and engagement.",
    "I propose we implement the following features...",
    "Any questions or feedback on the proposed roadmap?",
    "Great points everyone. Let's establish the timeline and assign responsibilities.",
    "We need to have the first milestone ready by the end of next month.",
    "Let's schedule a follow-up meeting to track our progress.",
  ];

  constructor() {
    try {
      const config = getAwsConfig();
      
      if (config.accessKeyId && config.secretAccessKey) {
        const clientConfig = {
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        };
        
        // Add session token if available
        if (config.sessionToken) {
          clientConfig.credentials.sessionToken = config.sessionToken;
        }
        
        this.client = new TranscribeClient(clientConfig);
        console.log("Using AWS Transcribe with credentials valid:", !!this.client);
      } else {
        console.warn("AWS credentials not configured, using mock transcription");
        this.client = null;
      }
    } catch (error) {
      console.error("Error initializing TranscriptionService:", error);
      this.client = null;
    }
  }

  get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  onUpdate(callback: (text: string) => void): void {
    this.updateCallback = callback;
  }

  onComplete(callback: (fullTranscript: string) => void): void {
    this.completeCallback = callback;
  }

  onRecordingStatus(callback: (isRecording: boolean) => void): void {
    this.statusCallback = callback;
  }

  async startRecording(): Promise<void> {
    console.log("Starting transcription service");
    
    if (this.isRecording) {
      return;
    }
    
    this.isRecording = true;
    this.audioChunks = [];
    
    if (this.statusCallback) {
      this.statusCallback(true);
    }

    try {
      if (!this.client) {
        // Use mock transcription if AWS is not configured
        this.startMockTranscription();
        return;
      }

      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream);
      console.log("MediaRecorder created with MIME type:", this.mediaRecorder.mimeType);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
          
          // In a real implementation, you would stream this to AWS Transcribe
          // For now, we'll process batches
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          if (this.client) {
            console.log("Starting AWS transcription");
            // In a real app, this would use the streaming API
            // For this demo, we'll use a simplified approach
            
            const jobName = `meeting-${Date.now()}`;
            console.log("Preparing for AWS transcription with job name:", jobName);
            
            // This is where we'd actually send the audio to AWS Transcribe
            // For now, let's pretend we did and use mock data instead
            setTimeout(() => {
              this.processTranscriptionResult("This is a simulated AWS Transcribe result. In a real implementation, this would contain the actual transcription from your audio recording.");
            }, 1500);
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          if (this.updateCallback) {
            this.updateCallback("Error processing audio. Please try again.");
          }
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error("Error starting recording:", error);
      this.isRecording = false;
      
      if (this.statusCallback) {
        this.statusCallback(false);
      }
      
      if (this.updateCallback) {
        this.updateCallback("Error: Could not access microphone. Please check permissions.");
      }
      
      // Fall back to mock transcription
      this.startMockTranscription();
    }
  }

  stopRecording(): void {
    console.log("Stopping transcription service");
    this.isRecording = false;
    
    if (this.statusCallback) {
      this.statusCallback(false);
    }

    if (this.mockTranscriptIntervalId) {
      clearInterval(this.mockTranscriptIntervalId);
      this.mockTranscriptIntervalId = null;
      
      // Provide a complete mock transcript
      setTimeout(() => {
        if (this.completeCallback) {
          this.completeCallback(this.mockTranscript.join(" "));
        }
      }, 1000);
      
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      console.log("Stopping media recorder");
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      console.log("Stopping audio tracks");
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    console.log("Transcription service stopped");
  }

  private startMockTranscription(): void {
    let index = 0;
    
    this.mockTranscriptIntervalId = setInterval(() => {
      if (index < this.mockTranscript.length && this.isRecording) {
        if (this.updateCallback) {
          this.updateCallback(this.mockTranscript[index]);
        }
        index++;
      } else {
        clearInterval(this.mockTranscriptIntervalId!);
        this.mockTranscriptIntervalId = null;
      }
    }, 2000);
  }

  private processTranscriptionResult(transcriptText: string): void {
    if (this.updateCallback) {
      // Split the transcript into sentences for more natural updates
      const sentences = transcriptText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach((sentence, index) => {
        setTimeout(() => {
          if (this.updateCallback) {
            this.updateCallback(sentence.trim() + ".");
          }
          
          // If this is the last sentence, call the complete callback
          if (index === sentences.length - 1 && this.completeCallback) {
            this.completeCallback(transcriptText);
          }
        }, index * 1000); // Space out the sentences
      });
    } else if (this.completeCallback) {
      this.completeCallback(transcriptText);
    }
  }
}

export default TranscriptionService;
