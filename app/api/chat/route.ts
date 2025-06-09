import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { STUDY_ASSISTANT_PROMPT, generateContextPrompt } from '@/lib/study-assistant-config';
import { ChatMessage, ChatSession } from '@/types/database';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    // Create Supabase client with server-side auth
    const cookieHeader = req.headers.get('cookie') || '';
    const getTokenFromCookies = (name: string): string | undefined => {
      const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
      return match ? match[1] : undefined;
    };
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    
    // Get the access token from the cookie header
    const accessToken = getTokenFromCookies('sb-access-token');
    const refreshToken = getTokenFromCookies('sb-refresh-token');
    
    if (accessToken && refreshToken) {
      await supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
    
    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { messages, model, sessionId, attachments } = await req.json() as {
      messages: { role: string; content: string; id?: string }[];
      model?: string;
      sessionId?: string;
      attachments?: { path: string; name: string; type: string; size: number }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get or create a chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
          model: model || 'default'
        })
        .select()
        .single();
      
      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
      }
      
      currentSessionId = newSession.id;
    }
    
    // Get the last message (which should be from the user)
    const lastMessage = messages[messages.length - 1];
    
    // Insert the user message into the database
    const { data: dbMessage, error: messageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: lastMessage.role,
        content: lastMessage.content
      })
      .select()
      .single();
    
    if (messageError) {
      console.error('Error saving message:', messageError);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }
    
    // Handle file attachments if any
    if (attachments && attachments.length > 0) {
      const attachmentInserts = attachments.map(attachment => ({
        message_id: dbMessage.id,
        file_path: attachment.path,
        file_name: attachment.name,
        file_type: attachment.type,
        file_size: attachment.size
      }));
      
      const { error: attachmentError } = await supabaseClient
        .from('chat_attachments')
        .insert(attachmentInserts);
      
      if (attachmentError) {
        console.error('Error saving attachments:', attachmentError);
        // Continue anyway, as this is not critical
      }
    }
    
    // Create the full message array with system prompts
    const fullMessages = [
      { role: 'system' as const, content: STUDY_ASSISTANT_PROMPT },
      { role: 'system' as const, content: generateContextPrompt({}) },
      ...messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
    ];
    
    // If there are attachments, add context about them
    if (attachments && attachments.length > 0) {
      const attachmentContext = `The user has attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}. ` +
        `File types: ${attachments.map(a => a.type).join(', ')}. Please acknowledge these attachments in your response.`;
      
      fullMessages.push({
        role: 'system' as const,
        content: attachmentContext
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6, // Encourages new information
      frequency_penalty: 0.5, // Reduces repetition
    });

    // Save the assistant's response to the database
    const assistantResponse = completion.choices[0].message.content;
    
    await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: assistantResponse
      });
    
    // Update the session title if it's a new conversation
    if (!sessionId) {
      // Extract a title from the first user message
      const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
      const truncatedTitle = firstUserMessage.substring(0, 50) + (firstUserMessage.length > 50 ? '...' : '');
      
      await supabaseClient
        .from('chat_sessions')
        .update({ title: truncatedTitle })
        .eq('id', currentSessionId);
    }
    
    return NextResponse.json({
      response: assistantResponse,
      sessionId: currentSessionId
    });
  } catch (error: any) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
