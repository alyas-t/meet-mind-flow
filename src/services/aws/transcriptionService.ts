
import { 
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand
} from "@aws-sdk/client-transcribe";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getAwsConfig } from "./config";

class TranscriptionService {
  private transcribeClient: TranscribeClient;
  private s3Client: S3Client;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private socket: WebSocket | null = null;
  private isTranscribing = false;
  private audioChunks: Blob[] = [];
  private jobName: string = '';
  private pollingInterval: number | null = null;
  
  // Update these with your S3 bucket information
  private s3Bucket = 'your-meeting-transcripts-bucket';
  private s3KeyPrefix = 'meeting-recordings/';

  constructor() {
    const awsConfig = getAwsConfig();
    this.transcribeClient = new TranscribeClient(awsConfig);
    this.s3Client = new S3Client(awsConfig);
  }

  async startTranscription(onTranscriptUpdate: (text: string) => void): Promise<void> {
    try {
      // Get audio stream from user's microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      // Configure media recorder to capture audio
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.isTranscribing = true;
      
      const hasValidCredentials = 
        getAwsConfig().credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID" && 
        getAwsConfig().credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY";
      
      if (hasValidCredentials) {
        console.log("Using AWS Transcribe with valid credentials");
        this.mediaRecorder.start(1000); // Collect data in 1-second chunks
        this.startAwsTranscription(onTranscriptUpdate);
      } else {
        console.log("Using mock transcription due to missing credentials");
        this.startMockTranscription(onTranscriptUpdate);
      }
    } catch (error) {
      console.error("Error starting transcription:", error);
      throw error;
    }
  }

  private startMockTranscription(onTranscriptUpdate: (text: string) => void): void {
    // Mock transcription data - this simulates what would come from AWS Transcribe
    const mockTranscriptionText = [
      "Hello everyone, thank you for joining today's meeting.",
      "Let's start by discussing the current project status.",
      "We've made good progress on the first milestone.",
      "I think we should prioritize the user interface improvements.",
      "Does anyone have questions about the timeline?",
      "We should allocate more resources to testing before the next release.",
      "Let's make sure we address all the feedback from the last user testing session.",
      "I believe we should also focus on improving the user onboarding flow.",
      "The analytics data shows users are struggling with the initial setup.",
      "We should consider adding interactive tutorials to help new users.",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (!this.isTranscribing || index >= mockTranscriptionText.length) {
        clearInterval(interval);
        return;
      }
      
      onTranscriptUpdate(mockTranscriptionText[index]);
      index++;
    }, 3000);
  }

  private async startAwsTranscription(onTranscriptUpdate: (text: string) => void): Promise<void> {
    try {
      this.jobName = `meeting-${Date.now()}`;
      console.log("Preparing for AWS transcription with job name:", this.jobName);
      
      // Set up event handler for when recording stops
      this.mediaRecorder!.addEventListener('stop', async () => {
        if (!this.isTranscribing) return;
        
        try {
          // Combine audio chunks into a single blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          
          // Upload to S3
          const s3Key = `${this.s3KeyPrefix}${this.jobName}.webm`;
          await this.uploadToS3(audioBlob, s3Key);
          
          // Start transcription job
          await this.startTranscriptionJob(s3Key, onTranscriptUpdate);
        } catch (error) {
          console.error("Error processing recording:", error);
        }
      });
    } catch (error) {
      console.error("Error in AWS transcription setup:", error);
      throw error;
    }
  }
  
  private async uploadToS3(audioBlob: Blob, key: string): Promise<string> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = new Uint8Array(arrayBuffer);
      
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: audioBuffer,
        ContentType: 'audio/webm',
      });
      
      await this.s3Client.send(command);
      const s3Uri = `s3://${this.s3Bucket}/${key}`;
      console.log("Audio uploaded to S3:", s3Uri);
      return s3Uri;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }
  
  private async startTranscriptionJob(s3Key: string, onTranscriptUpdate: (text: string) => void): Promise<void> {
    try {
      const s3Uri = `s3://${this.s3Bucket}/${s3Key}`;
      
      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: this.jobName,
        LanguageCode: "en-US",
        MediaFormat: "webm",
        Media: {
          MediaFileUri: s3Uri
        },
        OutputBucketName: this.s3Bucket,
        OutputKey: `transcripts/${this.jobName}.json`,
      });
      
      const response = await this.transcribeClient.send(command);
      console.log("Transcription job started:", response);
      
      // Poll for job completion
      this.pollingInterval = window.setInterval(async () => {
        try {
          const status = await this.checkTranscriptionStatus(onTranscriptUpdate);
          if (status === 'COMPLETED' || status === 'FAILED') {
            if (this.pollingInterval) {
              clearInterval(this.pollingInterval);
              this.pollingInterval = null;
            }
          }
        } catch (error) {
          console.error("Error checking transcription status:", error);
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }
        }
      }, 5000); // Check every 5 seconds
    } catch (error) {
      console.error("Error starting transcription job:", error);
      throw error;
    }
  }
  
  private async checkTranscriptionStatus(onTranscriptUpdate: (text: string) => void): Promise<string> {
    try {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: this.jobName,
      });
      
      const response = await this.transcribeClient.send(command);
      const status = response.TranscriptionJob?.TranscriptionJobStatus;
      
      console.log("Transcription job status:", status);
      
      if (status === 'COMPLETED') {
        // In a real implementation, you would fetch the transcript from S3
        // and parse it to extract the text
        const mockCompletedTranscript = "Meeting transcription completed successfully.";
        onTranscriptUpdate(mockCompletedTranscript);
        
        // In a real implementation you would do something like:
        // const transcriptUrl = response.TranscriptionJob?.Transcript?.TranscriptFileUri;
        // if (transcriptUrl) {
        //   const transcript = await this.fetchTranscript(transcriptUrl);
        //   onTranscriptUpdate(transcript);
        // }
      } else if (status === 'FAILED') {
        console.error("Transcription job failed:", response.TranscriptionJob?.FailureReason);
      }
      
      return status || 'UNKNOWN';
    } catch (error) {
      console.error("Error checking transcription status:", error);
      throw error;
    }
  }

  stopTranscription(): void {
    this.isTranscribing = false;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.mediaRecorder = null;
    this.stream = null;
    this.socket = null;
    this.audioChunks = [];
  }
}

export default new TranscriptionService();
