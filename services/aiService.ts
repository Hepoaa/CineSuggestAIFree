import { GoogleGenAI, Type } from '@google/genai';
import { AISearchData, ChatMessage } from '../types.ts';

// Initialize the GoogleGenAI client.
// The API key is automatically sourced from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the JSON schema for the AI's search term extraction response.
const searchSchema = {
    type: Type.OBJECT,
    properties: {
        media_type: { type: Type.STRING, description: 'Can be "movie" or "tv". Infer if possible from words like "show" or "series".' },
        genres: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'An array of genres mentioned, like "Sci-Fi", "Comedy", or "Thriller".'
        },
        keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'An array of thematic elements, plot points, or concepts like "time travel", "dystopian future".'
        },
        year: { type: Type.INTEGER, description: 'A specific year if mentioned.' },
        search_query: { type: Type.STRING, description: 'Use this ONLY for direct title searches like "Inception", or very ambiguous queries. For descriptive queries, use other fields instead.' },
    },
};

const DISCOVER_SEARCH_INSTRUCTION = `You are an AI assistant for a movie/TV show recommendation app. Your task is to analyze a user's natural language query and convert it into a structured JSON object that can be used to search The Movie Database (TMDb).

**Your Goal:**
Extract key information from the user's query and format it according to the specified JSON schema. Prioritize structured data extraction over a simple search query.

**Rules & Guidelines:**
1.  **Prioritize Structure:** If the user describes a movie (e.g., "a sci-fi movie about robots in the future"), extract \`media_type\`, \`genres\`, and \`keywords\`. Do NOT use \`search_query\` in this case.
2.  **Use Fallback Sparingly:** Only use \`search_query\` if the user provides a specific title, a person's name, or a very vague query.
3.  **Be Specific with Keywords:** Extract the most descriptive and unique concepts. Avoid generic words.
4.  **Do Not Hallucinate:** Only extract information explicitly mentioned or strongly implied by the user's query.

**EXAMPLES:**

*   User Query: "a sad sci-fi movie from 2014 about space exploration"
    *   Expected JSON: { "media_type": "movie", "genres": ["Science Fiction", "Drama"], "keywords": ["space exploration"], "year": 2014 }

*   User Query: "funny tv show about a group of friends in New York"
    *   Expected JSON: { "media_type": "tv", "genres": ["Comedy"], "keywords": ["friendship", "New York"] }

*   User Query: "The Matrix"
    *   Expected JSON: { "search_query": "The Matrix" }
    
*   User Query: "show me something with time travel"
    *   Expected JSON: { "keywords": ["time travel"] }
`;

/**
 * Analyzes a user's query using the Gemini API to extract structured search terms.
 * @param query The natural language query from the user.
 * @returns A promise that resolves to an AISearchData object.
 */
export const getSearchTermsFromAI = async (query: string): Promise<AISearchData> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${DISCOVER_SEARCH_INSTRUCTION}\n\nUser Query: "${query}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: searchSchema,
        }
    });

    const jsonString = response.text.trim();

    if (!jsonString) {
      throw new Error("AI returned an empty response.");
    }
    
    return JSON.parse(jsonString) as AISearchData;

  } catch (error) {
    console.error("Error calling Gemini API for search:", error);
    console.warn("AI search term generation failed. Falling back to raw query.");
    return { search_query: query };
  }
};

const CHAT_SYSTEM_INSTRUCTION = `You are CineSuggest AI, a friendly and knowledgeable chatbot specializing in movies and TV shows. Your goal is to have a natural conversation with the user, helping them discover new things to watch, answer trivia, or just chat about film. Be conversational, engaging, and helpful. Don't just provide lists; explain why you're suggesting something. Keep your responses concise and easy to read.`;

/**
 * Gets a conversational response from the Gemini API based on chat history.
 * @param history An array of previous chat messages.
 * @returns A promise that resolves to the AI's string response.
 */
export const getChatResponseFromAI = async (history: ChatMessage[]): Promise<string> => {
    const contents = history
        .filter(msg => msg.role !== 'error')
        .map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: CHAT_SYSTEM_INSTRUCTION,
            }
        });

        const content = response.text;

        if (!content) {
            throw new Error("AI returned an empty or invalid chat response.");
        }
        
        return content;
    } catch (error) {
        console.error("Error calling Gemini API for chat:", error);
        throw new Error("Failed to get chat response from AI.");
    }
};
