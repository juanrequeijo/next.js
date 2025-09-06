import { createMessageForConversation, getAllConversationsForUserWithLastMessage, getMessagesByConversationId } from "./repository";

export const getUserConversations = async (userId: number) => {
    try {
        const conversations = await getAllConversationsForUserWithLastMessage(userId);
        return conversations.map(conversation => ({
            id: conversation.conversationId.toString(),
            title: conversation.conversationTitle || 'Untitled Conversation',
            lastMessage: {
                content: conversation.lastMessageContent,
                createdAt: conversation.lastMessageCreatedAt,
                senderId: conversation.lastMessageSenderId,
                authorName: conversation.lastMessageAuthorName,
            }
        }));
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
}

export const getMessagesForConversation = async (conversationId: number) => {
    try {
        const messages = await getMessagesByConversationId(conversationId);
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

export const sendMessage = async (senderId: number, conversationId: number, content: string) => {
    try {
        const newMessage = createMessageForConversation({
            conversationId,
            content,
            senderId,
        });
        return newMessage;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}