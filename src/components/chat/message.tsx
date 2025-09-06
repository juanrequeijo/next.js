'use client';

import { Message as MessageType } from '@/types';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
}

export default function Message({ message, isOwnMessage }: MessageProps) {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("flex mb-3", isOwnMessage ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex items-end space-x-2 max-w-[70%]",
        isOwnMessage && "flex-row-reverse space-x-reverse"
      )}>
        <div>
          <div
            className={cn(
              "px-4 py-2 rounded-2xl max-w-xs lg:max-w-md",
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                : "bg-secondary text-secondary-foreground rounded-bl-sm"
            )}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
          <p className={cn(
            "text-xs mt-1 text-muted-foreground",
            isOwnMessage ? "text-right" : "text-left"
          )}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}