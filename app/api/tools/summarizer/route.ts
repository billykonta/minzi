import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { text, length = 'medium', style = 'bullet', highlightConcepts = true } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let lengthDescription = '';
    if (length === 'short') lengthDescription = 'a brief 1-2 paragraph summary';
    else if (length === 'medium') lengthDescription = 'a comprehensive 3-4 paragraph summary';
    else if (length === 'long') lengthDescription = 'a detailed 5+ paragraph summary';

    let styleDescription = '';
    if (style === 'bullet') styleDescription = 'bullet points';
    else if (style === 'paragraph') styleDescription = 'paragraphs';
    else if (style === 'outline') styleDescription = 'an outline with headings and subpoints';

    const highlightInstruction = highlightConcepts 
      ? 'Highlight key concepts by making them bold.' 
      : '';

    const prompt = `Create ${lengthDescription} of the following text using ${styleDescription}. ${highlightInstruction}
Text: ${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system' as const, content: 'You are an AI that creates concise and informative summaries of educational content.' },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;
    
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error in summarizer route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
