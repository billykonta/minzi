import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, StopCircle, Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MascotIcon } from '@/components/mascot-icon';

interface VoiceConversationProps {
  onClose: () => void;
  onSendMessage: (content: string) => Promise<string>;
}

export function VoiceConversation({ onClose, onSendMessage }: VoiceConversationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [isListening]);

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    speechSynthesisRef.current.rate = 1.0;
    speechSynthesisRef.current.pitch = 1.0;
    speechSynthesisRef.current.volume = 1.0;
    
    // Use a more natural voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Female')
    );
    
    if (preferredVoice) {
      speechSynthesisRef.current.voice = preferredVoice;
    }
    
    speechSynthesisRef.current.onstart = () => {
      setIsSpeaking(true);
    };
    
    speechSynthesisRef.current.onend = () => {
      setIsSpeaking(false);
      // Resume listening after speaking
      if (!isListening && !isProcessing) {
        startListening();
      }
    };
    
    speechSynthesisRef.current.onerror = (event) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
    };
    
    // Populate voices when they are loaded
    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Female')
      );
      
      if (preferredVoice && speechSynthesisRef.current) {
        speechSynthesisRef.current.voice = preferredVoice;
      }
    };
    
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    recognitionRef.current?.start();
  };

  const stopListening = async () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    
    if (transcript.trim()) {
      await sendMessage(transcript);
      setTranscript('');
    }
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage = { role: 'user' as const, content };
    setMessages(prev => [...prev, userMessage]);
    
    setIsProcessing(true);
    
    try {
      // Get response from AI
      const response = await onSendMessage(content);
      
      // Add assistant message
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response if not muted
      if (!muted) {
        speakText(response);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Set the text to speak
    speechSynthesisRef.current.text = text;
    
    // Start speaking
    speechSynthesis.speak(speechSynthesisRef.current);
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (isSpeaking && !muted) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePauseResumeSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.pause();
    } else {
      speechSynthesis.resume();
    }
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-md flex-col rounded-lg border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <MascotIcon size="sm" className="h-6 w-6" />
            Voice Conversation
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MascotIcon size="lg" className="mb-4" />
              <p className="max-w-xs">
                Start a voice conversation with Mindzi. Click the microphone button below to begin speaking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 rounded-lg p-3 shadow-sm",
                    message.role === "user" 
                      ? "ml-auto bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}
                >
                  {message.role === "assistant" && (
                    <MascotIcon size="sm" className="mt-1 h-5 w-5 flex-shrink-0" />
                  )}
                  <div className="text-sm">{message.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {transcript && (
          <div className="border-t border-b bg-muted/50 p-3">
            <p className="text-sm italic text-muted-foreground">
              {transcript}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-4 p-4">
          {isSpeaking && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handlePauseResumeSpeech}
            >
              {isSpeaking ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          )}
          
          <Button
            type="button"
            variant={isListening ? "destructive" : "default"}
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
          >
            {isListening ? (
              <StopCircle className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
          
          {isProcessing && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
