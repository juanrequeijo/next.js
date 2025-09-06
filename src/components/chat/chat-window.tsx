'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Contact, Message as MessageType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import Message from './message';
import { getInitial } from '@/lib/utils/chatUtils';
import debounce from 'lodash.debounce';

interface ChatWindowProps {
  contact: Contact | null;
  messages: MessageType[];
  onSendMessage: (text: string) => void;
  loading?: boolean;
}

export default function ChatWindow({ contact, messages, onSendMessage, loading }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Aaaaaaaaaaaa");
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const debouncedSend = useCallback(debounce(handleSubmit, 1000), []);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-normal text-muted-foreground">Select a conversation to start chatting!</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-card">
      <div className="h-16 px-6 flex items-center border-b">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-white font-semibold bg-blue-500">
            {getInitial(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h2 className="font-medium">{contact.name}</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-background">
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender === 'You'}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="px-6 py-4 border-t">
        <div className="flex items-center space-x-3">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-secondary"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            size="icon"
            className={cn(
              "rounded-full",
              !newMessage.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}