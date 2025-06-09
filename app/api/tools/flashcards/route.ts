import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { text, count = 20, difficulty = 'medium' } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const prompt = `Create ${count} flashcards based on the following text. 
Each flashcard should have a question on the front and the answer on the back.
The difficulty level should be ${difficulty}.
Format the output as a JSON array of objects with "front" and "back" properties.
Text: ${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system' as const, content: 'You are an AI that creates educational flashcards. Your responses should be in valid JSON format only.' },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    
    // Parse the JSON response
    const flashcards = JSON.parse(responseContent || '{"flashcards":[]}');

    return NextResponse.json(flashcards);
  } catch (error: any) {
    console.error('Error in flashcards route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
