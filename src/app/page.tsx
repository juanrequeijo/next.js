import { fetchUserConversations } from '@/features/chat/actions';
import ChatContainer from '@/components/chat/chat-container';

export default async function Home() {
  const userId = 1;

  let conversations;
  try {
    conversations = await fetchUserConversations(userId);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load conversations. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No conversations found.</p>
        </div>
      </div>
    );
  }

  return <ChatContainer initialConversations={conversations} userId={userId} />;
}