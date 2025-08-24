import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Send, Bot, User, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AIResponse } from "@shared/schema";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  sqlQuery?: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onClose: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hi! I'm your AI database assistant. I can help you write SQL queries, optimize performance, and explain database concepts. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // WebSocket connection for real-time AI chat
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("AI WebSocket connected");
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ai_response') {
          const aiMessage: Message = {
            id: Date.now().toString(),
            type: "ai",
            content: message.data.message,
            sqlQuery: message.data.sqlQuery,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log("AI WebSocket disconnected");
      setWsConnection(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  const generateQueryMutation = useMutation({
    mutationFn: async (prompt: string): Promise<AIResponse> => {
      const response = await apiRequest("POST", "/api/ai/generate", { prompt });
      return response.json();
    },
    onSuccess: (response: AIResponse) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: response.message,
        sqlQuery: response.sqlQuery,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error: Error) => {
      toast({
        title: "AI request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Try WebSocket first, fallback to HTTP
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'ai_chat',
        content: input
      }));
    } else {
      generateQueryMutation.mutate(input);
    }

    setInput("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col" data-testid="ai-assistant-panel">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="h-3 w-3 text-white" />
          </div>
          <h3 className="font-semibold text-white">AI Assistant</h3>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          data-testid="button-close-ai"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3" data-testid={`message-${message.id}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                {message.type === "ai" ? (
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 mb-2">{message.content}</p>
                {message.sqlQuery && (
                  <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm relative group">
                    <code className="text-slate-200 whitespace-pre-wrap">{message.sqlQuery}</code>
                    <Button
                      onClick={() => copyToClipboard(message.sqlQuery!)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300"
                      data-testid={`copy-query-${message.id}`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {generateQueryMutation.isPending && (
            <div className="flex space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">AI is thinking...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about SQL, optimization, or database design..."
            className="flex-1 bg-slate-700 text-white border-slate-600 focus:border-blue-500"
            disabled={generateQueryMutation.isPending}
            data-testid="input-ai-message"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || generateQueryMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${wsConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{wsConnection ? 'AI Online' : 'AI Offline'}</span>
          </span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
