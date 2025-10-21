import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Menu, Plus, Sparkles, FileUp, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  files?: { name: string; type: string; data: string }[];
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Lumen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversationId) {
      loadChatHistory(currentConversationId);
    } else {
      setMessages([]);
      setLoadingHistory(false);
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      // For now, we'll use a single conversation per user
      // In a full implementation, you'd create a conversations table
      setConversations([
        {
          id: 'default',
          title: 'Chat with Lumen',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
      setCurrentConversationId('default');
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadChatHistory = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('lumen_chats')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const convertedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        images: Array.isArray(msg.images) ? msg.images : [],
        files: Array.isArray(msg.files) ? msg.files : [],
        created_at: msg.created_at,
      }));
      
      setMessages(convertedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 20MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        
        // Add file to uploaded files state
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: base64Data
        }]);
        
        toast({
          title: 'File uploaded',
          description: `${file.name} ready to send`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive',
      });
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if ((!content && uploadedFiles.length === 0) || loading) return;

    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]); // Clear uploaded files after sending

    setLoading(true);
    setInput('');

    try {
      // Save user message with files
      const userMessageData: any = {
        user_id: user?.id,
        role: 'user',
        content: content || '[Files attached]',
      };

      if (filesToSend.length > 0) {
        userMessageData.files = filesToSend;
      }

      const { error: userMsgError } = await supabase
        .from('lumen_chats')
        .insert(userMessageData);

      if (userMsgError) throw userMsgError;

      // Immediately add user message to UI
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content || '[Files attached]',
        files: filesToSend,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Check if user wants to generate an image
      const isImageRequest = content && (
        content.toLowerCase().includes('generate image') || 
        content.toLowerCase().includes('create image') ||
        content.toLowerCase().includes('draw') ||
        content.toLowerCase().includes('make an image')
      );

      // Call Lumen with files
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: isImageRequest ? 'generate_image' : 'lumen_chat',
          data: {
            message: content || 'Analyze these files',
            files: filesToSend,
            userId: user?.id,
          },
        },
      });

      if (error) throw error;

      // Save assistant response
      const assistantMessage: any = {
        user_id: user?.id,
        role: 'assistant',
        content: data.response?.message || data.message || 'Response received',
      };

      if (data.image) {
        assistantMessage.images = [data.image];
      }

      const { error: assistantMsgError } = await supabase
        .from('lumen_chats')
        .insert(assistantMessage);

      if (assistantMsgError) throw assistantMsgError;

      // Add assistant message to UI
      const assistantUIMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantMessage.content,
        images: assistantMessage.images,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantUIMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId('default');
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card/80 backdrop-blur-lg">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Chat History</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={startNewChat}
                      className="w-full justify-start gap-2"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      New Chat
                    </Button>
                    {conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        onClick={() => setCurrentConversationId(conv.id)}
                        variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                      >
                        {conv.title}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Lumen AI</h1>
                <p className="text-xs text-muted-foreground">Your intelligent assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={startNewChat} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles className="h-12 w-12 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Welcome to Lumen AI
                </h2>
                <p className="text-muted-foreground max-w-md text-lg">
                  I can help you with tasks, generate images, analyze files, and more. Just ask!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-card border'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        {message.files && message.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.files.map((file, i) => {
                              const isImage = file.type.startsWith('image/');
                              return (
                                <div key={i}>
                                  {isImage ? (
                                    <img
                                      src={file.data}
                                      alt={file.name}
                                      className="rounded-lg max-w-full max-h-96 object-contain"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                                      <FileUp className="h-4 w-4" />
                                      <span className="text-sm">{file.name}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {message.images && message.images.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.images.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="Generated"
                                className="rounded-lg max-w-full"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-card border rounded-2xl px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t bg-card/80 backdrop-blur-lg p-4">
          <div className="max-w-3xl mx-auto">
            {uploadedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <FileUp className="h-3 w-3" />
                    )}
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="*/*"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-shrink-0"
              >
                <FileUp className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Message Lumen AI..."
                  disabled={loading}
                  className="pr-12 bg-background/50 border-muted-foreground/20"
                />
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={loading || (!input.trim() && uploadedFiles.length === 0)}
                size="icon"
                className="flex-shrink-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Try: "Create a task", "Generate image of mountains", "Analyze this file"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
