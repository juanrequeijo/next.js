'use client';

import { useState } from 'react';
import { Contact } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getInitial } from '@/lib/utils/chatUtils';
import { Input } from '@/components/ui/input';

interface ChatListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  userId?: string;
}

export default function ChatList({ contacts, selectedContactId, onSelectContact, userId = '0912587586357790921' }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex-shrink-0 bg-card border-r flex flex-col">
      <div className="p-6 border-b space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Chats</h1>
          <p className="text-sm text-muted-foreground">Your User ID: {userId}</p>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={cn(
              "px-6 py-4 hover:bg-accent cursor-pointer transition-colors",
              selectedContactId === contact.id && "bg-accent"
            )}
            onClick={() => onSelectContact(contact.id)}
          >
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-white font-semibold bg-blue-500">
                  {getInitial(contact.name)}
                </AvatarFallback>
              </Avatar>

              <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-lg">{contact.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {contact.lastMessageTimestamp && formatTime(contact.lastMessageTimestamp)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">{contact.lastMessage}</p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}