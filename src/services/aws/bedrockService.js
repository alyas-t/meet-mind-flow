// src/services/bedrockService.js
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1", // Use your AWS region
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// Function to get a response from Claude
export async function generateClaudeResponse(prompt, options = {}) {
  try {
    const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0"; 
    
    const input = {
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error("Error calling Claude via Bedrock:", error);
    throw error;
  }
}

// For summarizing meeting transcripts
export async function summarizeMeetingWithClaude(transcript) {
  const prompt = `
    Below is a transcript from a meeting. Please:
    1. Provide a concise summary of the key points discussed
    2. List all action items mentioned, with responsible parties if specified
    3. Note any important decisions made
    4. Highlight any deadlines or follow-up meetings mentioned

    Transcript:
    ${transcript}
  `;

  return generateClaudeResponse(prompt, { temperature: 0.3 });
}

// For generating insights and analysis
export async function analyzeMeetingWithClaude(transcript) {
  const prompt = `
    Analyze the following meeting transcript and provide:
    1. Main themes and topics
    2. Sentiment analysis of the discussion
    3. Potential issues or concerns that were raised
    4. Suggestions for follow-up items
    
    Transcript:
    ${transcript}
  `;

  return generateClaudeResponse(prompt, { temperature: 0.4 });
}