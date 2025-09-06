'use client';

import { useState } from 'react';
import ChatList from '@/components/chat/chat-list';
import ChatWindow from '@/components/chat/chat-window';
import { Contact, Message } from '@/types';
import { sendMessageAction, fetchConversationMessages } from '../../features/chat/actions';

interface ChatContainerProps {
  initialConversations: Array<{
    id: string;
    title: string;
    lastMessage: {
      content: string | null;
      createdAt: Date | null;
      senderId: number | null;
      authorName: string | null;
    };
  }>;
  userId: number;
}

export default function ChatContainer({ initialConversations, userId }: ChatContainerProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  const contacts: Contact[] = initialConversations.map(conv => ({
    id: conv.id,
    name: conv.title,
    lastMessage: conv.lastMessage.content || '',
    lastMessageTimestamp: conv.lastMessage.createdAt || undefined,
  }));

  const handleSelectContact = async (contactId: string) => {
    setSelectedContactId(contactId);

    if (!messages[contactId]) {
      setLoadingMessages(true);
      try {
        const conversationMessages = await fetchConversationMessages(parseInt(contactId));
        setMessages(prev => ({
          ...prev,
          [contactId]: conversationMessages.map(msg => ({
            id: msg.id.toString(),
            sender: msg.senderId === userId ? 'You' : 'Other',
            text: msg.content,
            timestamp: new Date(msg.createdAt),
          })),
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedContactId) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'You',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), tempMessage],
    }));

    try {
      const newMessage = await sendMessageAction(userId, parseInt(selectedContactId), text);

      setMessages(prev => ({
        ...prev,
        [selectedContactId]: prev[selectedContactId].map(msg =>
          msg.id === tempMessage.id
            ? {
              ...msg,
              id: newMessage.id.toString(),
            }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => ({
        ...prev,
        [selectedContactId]: prev[selectedContactId].filter(msg => msg.id !== tempMessage.id),
      }));
    }
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId) || null;
  const currentMessages = selectedContactId ? (messages[selectedContactId] || []) : [];

  return (
    <div className="flex flex-row h-screen w-screen">
      <ChatList
        contacts={contacts}
        selectedContactId={selectedContactId}
        onSelectContact={handleSelectContact}
      />
      <ChatWindow
        contact={selectedContact}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        loading={loadingMessages}
      />
    </div>
  );
}