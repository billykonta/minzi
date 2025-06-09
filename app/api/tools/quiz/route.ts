import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { text, subject, difficulty = 'medium', count = 10 } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const prompt = `Create a quiz with ${count} questions based on the following text. 
The subject is ${subject || 'general knowledge'} and the difficulty level should be ${difficulty}.
Each question should be multiple choice with 4 options and only one correct answer.
Format the output as a JSON object with an array of question objects, each containing:
1. "question": the question text
2. "options": array of 4 possible answers
3. "correctAnswer": the index (0-3) of the correct answer
4. "explanation": brief explanation of why the answer is correct

Text: ${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system' as const, content: 'You are an AI that creates educational quizzes. Your responses should be in valid JSON format only.' },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    
    // Parse the JSON response
    const quiz = JSON.parse(responseContent || '{"questions":[]}');

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error('Error in quiz route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
