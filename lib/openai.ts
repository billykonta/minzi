import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in getChatCompletion:', error);
    throw error;
  }
}
