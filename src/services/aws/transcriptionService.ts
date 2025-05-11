// src/services/aws/transcriptionService.ts
interface AwsConfig {
  region: string;
  bucketName: string;
}

class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private isRecording: boolean = false;
  private transcript: string[] = [];
  private onTranscriptUpdate: ((message: string) => void) | null = null;
  private onRecordingStatusChange: ((status: boolean) => void) | null = null;
  private onTranscriptComplete: ((transcript: string) => void) | null = null;
  private awsConfig: AwsConfig = {
    region: 'us-west-2',
    bucketName: 'mindscribe'
  };

  init(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition is not supported in this browser.');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const formattedTranscript = `Speaker: ${transcript}`;
      this.transcript.push(formattedTranscript);
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(formattedTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate('Error: Microphone access denied. Please check your permissions.');
        }
      }
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        // If we were still recording, try to restart
        this.recognition.start();
      }
    };

    // Log AWS configuration
    const configMessage = `AWS Configuration: Using region ${this.awsConfig.region}\n\nS3 Bucket: ${this.awsConfig.bucketName}`;
    if (this.onTranscriptUpdate) {
      this.onTranscriptUpdate(configMessage);
    }
  }

  startRecording(): boolean {
    if (!this.recognition) {
      try {
        this.init();
      } catch (error: any) {
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(`Error: ${error.message}`);
        }
        return false;
      }
    }

    this.isRecording = true;
    this.transcript = []; // Reset transcript for new recording

    try {
      this.recognition!.start();
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate('Starting audio recording...');
      }
      
      if (this.onRecordingStatusChange) {
        this.onRecordingStatusChange(true);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error starting recording:', error);
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(`Error starting recording: ${error.message}`);
      }
      
      this.isRecording = false;
      if (this.onRecordingStatusChange) {
        this.onRecordingStatusChange(false);
      }
      
      return false;
    }
  }

  stopRecording(): string | null {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      
      if (this.onRecordingStatusChange) {
        this.onRecordingStatusChange(false);
      }
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate('Recording stopped. Processing audio...');
        this.onTranscriptUpdate('==== MEETING ENDED ====');
        this.onTranscriptUpdate('Transcript generation complete.');
      }
      
      // Make sure to finalize the transcript
      const fullTranscript = this.transcript.join('\n');
      
      // Signal that recording has stopped and pass the complete transcript
      if (this.onTranscriptComplete) {
        this.onTranscriptComplete(fullTranscript);
      }
      
      return fullTranscript;
    }
    return null;
  }

  onUpdate(callback: (message: string) => void): void {
    this.onTranscriptUpdate = callback;
  }

  onRecordingStatus(callback: (status: boolean) => void): void {
    this.onRecordingStatusChange = callback;
  }
  
  onComplete(callback: (transcript: string) => void): void {
    this.onTranscriptComplete = callback;
  }
}

export default TranscriptionService;