
import { GoogleGenAI, Type } from "@google/genai";
import { CaptionSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Uses Gemini 3 Pro Preview to analyze the image and generate captions.
 */
export const getMagicCaptions = async (base64Image: string): Promise<CaptionSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Analyze this image and provide 5 funny, sarcastic, or trending meme captions. For each caption, provide a short explanation of why it fits." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The funny meme caption text" },
              explanation: { type: Type.STRING, description: "Why this caption works for the image context" }
            },
            required: ["text", "explanation"]
          }
        }
      }
    });

    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating magic captions:", error);
    throw error;
  }
};

/**
 * Uses Gemini 2.5 Flash Image to edit an image based on a text prompt.
 */
export const editMemeImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/jpeg;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from editing service.");
  } catch (error) {
    console.error("Error editing image with AI:", error);
    throw error;
  }
};
