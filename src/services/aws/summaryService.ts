// src/services/aws/summaryService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SummaryResult {
  keyPoints: string[];
  actionItems: string[];
}

class SummaryService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isConfigured: boolean = false;

  constructor(apiKey: string) {
    console.log("SummaryService initialized with API key length:", apiKey?.length);
    
    if (!apiKey) {
      console.warn('Gemini API key not provided. Key point generation will not work.');
      this.isConfigured = false;
      return;
    }
    
    try {
      // Use the version parameter to explicitly set the API version
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash"  // Updated model name
      });
      
      this.isConfigured = true;
      console.log("Gemini API successfully initialized with model: gemini-1.0-pro");
    } catch (error) {
      console.error('Error initializing Gemini API:', error);
      this.isConfigured = false;
    }
  }

  async generateKeyPoints(transcript: string): Promise<SummaryResult> {
    if (!this.isConfigured || !this.model) {
      console.warn("Attempted to generate key points but API is not configured");
      return {
        keyPoints: ['API not configured. Please provide a valid Gemini API key.'],
        actionItems: ['Unable to generate action items without API configuration.']
      };
    }
    
    if (!transcript || transcript.trim() === '') {
      console.error('Empty transcript provided to generateKeyPoints');
      return {
        keyPoints: ['No transcript data available for analysis'],
        actionItems: ['No action items could be identified']
      };
    }
    
    try {
      console.log('Generating key points using model: gemini-1.0-pro');
      
      const prompt = `
        Analyze this meeting transcript and provide:
        1. 3-5 key points that summarize the important discussions
        2. Any action items or follow-ups mentioned
        
        Transcript:
        ${transcript}
        
        Format your response as JSON with the following structure:
        {
          "keyPoints": ["point1", "point2", ...],
          "actionItems": ["action1", "action2", ...]
        }
      `;
      
      // Add safety settings and generation config for better control
      const generationConfig = {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024,
      };
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = await result.response;
      const text = response.text();
      
      console.log('Raw AI response received, length:', text.length);
      
      // Extract JSON from the response
      try {
        // Try to parse direct JSON response
        const jsonData = JSON.parse(text);
        console.log('Successfully parsed direct JSON response');
        return jsonData;
      } catch (e) {
        console.log('Could not parse direct JSON, trying to extract...', e);
        // If not direct JSON, try to extract JSON from text
        const jsonMatch = text.match(/```json\n([\s\S]*)\n```/) || 
                         text.match(/{[\s\S]*}/);
                         
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          console.log('Extracted JSON from response');
          return JSON.parse(jsonStr);
        } else {
          console.log('No JSON format found, manually extracting');
          // Fallback: manually extract key points
          let keyPoints: string[] = ['Unable to parse key points'];
          let actionItems: string[] = ['Unable to parse action items'];
          
          if (text.includes('key points') || text.includes('Key points')) {
            const keyPointsSection = text.includes('key points') ? 
              text.split('key points')[1] : 
              text.split('Key points')[1];
              
            const actionItemsSection = keyPointsSection.includes('action items') ? 
              keyPointsSection.split('action items')[0] : 
              (keyPointsSection.includes('Action items') ? 
                keyPointsSection.split('Action items')[0] : keyPointsSection);
                
            const keyPointsMatches = actionItemsSection.match(/[-*•]\s*(.*)/g) || 
                                     actionItemsSection.match(/\d+\.\s+(.*)/g);
                                     
            if (keyPointsMatches) {
              keyPoints = keyPointsMatches.map(p => 
                p.replace(/[-*•]\s*/, '').replace(/\d+\.\s+/, '')
              );
            }
          }
          
          const actionItemsKeywords = ['action items', 'Action items', 'Action Items', 'Tasks', 'Follow-ups'];
          let actionItemsSection = '';
          
          for (const keyword of actionItemsKeywords) {
            if (text.includes(keyword)) {
              actionItemsSection = text.split(keyword)[1];
              break;
            }
          }
          
          if (actionItemsSection) {
            const actionItemsMatches = actionItemsSection.match(/[-*•]\s*(.*)/g) || 
                                      actionItemsSection.match(/\d+\.\s+(.*)/g);
                                      
            if (actionItemsMatches) {
              actionItems = actionItemsMatches.map(a => 
                a.replace(/[-*•]\s*/, '').replace(/\d+\.\s+/, '')
              );
            }
          }
          
          return { 
            keyPoints: keyPoints, 
            actionItems: actionItems 
          };
        }
      }
    } catch (error: any) {
      console.error('Error generating key points:', error);
      
      // Try fallback model if the first one fails
      try {
        console.log('Trying fallback model: gemini-pro');
        // Try with the original model name as fallback
        this.model = this.genAI!.getGenerativeModel({ 
          model: "gemini-pro" 
        });
        
        const prompt = `
          Analyze this meeting transcript and provide:
          1. 3-5 key points that summarize the important discussions
          2. Any action items or follow-ups mentioned
          
          Transcript:
          ${transcript}
          
          Give your response in simple text format.
        `;
        
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        
        const response = await result.response;
        const text = response.text();
        
        console.log('Fallback response received');
        
        // Simplified parsing for fallback
        const keyPointsMatch = text.match(/Key Points:([\s\S]*?)(?:Action Items:|$)/i);
        const actionItemsMatch = text.match(/Action Items:([\s\S]*)/i);
        
        const keyPoints = keyPointsMatch ? 
          keyPointsMatch[1].trim().split('\n').map(line => 
            line.replace(/^[-*•\d.]\s*/, '').trim()
          ).filter(line => line.length > 0) : 
          ['Testing revealed audio transcription functionality'];
          
        const actionItems = actionItemsMatch ? 
          actionItemsMatch[1].trim().split('\n').map(line => 
            line.replace(/^[-*•\d.]\s*/, '').trim()
          ).filter(line => line.length > 0) : 
          ['No specific action items identified'];
          
        return { keyPoints, actionItems };
        
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        return {
          keyPoints: ['Error generating key points: ' + error.message],
          actionItems: ['Please try again later']
        };
      }
    }
  }
}

export default SummaryService;