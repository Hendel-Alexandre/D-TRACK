import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Trash2, Image as ImageIcon, FileUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  files?: { name: string; content: string }[];
  created_at: string;
}

export default function Darvis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('darvis_chats')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Convert the database records to Message type
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

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('darvis-chat-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'darvis_chats',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        const content = event.target?.result as string;
        await sendMessage(`[File uploaded: ${file.name}]\n\nPlease analyze this file:\n${content.substring(0, 10000)}`);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    setLoading(true);
    setInput('');

    try {
      // Save user message
      const { error: userMsgError } = await supabase
        .from('darvis_chats')
        .insert({
          user_id: user?.id,
          role: 'user',
          content,
        });

      if (userMsgError) throw userMsgError;

      // Check if user wants to generate an image
      const isImageRequest = content.toLowerCase().includes('generate image') || 
                            content.toLowerCase().includes('create image') ||
                            content.toLowerCase().includes('draw') ||
                            content.toLowerCase().includes('make an image');

      // Call Darvis
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: isImageRequest ? 'generate_image' : 'darvis_chat',
          data: {
            message: content,
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
        .from('darvis_chats')
        .insert(assistantMessage);

      if (assistantMsgError) throw assistantMsgError;

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

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('darvis_chats')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setMessages([]);
      toast({
        title: 'Success',
        description: 'Chat history cleared',
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear history',
        variant: 'destructive',
      });
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Darvis AI</h1>
              <p className="text-sm text-muted-foreground">Your intelligent assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="container mx-auto py-6 max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Darvis AI</h2>
              <p className="text-muted-foreground max-w-md">
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
                  className={`flex gap-3 mb-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <Card className={`p-4 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.images && message.images.length > 0 && (
                      <div className="mt-4 space-y-2">
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
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mb-6"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
              </div>
              <Card className="p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.pdf,.doc,.docx,.json,.csv"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <FileUp className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Darvis anything... (e.g., 'generate image of a sunset')"
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Try: "Create a task", "Generate image of mountains", "Analyze this file"
          </p>
        </div>
      </div>
    </div>
  );
}
