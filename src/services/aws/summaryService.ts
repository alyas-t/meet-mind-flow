import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from "@aws-sdk/client-bedrock-runtime";
import { getAwsConfig } from "./config";

class SummaryService {
  private client: BedrockRuntimeClient;
  
  constructor() {
    this.client = new BedrockRuntimeClient(getAwsConfig());
  }

  async generateKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    const hasValidCredentials = 
      getAwsConfig().credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID" && 
      getAwsConfig().credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY";
    
    if (hasValidCredentials) {
      return this.generateBedrockKeyPoints(transcript);
    } else {
      return this.generateMockKeyPoints(transcript);
    }
  }

  private async generateBedrockKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    try {
      const fullText = transcript.join(" ");
      
      // Skip processing if the transcript is too short
      if (fullText.length < 50) {
        return [];
      }
      
      // Using Claude model (you can change this to another Bedrock model)
      const modelId = "anthropic.claude-v2";
      
      const prompt = `
The following is a meeting transcript. Extract key points and action items:

Transcript:
${fullText}

Please return your response in this exact JSON format:
{
  "keyPoints": [
    {"text": "First key point", "type": "point"},
    {"text": "Second key point", "type": "point"}
  ],
  "actionItems": [
    {"text": "First action item", "type": "action"},
    {"text": "Second action item", "type": "action"}
  ]
}
`;

      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify({
          prompt: `Human: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 4000,
          temperature: 0.7,
        }),
        contentType: "application/json",
        accept: "application/json",
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      let parsedResponse;
      try {
        // Extract JSON from the completion text
        const jsonMatch = responseBody.completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (error) {
        console.error("Error parsing Bedrock response:", error);
        return [];
      }
      
      // Combine key points and action items into one array
      const keyPoints = parsedResponse.keyPoints || [];
      const actionItems = parsedResponse.actionItems || [];
      
      return [...keyPoints, ...actionItems];
    } catch (error) {
      console.error("Error in Bedrock processing:", error);
      return this.generateMockKeyPoints(transcript);
    }
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
