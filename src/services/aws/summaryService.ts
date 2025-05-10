
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { getAwsConfig } from "./config";

class SummaryService {
  private client: BedrockRuntimeClient;
  
  constructor() {
    this.client = new BedrockRuntimeClient(getAwsConfig());
  }

  async generateKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    // In a real implementation, we would call AWS Bedrock here
    // For now, we'll use a mock implementation
    
    return this.generateMockKeyPoints(transcript);
  }

  private async generateMockKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    // This simulates what would come from AWS Bedrock's AI model
    const fullText = transcript.join(" ");
    const keyPoints = [];
    
    // Generate mock key points based on transcript content
    if (transcript.length > 0) {
      if (transcript.length % 2 === 0) {
        keyPoints.push({
          text: `Key insight: ${this.getRandomKeyPoint(transcript)}`,
          type: 'point'
        });
      }
      
      if (transcript.length % 3 === 0) {
        keyPoints.push({
          text: `Action item: ${this.getRandomActionItem(transcript)}`,
          type: 'action'
        });
      }
    }
    
    return keyPoints;
  }
  
  private getRandomKeyPoint(transcript: string[]): string {
    const keyPointTemplates = [
      "Team needs to focus on improving user experience",
      "Project timeline needs to be adjusted for Q3 delivery",
      "Client feedback indicates need for simplification of interface",
      "Current progress is ahead of schedule on backend components",
      "Market analysis shows increased demand for this feature"
    ];
    
    return keyPointTemplates[Math.floor(Math.random() * keyPointTemplates.length)];
  }
  
  private getRandomActionItem(transcript: string[]): string {
    const actionItemTemplates = [
      "Schedule follow-up meeting to discuss timeline changes",
      "Assign resources to improve onboarding process",
      "Create prototype for new feature by next week",
      "Review analytics data and prepare report",
      "Contact client to get clarification on requirements"
    ];
    
    return actionItemTemplates[Math.floor(Math.random() * actionItemTemplates.length)];
  }
}

export default new SummaryService();
