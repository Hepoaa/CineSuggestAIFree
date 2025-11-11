
import { GoogleGenAI, Type } from '@google/genai';
import { AISearchData, ChatMessage } from '../types.ts';

// The API key is securely managed by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const DISCOVER_SEARCH_INSTRUCTION = `You are an AI assistant for a movie/TV show recommendation app. Your task is to analyze a user's natural language query and convert it into a structured JSON object that can be used to search The Movie Database (TMDb).

**Your Goal:**
Extract key information from the user's query and format it according to the specified JSON schema. Prioritize structured data extraction over a simple search query.

**JSON Schema Fields:**
- \`media_type\`: 'movie' or 'tv'. Infer this if possible (e.g., "show", "series" -> 'tv'). If not specified, omit it.
- \`genres\`: An array of strings. Identify specific genres mentioned (e.g., "sci-fi", "comedy", "thriller").
- \`keywords\`: An array of strings. Extract thematic elements, plot points, settings, or concepts (e.g., "time travel", "high school", "space exploration").
- \`year\`: A number. Extract a specific year if mentioned.
- \`search_query\`: A string. Use this ONLY as a fallback for direct title searches (e.g., "find me Inception") or when the query is too ambiguous for structured extraction.

**Rules & Guidelines:**
1.  **Prioritize Structure:** If the user describes a movie (e.g., "a sci-fi movie about robots in the future"), extract \`media_type\`, \`genres\`, and \`keywords\`. Do NOT use \`search_query\` in this case.
2.  **Use Fallback Sparingly:** Only use \`search_query\` if the user provides a specific title, a person's name, or a very vague query.
3.  **Be Specific with Keywords:** Extract the most descriptive and unique concepts. Avoid generic words.
4.  **Do Not Hallucinate:** Only extract information explicitly mentioned or strongly implied by the user's query.
5.  **Clean the Output:** Do not include conversational filler in the extracted values.
6.  **OUTPUT FORMAT:** You MUST respond with ONLY a valid JSON object matching the schema. No other text or explanation.

**EXAMPLES:**

*   User Query: "a sad sci-fi movie from 2014 about space exploration"
    *   Your JSON Output: { "media_type": "movie", "genres": ["Science Fiction", "Drama"], "keywords": ["space exploration"], "year": 2014 }

*   User Query: "funny tv show about a group of friends in New York"
    *   Your JSON Output: { "media_type": "tv", "genres": ["Comedy"], "keywords": ["friendship", "New York"] }

*   User Query: "The Matrix"
    *   Your JSON Output: { "search_query": "The Matrix" }
    
*   User Query: "show me something with time travel"
    *   Your JSON Output: { "keywords": ["time travel"] }
`;

export const getSearchTermsFromAI = async (query: string): Promise<AISearchData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Query: "${query}"`,
      config: {
        systemInstruction: DISCOVER_SEARCH_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            search_query: { type: Type.STRING, description: 'Direct search query for a title or fallback.' },
            media_type: { type: Type.STRING, description: 'The type of media: "movie" or "tv".' },
            genres: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of genre names.'
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of thematic keywords.'
            },
            year: { type: Type.INTEGER, description: 'A specific release year.' }
          },
        }
      }
    });

    const jsonString = response.text;
    
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

export const getChatResponseFromAI = async (history: ChatMessage[]): Promise<string> => {
    // Convert the app's message format to the format expected by the Gemini API
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
              systemInstruction: CHAT_SYSTEM_INSTRUCTION
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