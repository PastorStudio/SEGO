'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { processNaturalLanguageCommand } from '@/lib/ai-agent';
import { Sparkles, Send, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiAgentModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type Message = {
    sender: 'user' | 'agent';
    text: string;
}

export function AiAgentModal({ isOpen, onOpenChange }: AiAgentModalProps) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isProcessing, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when history changes
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessing) return;

    const userMessage: Message = { sender: 'user', text: command };
    setHistory(prev => [...prev, userMessage]);
    setCommand('');

    startTransition(async () => {
      const result = await processNaturalLanguageCommand(command);
      const agentMessage: Message = { sender: 'agent', text: result.message };
      setHistory(prev => [...prev, agentMessage]);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Agente de Soporte IA
          </DialogTitle>
          <DialogDescription>
            Chatea con el agente para crear o consultar información del sistema.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20" ref={scrollAreaRef}>
            <div className="space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={cn(
                        "flex items-start gap-3",
                        msg.sender === 'user' ? "justify-end" : "justify-start"
                    )}>
                        {msg.sender === 'agent' && (
                            <div className="bg-primary text-primary-foreground p-2 rounded-full">
                                <Bot className="h-5 w-5" />
                            </div>
                        )}
                        <div className={cn(
                            "p-3 rounded-lg max-w-xs lg:max-w-md",
                            msg.sender === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && (
                            <div className="bg-secondary p-2 rounded-full">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                ))}
                 {isProcessing && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="bg-primary text-primary-foreground p-2 rounded-full animate-pulse">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm italic text-muted-foreground">Pensando...</p>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="pt-4 flex gap-2 border-t">
            <Input 
                placeholder='Ej: "cuál es el estado del ticket TKT-1234?"'
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                disabled={isProcessing}
            />
            <Button type="submit" disabled={isProcessing || !command.trim()}>
                {isProcessing ? <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}