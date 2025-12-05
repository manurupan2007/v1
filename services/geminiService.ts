import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Topic, GeneratedContent, GameMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTypingContent = async (
  topic: Topic,
  difficulty: Difficulty,
  mode: GameMode
): Promise<GeneratedContent> => {
  try {
    let prompt = "";
    const isSurvival = mode === GameMode.SURVIVAL;
    
    if (isSurvival) {
       prompt = `Generate a JSON array of 40 distinct, single words related to the topic "${topic}". Difficulty: ${difficulty}. 
       Rules:
       - No spaces in individual words (unless it's code syntax).
       - For 'Code' topic, use keywords like 'function', 'return', 'const', 'import'.
       - For 'Story', use relevant nouns and verbs.
       - Words should vary in length based on difficulty.
       - Output purely the list of words.`;
    } else {
      // Classic Mode Prompts
      switch (topic) {
        case Topic.CODE:
          prompt = `Generate a short, valid, syntax-correct Python or JavaScript code snippet. It should be approximately 30-50 words long. Do not include markdown backticks. Difficulty: ${difficulty}.`;
          break;
        case Topic.STORY:
          prompt = `Write a very short, creative story (approx 40-60 words). It should be engaging. Difficulty: ${difficulty} (uses ${difficulty === Difficulty.HARD ? 'complex vocabulary' : 'simple words'}).`;
          break;
        case Topic.FACTS:
          prompt = `Provide 2-3 interesting random fun facts combined into a paragraph (approx 40-60 words). Difficulty: ${difficulty}.`;
          break;
        case Topic.JOKES:
          prompt = `Tell a few family-friendly one-liner jokes (approx 30-50 words total). Difficulty: ${difficulty}.`;
          break;
        case Topic.QUOTES:
          prompt = `Provide 2 famous inspirational quotes (approx 30-50 words total). Include the author names.`;
          break;
        default:
          prompt = "Generate a paragraph of random sentences for a typing test.";
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: isSurvival ? {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of words for the survival game."
            }
          },
          required: ["words"]
        } : {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The generated text content for the typing game. Plain text, no markdown.",
            },
          },
          required: ["text"],
        },
        systemInstruction: "You are a content generator for a typing game. Ensure content is clean and suitable for typing practice.",
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr) as GeneratedContent;
    
    // Fallback logic
    if (isSurvival) {
      if (!data.words || data.words.length === 0) {
        return { words: ["error", "loading", "gemini", "failed", "retry", "typing", "game", "fun"] };
      }
      return { words: data.words.map(w => w.trim()).filter(w => w.length > 0) };
    } else {
      if (!data.text) {
        return { text: "The quick brown fox jumps over the lazy dog. Programming is fun and rewarding." };
      }
      return { text: data.text.replace(/\s+/g, ' ').trim() };
    }

  } catch (error) {
    console.error("Error generating content:", error);
    if (mode === GameMode.SURVIVAL) {
      return { words: ["connection", "error", "check", "internet", "try", "again", "later"] };
    }
    return { text: "Failed to load content from Gemini. Please check your API key or internet connection." };
  }
};