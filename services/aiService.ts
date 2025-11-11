import { GoogleGenAI, Type } from '@google/genai';
import { AISearchData, ChatMessage } from '../types.ts';

// The API key is securely managed by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const FLEXIBLE_SEARCH_INSTRUCTION = `You are an AI search query pre-processor for a movie/TV show database. Your mission is to translate a user's query into an optimal search string for a flexible, metadata-based search engine. The search must be exhaustive and ignore people (actors, directors).

**The Search Engine's Logic (Your Target):**
1.  **Multi-Field Search:** It searches across all metadata: title, genre, thematic tags, visual tags, and synopsis.
2.  **"OR" Logic:** It treats every word in your output string as an "OR" condition. (e.g., "robot future rain" finds movies with 'robot' OR 'future' OR 'rain').
3.  **Typo Tolerance:** It has a built-in fuzzy match for minor spelling errors.

**Your Task & Rules:**

1.  **Analyze and Clean:** Read the user's query. Remove conversational filler and common stop words (e.g., 'peliculas de', 'a movie about', 'y', 'con').
2.  **Correct Typos:** Fix obvious spelling mistakes in core terms (e.g., 'magi' -> 'magia', 'distpia' -> 'distopía').
3.  **Extract Core Concepts:** Isolate the essential keywords that represent the title, genre, themes, or plot points.
4.  **Build the "OR" Query:** Combine these core keywords into a single, space-separated string. This is the final search query. Do not add any operators like "OR".
5.  **NO HUMAN ENTITIES:** Strictly ignore and remove any names of actors, directors, or characters from the final query.
6.  **OUTPUT FORMAT:** You MUST respond with ONLY a valid JSON object with a single key 'search_query'. No other text or explanation.

**EXAMPLES:**

*   User Query: "peliculas de magia y amistad"
    *   Your JSON Output: { "search_query": "magia amistad" }

*   User Query: "robot futuro lluvia"
    *   Your JSON Output: { "search_query": "robot futuro lluvia" }

*   User Query: "a show about a distopía with androids, directed by Ridley Scott"
    *   Your JSON Output: { "search_query": "distopía androids" }

*   User Query: "Terminator"
    *   Your JSON Output: { "search_query": "Terminator" }
`;

export const getSearchTermsFromAI = async (query: string): Promise<AISearchData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Query: "${query}"`,
      config: {
        systemInstruction: FLEXIBLE_SEARCH_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            search_query: {
              type: Type.STRING,
              description: 'The processed search query string with core concepts separated by spaces.'
            }
          },
          required: ['search_query']
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
