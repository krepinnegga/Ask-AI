import axios from 'axios';
import { Alert } from 'react-native';

// Types for API responses and parameters
interface GeminiTranscribeResponse {
  text: string;
}

interface GeminiStreamResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

interface ConversationMessage {
  role: "user" | "model";
  parts: { text: string } | { text?: string, inlineData?: { mimeType: string, data: string } }[];
}

/**
 * Transcribes audio to text using Gemini API
 * @param uri URI of the audio file
 * @returns Transcribed text
 */
export const transcribeAudio = async (uri: string): Promise<string> => {
  try {
    // Convert audio file to base64
    const base64Data = await fileToBase64(uri);

    const requestBody = {
      contents: [{
        parts: [{
          inlineData: {
            mimeType: "audio/wav",
            data: base64Data
          }
        }]
      }]
    };

    const apiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return apiResponse.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Transcription error:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Response error:", error.response?.data);
    }
    Alert.alert("Error", "Failed to transcribe audio");
    return "";
  }
};

/**
 * Helper function to convert a file URI to base64
 * @param uri URI of the file
 * @returns Base64 string
 */
export const fileToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("File to base64 conversion error:", error);
    throw error;
  }
};

/**
 * Analyzes an image and gets a description using Gemini API
 * @param uri URI of the image file
 * @param prompt Optional prompt to guide the image analysis
 * @param history Previous conversation history
 * @returns The complete response text and updated history
 */
export const analyzeImage = async (
  uri: string,
  prompt: string = "Describe this image in detail",
  history: ConversationMessage[] = []
): Promise<{ text: string; history: ConversationMessage[]; error?: boolean }> => {
  try {
    // Convert image to base64
    const base64Data = await fileToBase64(uri);

    // Create a new user message with image
    const userMessage: ConversationMessage = {
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        }
      ]
    };

    // Format history for API by removing UI-specific properties
    const apiHistory = history.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    // Combine formatted history with the new message
    const contents = [...apiHistory, userMessage];

    const requestData = {
      contents,
      systemInstruction: {
        parts: [{
          text: "You are a friendly AI assistant who responds naturally and refers to yourself as Ask AI when asked for your name. You are a helpful assistant who can answer questions and help with tasks. You must always respond in English, no matter the input language, and provide helpful, clear answers."
        }]
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Get the model's response
    const modelResponse = response.data.candidates[0].content.parts[0].text;

    // Create model message for history
    const modelMessage: ConversationMessage = {
      role: "model",
      parts: [{ text: modelResponse }]
    };

    // Return both the response text and updated history
    return {
      text: modelResponse,
      history: [...history, userMessage, modelMessage],
      error: false
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Response error:", error.response?.data);
    }
    Alert.alert("Error", "Failed to analyze image");
    return { text: "", history, error: true };
  }
};

/**
 * Sends content (text or audio) to Gemini API and gets a response
 * @param content Text string or audio URI to send to Gemini
 * @param history Previous conversation history
 * @param contentType Optional type of content ('text' or 'audio')
 * @returns The complete response text and updated history
 */
export const generateContent = async (
  content: string,
  history: ConversationMessage[] = [],
  contentType: 'text' | 'audio' = 'text'
): Promise<{ text: string; history: ConversationMessage[]; error?: boolean }> => {
  try {
    // Create a new user message based on content type
    let userMessage: ConversationMessage;

    if (contentType === 'audio') {
      const base64Data = await fileToBase64(content);
      userMessage = {
        role: "user",
        parts: [{
          inlineData: {
            mimeType: "audio/wav",
            data: base64Data
          }
        }]
      };
    } else {
      userMessage = {
        role: "user",
        parts: [{ text: content }]
      };
    }

    // Format history for API by removing UI-specific properties
    const apiHistory = history.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    // Combine formatted history with the new message
    const contents = [...apiHistory, userMessage];

    const requestData = {
      contents,
      systemInstruction: {
        parts: [{
          text: "You are a friendly AI assistant who responds naturally and refers to yourself as Ask AI when asked for your name. You are a helpful assistant who can answer questions and help with tasks. You must always respond in English, no matter the input language, and provide helpful, clear answers."
        }]
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Get the model's response
    const modelResponse = response.data.candidates[0].content.parts[0].text;

    // Create model message for history
    const modelMessage: ConversationMessage = {
      role: "model",
      parts: [{ text: modelResponse }]
    };

    // Return both the response text and updated history
    return {
      text: modelResponse,
      history: [...history, userMessage, modelMessage],
      error: false
    };
  } catch (error) {
    console.error("Error generating content:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Response error:", error.response?.data);
    }
    Alert.alert("Error", "Failed to get response from AI");
    return { text: "", history, error: true };
  }
};
