"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MascotIcon } from "@/components/mascot-icon"
import { 
  SendHorizonal, 
  Mic, 
  Copy, 
  RefreshCw, 
  Trash2,
  MessageSquare,
  Plus,
  Code,
  Loader2, 
  Menu,
  X,
  Check,
  ChevronRight,
  Settings,
  PaperclipIcon,
  ImageIcon,
  FileIcon,
  FileTextIcon,
  Camera
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FileUpload } from "@/components/file-upload"
import { FileUpload as FileUploadType } from "@/types/database"
import { uploadFile } from "@/lib/file-upload"
import { createClient } from "@supabase/supabase-js"
import { CameraCapture } from "@/components/camera-capture"
import { VoiceConversation } from "@/components/voice-conversation"

// Chat models and functionality
const CHAT_MODELS = [
  { id: "default", name: "Mindzi AI", description: "Fast and helpful for most questions" },
  { id: "advanced", name: "Mindzi Advanced", description: "More capable for complex topics" },
];

// Sample chat history for demonstration
const SAMPLE_CHAT_HISTORY = [
  { id: "chat-1", title: "Math Homework Help", date: "Today" },
  { id: "chat-2", title: "Physics Concepts", date: "Today" },
  { id: "chat-3", title: "Essay Structure", date: "Yesterday" },
  { id: "chat-4", title: "Chemistry Formulas", date: "Yesterday" },
  { id: "chat-5", title: "History Timeline", date: "Apr 28" },
];

type Attachment = {
  path: string;
  name: string;
  type: string;
  size: number;
  url?: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
};

