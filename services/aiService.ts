import { AISearchData, ChatMessage } from '../types.ts';
import { OPENROUTER_API_KEY, OPENROUTER_API_BASE_URL, OPENROUTER_CHAT_MODEL } from '../constants.ts';

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
    const response = await fetch(`${OPENROUTER_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENROUTER_CHAT_MODEL,
        messages: [
          { role: 'system', content: DISCOVER_SEARCH_INSTRUCTION },
          { role: 'user', content: `User Query: "${query}"` }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-json error responses
        const errorMessage = errorData.error?.message || 'Unknown API error';
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorMessage}`);
    }

    const data = await response.json();
    const jsonString = data.choices[0]?.message?.content;

    if (!jsonString) {
      throw new Error("AI returned an empty response.");
    }
    
    return JSON.parse(jsonString) as AISearchData;

  } catch (error) {
    console.error("Error calling OpenRouter API for search:", error);
    console.warn("AI search term generation failed. Falling back to raw query.");
    return { search_query: query };
  }
};

const CHAT_SYSTEM_INSTRUCTION = `You are CineSuggest AI, a friendly and knowledgeable chatbot specializing in movies and TV shows. Your goal is to have a natural conversation with the user, helping them discover new things to watch, answer trivia, or just chat about film. Be conversational, engaging, and helpful. Don't just provide lists; explain why you're suggesting something. Keep your responses concise and easy to read.`;

export const getChatResponseFromAI = async (history: ChatMessage[]): Promise<string> => {
    const messages = history
        .filter(msg => msg.role !== 'error')
        .map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        }));

    try {
        const response = await fetch(`${OPENROUTER_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OPENROUTER_CHAT_MODEL,
                messages: [
                    { role: 'system', content: CHAT_SYSTEM_INSTRUCTION },
                    ...messages
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || 'Unknown API error';
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorMessage}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("AI returned an empty or invalid chat response.");
        }
        
        return content;
    } catch (error) {
        console.error("Error calling OpenRouter API for chat:", error);
        throw new Error("Failed to get chat response from AI.");
    }
};