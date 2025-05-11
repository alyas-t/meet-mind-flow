
// src/services/aws/transcriptionService.ts
interface AwsConfig {
  region: string;
  bucketName: string;
}

interface TranscriptEntry {
  text: string;
  speaker?: string;
}

class TranscriptionService {
  private _isRecording: boolean = false;
  private transcript: TranscriptEntry[] = [];
  private onTranscriptUpdate: ((message: TranscriptEntry) => void) | null = null;
  private onRecordingStatusChange: ((status: boolean) => void) | null = null;
  private onTranscriptComplete: ((transcript: TranscriptEntry[]) => void) | null = null;
  private awsConfig: AwsConfig = {
    region: 'us-west-2',
    bucketName: 'mindscribe'
  };
  private recognition: SpeechRecognition | null = null;
  private currentSpeaker: string | undefined = undefined;

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
      const transcriptText = result[0].transcript;
      const transcriptEntry: TranscriptEntry = {
        text: transcriptText,
        speaker: this.currentSpeaker
      };
      
      this.transcript.push(transcriptEntry);
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(transcriptEntry);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate({
            text: 'Error: Microphone access denied. Please check your permissions.'
          });
        }
      }
    };

    this.recognition.onend = () => {
      if (this._isRecording) {
        // If we were still recording, try to restart
        this.recognition?.start();
      }
    };

    // Log AWS configuration
    const configMessage = `AWS Configuration: Using region ${this.awsConfig.region}\n\nS3 Bucket: ${this.awsConfig.bucketName}`;
    if (this.onTranscriptUpdate) {
      this.onTranscriptUpdate({
        text: configMessage
      });
    }
  }

  isRecording(): boolean {
    return this._isRecording;
  }

  setSpeaker(speaker: string): void {
    this.currentSpeaker = speaker;
  }

  getCurrentSpeaker(): string | undefined {
    return this.currentSpeaker;
  }

  startRecording(): boolean {
    if (!this.recognition) {
      try {
        this.init();
      } catch (error: any) {
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate({
            text: `Error: ${error.message}`
          });
        }
        return false;
      }
    }

    this._isRecording = true;
    this.transcript = []; // Reset transcript for new recording

    try {
      this.recognition!.start();
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          text: 'Starting audio recording...'
        });
      }
      
      if (this.onRecordingStatusChange) {
        this.onRecordingStatusChange(true);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error starting recording:', error);
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          text: `Error starting recording: ${error.message}`
        });
      }
      
      this._isRecording = false;
      if (this.onRecordingStatusChange) {
        this.onRecordingStatusChange(false);
      }
      
      return false;
    }
  }

  stopRecording(): TranscriptEntry[] | null {
    if (this.recognition && this._isRecording) {
      this.recognition.stop();
      this._isRecording = false;
      
      if (this.onRecordingStatusChange) {
        this.onRecordingStatusChange(false);
      }
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          text: 'Recording stopped. Processing audio...'
        });
        this.onTranscriptUpdate({
          text: '==== MEETING ENDED ===='
        });
        this.onTranscriptUpdate({
          text: 'Transcript generation complete.'
        });
      }
      
      // Signal that recording has stopped and pass the complete transcript
      if (this.onTranscriptComplete) {
        this.onTranscriptComplete(this.transcript);
      }
      
      return this.transcript;
    }
    return null;
  }

  onUpdate(callback: (message: TranscriptEntry) => void): void {
    this.onTranscriptUpdate = callback;
  }

  onRecordingStatus(callback: (status: boolean) => void): void {
    this.onRecordingStatusChange = callback;
  }
  
  onComplete(callback: (transcript: TranscriptEntry[]) => void): void {
    this.onTranscriptComplete = callback;
  }
}

export default TranscriptionService;