type ChatSession = {
  id: string;
  title: string;
  date: string;
};

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi there! I'm Mindzi, your AI learning assistant. I'm here to help with your studies, answer questions, explain concepts, or just chat about whatever's on your mind. What would you like to talk about today?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState("default")
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(SAMPLE_CHAT_HISTORY)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showCameraCapture, setShowCameraCapture] = useState(false)
  const [showVoiceConversation, setShowVoiceConversation] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileUploadType[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get theme-specific message styles
  const getMessageStyles = () => {
    switch(theme) {
      case 'forest':
        return {
          assistant: "bg-gradient-to-r from-emerald-900/90 to-green-900/90 border border-emerald-700/50 text-white",
          typing: "bg-gradient-to-r from-emerald-900/90 to-green-900/90 border border-emerald-700/50",
          dots: "bg-emerald-400"
        }
      case 'sunset':
        return {
          assistant: "bg-gradient-to-r from-orange-900/90 to-purple-900/90 border border-orange-700/50 text-white",
          typing: "bg-gradient-to-r from-orange-900/90 to-purple-900/90 border border-orange-700/50",
          dots: "bg-orange-400"
        }
      case 'midnight':
        return {
          assistant: "bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border border-blue-700/50 text-white",
          typing: "bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border border-blue-700/50",
          dots: "bg-blue-400"
        }
      case 'dark':
        return {
          assistant: "bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/50 text-white",
          typing: "bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/50",
          dots: "bg-blue-400"
        }
      default: // light theme
        return {
          assistant: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100",
          typing: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100",
          dots: "bg-primary"
        }
    }
  }

  useEffect(() => {
    const topic = searchParams.get("topic")
    
    if (topic) {
      // Add a system message about the topic
      const topicMessage: Message = {
        id: messages.length + 1,
        role: "assistant",
        content: `I see you're interested in ${topic}. What would you like to know about this topic?`,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, topicMessage])

      // Pre-fill the input with a suggested question
      setInput(`Can you explain the key concepts of ${topic}?`)
    }
  }, [searchParams])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Start a new chat session
  const startNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newChat = {
      id: newChatId,
      title: "New Conversation",
      date: "Today"
    }
    setChatHistory(prev => [newChat, ...prev])
    setActiveChatId(newChatId)
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: "Hi there! I'm Mindzi, your AI learning assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      }
    ])
  }

  // Handle voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
    } else {
      // Open the advanced voice conversation mode
      setShowVoiceConversation(true)
    }
  }
  
  // Handle camera capture
  const toggleCameraCapture = () => {
    setShowCameraCapture(true)
  }
  
  // Handle image captured from camera
  const handleImageCaptured = (file: File) => {
    // Create a preview for the captured image
    const preview = URL.createObjectURL(file);
    
    // Add to selected files
    setSelectedFiles(prev => [
      ...prev,
      {
        file,
        preview,
        uploading: false
      }
    ]);
    
    // Show the file upload area to display the captured image
    setShowFileUpload(true);
  }
  
  // Handle file uploads
  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload)
  }
  
  const handleFilesSelected = (files: FileUploadType[]) => {
    setSelectedFiles(prev => [...prev, ...files])
  }
  
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const uploadFiles = async (): Promise<Attachment[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    
    setUploadingFiles(true)
    
    try {
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (fileUpload) => {
          if (fileUpload.error) return null
          
          const { path, error } = await uploadFile(fileUpload.file, user.id)
          if (error) return null
          
          return {
            path,
            name: fileUpload.file.name,
            type: fileUpload.file.type,
            size: fileUpload.file.size
          } as Attachment
        })
      )
      
      return uploadedFiles.filter(Boolean) as Attachment[]
    } catch (error) {
      console.error('Error uploading files:', error)
      return []
    } finally {
      setUploadingFiles(false)
    }
  }

  // Copy message content to clipboard
  const copyMessageContent = (content: string, messageId: number) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  // Regenerate the last assistant response
  const regenerateResponse = () => {
    // Find the last assistant message
    const lastAssistantIndex = [...messages].reverse().findIndex(m => m.role === "assistant")
    if (lastAssistantIndex !== -1) {
      const newMessages = messages.slice(0, messages.length - lastAssistantIndex)
      setMessages(newMessages)
      handleSend(newMessages[newMessages.length - 1].content)
    }
  }

  const handleSend = async (userContent?: string) => {
    const messageContent = userContent || input
    if (!messageContent.trim() && selectedFiles.length === 0) return

    // Process file uploads if any
    let attachments: Attachment[] = []
    if (selectedFiles.length > 0) {
      attachments = await uploadFiles() as Attachment[]
      setSelectedFiles([])
      setShowFileUpload(false)
    }

    // Add user message if not regenerating
    if (!userContent) {
      const userMessage: Message = {
        id: messages.length + 1,
        role: "user",
        content: messageContent,
        timestamp: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined
      }
      setMessages((prev) => [...prev, userMessage])
    }
    
    setInput("")
    setIsLoading(true)

    try {
      // Call our chat API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: currentModel,
          sessionId,
          attachments: attachments.length > 0 ? attachments : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Save the session ID if this is a new conversation
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
        setActiveChatId(data.sessionId)
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Custom renderer for code blocks in markdown
  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter
        style={theme === 'light' ? undefined : atomDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] max-w-[1200px] flex-col p-4 md:h-screen md:p-6">
      <div className="flex h-full gap-4">
        {/* Chat History Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              <div className="border-b p-4">
                <Button onClick={startNewChat} className="w-full gap-2">
                  <Plus className="h-4 w-4" /> New Chat
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                      activeChatId === chat.id && "bg-muted"
                    )}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <div className="flex-1 truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">{chat.date}</div>
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Chat History Sidebar (Desktop) */}
        <div className="hidden w-[260px] flex-col border-r md:flex">
          <div className="border-b p-4">
            <Button onClick={startNewChat} className="w-full gap-2">
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                  activeChatId === chat.id && "bg-muted"
                )}
                onClick={() => setActiveChatId(chat.id)}
              >
                <MessageSquare className="h-4 w-4" />
                <div className="flex-1 truncate">{chat.title}</div>
                <div className="text-xs text-muted-foreground">{chat.date}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Chat Area */}
        <Card className="flex h-full flex-1 flex-col">
        <CardHeader className="border-b px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MascotIcon size="sm" className="h-6 w-6" />
              Mindzi Chat
            </CardTitle>
            <div className="flex gap-2">
              <Select value={currentModel} onValueChange={setCurrentModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {CHAT_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative flex max-w-[85%] gap-3 rounded-lg p-4 shadow-md ${
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : getMessageStyles().assistant
                  }`}
                >
                  {message.role === "assistant" && (
                    <MascotIcon size="sm" className="mt-1 h-6 w-6 flex-shrink-0" withAnimation={false} />
                  )}
                  <div className="flex-1">
                    <div className={`text-sm ${message.role === "assistant" ? "font-medium" : ""}`}>
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            code: CodeBlock,
                            // Add more custom renderers as needed
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    {/* Display attachments if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2 rounded-md border bg-background p-2 text-sm shadow-sm"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                              {attachment.type.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : attachment.type === 'application/pdf' ? (
                                <FileTextIcon className="h-4 w-4" />
                              ) : (
                                <FileIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="max-w-[150px] truncate font-medium">
                                {attachment.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2">
                        {message.role === "assistant" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-full opacity-50 hover:opacity-100"
                              onClick={() => copyMessageContent(message.content, message.id)}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            {message.id === messages[messages.length - 1].id && message.role === "assistant" && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 rounded-full opacity-50 hover:opacity-100"
                                onClick={regenerateResponse}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      <div
                        className={`text-right text-xs ${message.role === "user" ? "opacity-70" : "text-muted-foreground"}`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="mt-1 h-6 w-6 flex-shrink-0">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`flex max-w-[85%] gap-3 rounded-lg ${getMessageStyles().typing} p-4 shadow-md`}>
                  <MascotIcon size="sm" className="mt-1 flex-shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 animate-bounce rounded-full ${getMessageStyles().dots}`}></div>
                    <div
                      className={`h-2 w-2 animate-bounce rounded-full ${getMessageStyles().dots}`}
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className={`h-2 w-2 animate-bounce rounded-full ${getMessageStyles().dots}`}
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-3">
          <form 
            className="flex w-full items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="flex w-full flex-col gap-2">
              {showFileUpload && (
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  onFileRemove={handleFileRemove}
                  selectedFiles={selectedFiles}
                  disabled={isLoading || uploadingFiles}
                />
              )}
              
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-full ${showFileUpload ? 'bg-muted text-primary' : ''}`}
                  onClick={toggleFileUpload}
                  disabled={isLoading}
                >
                  <PaperclipIcon className="h-5 w-5" />
                  <span className="sr-only">Attach files</span>
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={toggleCameraCapture}
                  disabled={isLoading}
                >
                  <Camera className="h-5 w-5" />
                  <span className="sr-only">Take photo</span>
                </Button>
                
                <div className="relative flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Mindzi..."
                    className="min-h-10 pr-10 flex-1 resize-none rounded-xl border-0 bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0"
                    rows={1}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute right-2 bottom-2 h-6 w-6 rounded-full ${isListening ? 'text-red-500' : ''}`}
                    onClick={toggleVoiceInput}
                  >
                    <Mic className="h-4 w-4" />
                    <span className="sr-only">Voice input</span>
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
              disabled={isLoading || (!input.trim() && !isListening)}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizonal className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      </div>
      
      {/* Camera Capture Modal */}
      {showCameraCapture && (
        <CameraCapture
          onImageCaptured={handleImageCaptured}
          onClose={() => setShowCameraCapture(false)}
        />
      )}
      
      {/* Voice Conversation Modal */}
      {showVoiceConversation && (
        <VoiceConversation
          onClose={() => setShowVoiceConversation(false)}
          onSendMessage={async (content) => {
            // Use the existing handleSend function but return the response
            const prevMessagesLength = messages.length;
            await handleSend(content);
            
            // Return the assistant's response
            const newMessages = [...messages];
            if (newMessages.length > prevMessagesLength) {
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                return lastMessage.content;
              }
            }
            
            return "I'm sorry, I couldn't process your request.";
          }}
        />
      )}
    </div>
  )
}
