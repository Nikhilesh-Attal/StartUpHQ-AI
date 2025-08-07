"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const quickPrompts = [
  "Suggest a customer persona",
  "Improve my Ask slide",
  "What are some potential risks?",
  "Draft a marketing email"
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! How can I help you build your startup today? I have access to your Lean Canvas, Roadmap, and Pitch Deck. Try one of the prompts below or ask me anything.",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // TODO: Replace with real AI call
    const assistantReply: Message = {
      role: "assistant",
      content: `Great question! To grow your startup, consider validating your customer segment through surveys and launching small experiments.`,
    };

    // Simulate delay
    setTimeout(() => {
      setMessages(prev => [...prev, assistantReply]);
    }, 600);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] w-full">
      <Card className="flex flex-col">
        <CardHeader>
          <h1 className="font-headline text-3xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered copilot. Ask anything about your startup.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {msg.role === "assistant" ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        "U"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {msg.role === "assistant" ? "AI Assistant" : "You"}
                    </p>
                    <div className="prose prose-sm max-w-none rounded-md bg-muted p-3 mt-1">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <div className="w-full space-y-2">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map(prompt => (
                <Button key={prompt} variant="outline" size="sm" onClick={() => handleQuickPrompt(prompt)}>
                  {prompt}
                </Button>
              ))}
            </div>
            <form className="flex w-full items-center space-x-2" onSubmit={handleSend}>
              <Input
                id="message"
                placeholder="e.g., Generate a tweet about our upcoming launch..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit" size="icon">
                <SendHorizonal className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
