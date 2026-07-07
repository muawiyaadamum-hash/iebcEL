import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  GraduationCap,
  Headphones,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMarkdown } from "@/lib/markdown";
import { getWhatsAppLink } from "./WhatsAppButton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const FAQ_PROMPTS = [
  "What courses do you offer?",
  "How do I register?",
  "What is the course fee?",
  "I need help with my enrollment",
  "Chat with support on WhatsApp",
  "Visit the main IEBC website",
  "Visit the e-learning platform",
];

const GREETING_MESSAGE = `👋 Hi there! I'm IEBC Bot, your 24/7 AI support assistant.

I'm here to help you with:
• Finding the right course for your goals
• Registration and enrollment process
• Course details, pricing & payment
• Technical support & navigation
• Connecting you with human support

How can I assist you today?`;

const AUTO_POPUP_MESSAGE = "Need help? I'm here 24/7! 🎓";

// Simple notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio not supported');
  }
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoGreeted, setHasAutoGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-popup greeting after 5 seconds on first visit
  useEffect(() => {
    const hasSeenGreeting = sessionStorage.getItem('mtech-chatbot-greeted');
    
    if (!hasSeenGreeting && !hasAutoGreeted) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        setHasAutoGreeted(true);
        sessionStorage.setItem('mtech-chatbot-greeted', 'true');
        playNotificationSound();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasAutoGreeted]);

  // Hide popup when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowPopup(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response");
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Mark conversation as started
    setHasStartedConversation(true);

    // Handle WhatsApp redirect
    if (text.toLowerCase().includes('whatsapp')) {
      window.open(getWhatsAppLink("Hello Centre de Formation IEBC! I need assistance and would like to chat with your support team."), '_blank');
      setMessages(prev => [...prev, 
        { role: "user", content: text },
        { role: "assistant", content: "I'm opening WhatsApp for you to chat with our human support team! They're available to help you with any questions. 💬" }
      ]);
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat([...messages, userMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1]?.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, toast]);

  const handleFAQClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const dismissPopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {/* Auto Popup Greeting */}
      {showPopup && !isOpen && (
        <div 
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem + 3.5rem + 3rem + 0.75rem)",
            right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
          }}
          className="fixed z-40 animate-in slide-in-from-right-5 fade-in duration-300"
        >
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl rounded-br-md p-4 shadow-lg max-w-[250px] relative">
            <button 
              onClick={dismissPopup}
              className="absolute -top-2 -right-2 h-6 w-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted"
            >
              <X className="h-3 w-3 text-foreground" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4" />
              <span className="font-semibold text-sm">IEBC Bot</span>
            </div>
            <p className="text-sm">{AUTO_POPUP_MESSAGE}</p>
            <Button 
              size="sm" 
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => setIsOpen(true)}
            >
              Chat Now
            </Button>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir l'assistant IA"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
        }}
        className={cn(
          "fixed z-40 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg p-0",
          "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
          "transition-all duration-300 flex flex-col items-center justify-center gap-0.5",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-[10px] font-bold leading-none tracking-wide">IA</span>
      </Button>

      {/* Chat Window */}
      <div
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
          height: "min(600px, calc(100dvh - 6rem))",
        }}
        className={cn(
          "fixed z-50 w-[380px] max-w-[calc(100vw-2rem)]",
          "bg-background border border-border rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full relative">
                <GraduationCap className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-1">
                  IEBC Bot
                  <Headphones className="h-3.5 w-3.5" />
                </h3>
                <p className="text-xs opacity-90">24/7 AI Support</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* Show greeting only if no conversation started */}
            {!hasStartedConversation && messages.length === 0 && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-muted">
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(GREETING_MESSAGE) }}
                  />
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                  />
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* FAQ Prompts - Show only when no conversation started */}
          {!hasStartedConversation && messages.length === 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Quick actions:
              </p>
              <div className="flex flex-wrap gap-2">
                {FAQ_PROMPTS.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleFAQClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Need human support?{" "}
            <a 
              href={getWhatsAppLink("Hello! I need to speak with a human support agent.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Chat on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
