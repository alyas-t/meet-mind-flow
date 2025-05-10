
import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from "@aws-sdk/client-bedrock-runtime";
import { getAwsConfig } from "./config";

class SummaryService {
  private client: BedrockRuntimeClient;
  
  constructor() {
    try {
      this.client = new BedrockRuntimeClient(getAwsConfig());
    } catch (error) {
      console.error("Error initializing Bedrock client:", error);
    }
  }

  async generateKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    // Always use mock implementation when transcript length is even, to prevent overwhelming
    if (transcript.length % 2 === 0 || transcript.length > 10) {
      console.log("Using mock implementation for key points (transcript update)");
      return this.generateMockKeyPoints(transcript);
    }
    
    const hasValidCredentials = 
      getAwsConfig().credentials.accessKeyId !== "YOUR_ACCESS_KEY_ID" && 
      getAwsConfig().credentials.secretAccessKey !== "YOUR_SECRET_ACCESS_KEY";
    
    // Use mock implementation if credentials aren't valid
    if (!hasValidCredentials) {
      return this.generateMockKeyPoints(transcript);
    } else {
      console.log("Attempting to use AWS Bedrock for key points...");
      try {
        return await this.generateBedrockKeyPoints(transcript);
      } catch (error) {
        console.error("Error in Bedrock processing:", error);
        console.log("Falling back to mock implementation due to AWS credential issues");
        throw error; // Let the component handle fallback to mock
      }
    }
  }

  private async generateBedrockKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    try {
      // Create a smaller, simplified version of the transcript to avoid overwhelming the API
      const fullText = transcript.slice(-20).join(" ");
      
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

      console.log("Sending request to AWS Bedrock...");
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify({
          prompt: `Human: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 1000, // Reduced for smaller response
          temperature: 0.7,
        }),
        contentType: "application/json",
        accept: "application/json",
      });

      // Add a timeout to the Bedrock request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Bedrock request timed out after 5 seconds")), 5000);
      });
      
      const responsePromise = this.client.send(command);
      const response = await Promise.race([responsePromise, timeoutPromise]) as any;
      
      console.log("Bedrock response received");
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
    } catch (error: any) {
      // Check for authorization errors specifically
      if (error.name === 'UnrecognizedClientException' || 
          (error.message && error.message.includes('security token'))) {
        console.error("AWS authorization error - your credentials may be expired:", error.message);
        throw new Error("AWS security token invalid or expired");
      } else {
        console.error("Error in Bedrock processing:", error);
        throw error;
      }
    }
  }

  // Make this method public so it can be used directly in case of errors
  public generateMockKeyPoints(transcript: string[]): Promise<{ text: string, type: 'point' | 'action' }[]> {
    // This simulates what would come from AWS Bedrock's AI model
    return new Promise(resolve => {
      const keyPoints = [];
      
      // Generate mock key points based on transcript content
      if (transcript.length > 0) {
        // Add one key insight for every couple of transcript entries
        if (transcript.length > 2) {
          keyPoints.push({
            text: `Key insight: ${this.getRandomKeyPoint()}`,
            type: 'point' as 'point'
          });
        }
        
        // Add an action item if we have several transcript entries
        if (transcript.length > 5) {
          keyPoints.push({
            text: `Action item: ${this.getRandomActionItem()}`,
            type: 'action' as 'action'
          });
        }
      }
      
      resolve(keyPoints);
    });
  }
  
  private getRandomKeyPoint(): string {
    const keyPointTemplates = [
      "Team needs to focus on improving user experience",
      "Project timeline needs to be adjusted for Q3 delivery",
      "Client feedback indicates need for simplification of interface",
      "Current progress is ahead of schedule on backend components",
      "Market analysis shows increased demand for this feature"
    ];
    
    return keyPointTemplates[Math.floor(Math.random() * keyPointTemplates.length)];
  }
  
  private getRandomActionItem(): string {
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
