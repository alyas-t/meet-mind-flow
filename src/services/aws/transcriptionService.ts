
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
  private onErrorCallback: ((error: string) => void) | null = null;
  
  // Use environment variables for S3 bucket if available
  private s3Bucket = import.meta.env.VITE_S3_BUCKET_NAME || 'mindscribe';
  private s3KeyPrefix = 'meeting-recordings/';

  constructor() {
    const awsConfig = getAwsConfig();
    console.log("AWS Config on initialization:", {
      region: awsConfig.region,
      hasAccessKey: !!awsConfig.credentials.accessKeyId && awsConfig.credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID",
      hasSecretKey: !!awsConfig.credentials.secretAccessKey && awsConfig.credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY",
      hasSessionToken: !!awsConfig.credentials.sessionToken,
      s3Bucket: this.s3Bucket
    });
    
    this.transcribeClient = new TranscribeClient(awsConfig);
    this.s3Client = new S3Client(awsConfig);
  }

  async startTranscription(
    onTranscriptUpdate: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      console.log("Starting transcription service");
      this.onErrorCallback = onError || null;
      
      // Validate S3 bucket is configured
      if (!this.s3Bucket || this.s3Bucket === 'mindscribe') {
        const error = "S3 bucket not properly configured. Please set VITE_S3_BUCKET_NAME.";
        console.error(error);
        if (this.onErrorCallback) this.onErrorCallback(error);
        return;
      }
      
      // Get audio stream from user's microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      
      this.audioChunks = [];
      
      // Configure media recorder to capture audio
      this.mediaRecorder = new MediaRecorder(this.stream);
      console.log("MediaRecorder created with MIME type:", this.mediaRecorder.mimeType);
      
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          console.log(`Audio chunk received: ${event.data.size} bytes`);
          this.audioChunks.push(event.data);
        }
      });
      
      this.isTranscribing = true;
      
      const hasValidCredentials = 
        getAwsConfig().credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID" && 
        getAwsConfig().credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY";
      
      console.log("Using AWS Transcribe with credentials valid:", hasValidCredentials);
      
      if (hasValidCredentials) {
        console.log("Starting AWS transcription");
        this.mediaRecorder.start(1000); // Collect data in 1-second chunks
        this.startAwsTranscription(onTranscriptUpdate);
        // Add an immediate transcript update to verify the function is working
        onTranscriptUpdate("Starting transcription with AWS...");
      } else {
        const error = "AWS credentials are not properly configured";
        console.error(error);
        if (this.onErrorCallback) this.onErrorCallback(error);
        console.log("Using mock transcription due to missing credentials");
        this.startMockTranscription(onTranscriptUpdate);
      }
    } catch (error) {
      console.error("Error starting transcription:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error.message : "Unknown error starting transcription");
      }
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
          console.log("Recording stopped, processing audio chunks:", this.audioChunks.length);
          
          // Combine audio chunks into a single blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          console.log("Audio blob created with size:", audioBlob.size);
          
          if (audioBlob.size > 0) {
            // Upload to S3
            const s3Key = `${this.s3KeyPrefix}${this.jobName}.webm`;
            console.log("Uploading to S3 with key:", s3Key);
            
            try {
              onTranscriptUpdate("Uploading audio to S3...");
              const s3Uri = await this.uploadToS3(audioBlob, s3Key);
              console.log("S3 upload successful, URI:", s3Uri);
              onTranscriptUpdate(`Audio uploaded to S3: ${this.s3Bucket}`);
              
              // Start transcription job
              await this.startTranscriptionJob(s3Key, onTranscriptUpdate);
            } catch (s3Error) {
              console.error("S3 or transcription error:", s3Error);
              const errorMessage = s3Error instanceof Error ? s3Error.message : "Error uploading to S3";
              onTranscriptUpdate("Error: Failed to process audio. Check console for details.");
              if (this.onErrorCallback) this.onErrorCallback(errorMessage);
            }
          } else {
            console.error("No audio recorded (blob size is 0)");
            onTranscriptUpdate("Error: No audio recorded.");
            if (this.onErrorCallback) this.onErrorCallback("No audio recorded (blob size is 0)");
          }
        } catch (error) {
          console.error("Error processing recording:", error);
          onTranscriptUpdate("Error: Failed to process recording.");
          if (this.onErrorCallback) {
            this.onErrorCallback(error instanceof Error ? error.message : "Unknown error processing recording");
          }
        }
      });
    } catch (error) {
      console.error("Error in AWS transcription setup:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error.message : "Unknown error in transcription setup");
      }
      throw error;
    }
  }
  
  private async uploadToS3(audioBlob: Blob, key: string): Promise<string> {
    try {
      console.log("Converting audio blob to buffer for S3 upload");
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = new Uint8Array(arrayBuffer);
      
      console.log("Preparing S3 upload command for bucket:", this.s3Bucket);
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: audioBuffer,
        ContentType: 'audio/webm',
      });
      
      console.log("Sending upload command to S3");
      await this.s3Client.send(command);
      const s3Uri = `s3://${this.s3Bucket}/${key}`;
      console.log("Audio uploaded to S3:", s3Uri);
      return s3Uri;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(`S3 upload failed: ${error instanceof Error ? error.message : "Unknown S3 error"}`);
      }
      throw error;
    }
  }
  
  private async startTranscriptionJob(s3Key: string, onTranscriptUpdate: (text: string) => void): Promise<void> {
    try {
      const s3Uri = `s3://${this.s3Bucket}/${s3Key}`;
      console.log("Starting transcription job with S3 URI:", s3Uri);
      
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
      
      console.log("Sending start transcription job command");
      const response = await this.transcribeClient.send(command);
      console.log("Transcription job started:", response);
      onTranscriptUpdate("Transcription job started. Processing audio...");
      
      // Poll for job completion
      this.pollingInterval = window.setInterval(async () => {
        try {
          console.log("Checking transcription job status");
          const status = await this.checkTranscriptionStatus(onTranscriptUpdate);
          console.log("Current transcription status:", status);
          
          if (status === 'COMPLETED' || status === 'FAILED') {
            if (this.pollingInterval) {
              clearInterval(this.pollingInterval);
              this.pollingInterval = null;
            }
          }
        } catch (error) {
          console.error("Error checking transcription status:", error);
          if (this.onErrorCallback) {
            this.onErrorCallback(`Transcription status check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }
        }
      }, 5000); // Check every 5 seconds
    } catch (error) {
      console.error("Error starting transcription job:", error);
      onTranscriptUpdate("Error: Failed to start transcription job.");
      if (this.onErrorCallback) {
        this.onErrorCallback(`Failed to start transcription job: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
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
        const reason = response.TranscriptionJob?.FailureReason || "Unknown reason";
        console.error("Transcription job failed:", reason);
        onTranscriptUpdate(`Transcription failed: ${reason}`);
        if (this.onErrorCallback) this.onErrorCallback(`Transcription job failed: ${reason}`);
      } else if (status) {
        onTranscriptUpdate(`Transcription status: ${status}`);
      }
      
      return status || 'UNKNOWN';
    } catch (error) {
      console.error("Error checking transcription status:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(`Error checking transcription status: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
      throw error;
    }
  }

  stopTranscription(): void {
    console.log("Stopping transcription service");
    this.isTranscribing = false;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      console.log("Stopping media recorder");
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      console.log("Stopping audio tracks");
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("Closing WebSocket connection");
      this.socket.close();
    }
    
    if (this.pollingInterval) {
      console.log("Clearing polling interval");
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.mediaRecorder = null;
    this.stream = null;
    this.socket = null;
    this.audioChunks = [];
    this.onErrorCallback = null;
    console.log("Transcription service stopped");
  }
}

export default new TranscriptionService();
