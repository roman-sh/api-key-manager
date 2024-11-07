import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

// Get API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const model = new ChatOpenAI({
  temperature: 0.5,
  modelName: 'gpt-3.5-turbo',
  openAIApiKey: OPENAI_API_KEY
});

// Create prompt template correctly
const promptTemplate = PromptTemplate.fromTemplate(`You are a technical documentation expert. 
Analyze this README.md content and provide a concise summary:

{readme_content}

Focus on:
1. Project's main purpose
2. Key features
3. Technologies used

Keep the summary brief and informative.`);

const chain = RunnableSequence.from([
  {
    formatted: async (input) => {
      const prompt = await promptTemplate.format({ 
        readme_content: input.readme_content 
      });
      return prompt;
    }
  },
  async (input) => {
    try {
      const response = await model.invoke(input.formatted);
      return {
        summary: response.content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }
]);

export async function summarizeReadme(readmeContent) {
  try {
    const result = await chain.invoke({
      readme_content: readmeContent,
    });
    
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('Chain execution error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
} 