import { conversations, conversationUsers, db, messages, users } from "@/lib/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { Message, CreateMessage } from "./types";

export const getAllConversationsForUserWithLastMessage = async (userId: number) => {
    const userConversations = await db
        .select({
            conversationId: conversations.id,
            conversationTitle: conversations.title,
        })
        .from(conversations)
        .innerJoin(conversationUsers, and(
            eq(conversationUsers.conversationId, conversations.id),
            eq(conversationUsers.userId, userId)
        ));

    const conversationsWithLastMessage = await Promise.all(
        userConversations.map(async (conv) => {
            const lastMessage = await db
                .select({
                    content: messages.content,
                    createdAt: messages.createdAt,
                    senderId: messages.senderId,
                    senderName: users.name,
                })
                .from(messages)
                .innerJoin(users, eq(users.id, messages.senderId))
                .where(eq(messages.conversationId, conv.conversationId))
                .orderBy(desc(messages.createdAt))
                .limit(1);

            return {
                conversationId: conv.conversationId,
                conversationTitle: conv.conversationTitle,
                lastMessageContent: lastMessage[0]?.content || null,
                lastMessageCreatedAt: lastMessage[0]?.createdAt || null,
                lastMessageSenderId: lastMessage[0]?.senderId || null,
                lastMessageAuthorName: lastMessage[0]?.senderName || null,
            };
        })
    );

    return conversationsWithLastMessage
        .filter(conv => conv.lastMessageCreatedAt !== null)
        .sort((a, b) => {
            const dateA = a.lastMessageCreatedAt ? new Date(a.lastMessageCreatedAt).getTime() : 0;
            const dateB = b.lastMessageCreatedAt ? new Date(b.lastMessageCreatedAt).getTime() : 0;
            return dateB - dateA;
        });
}

export const getMessagesByConversationId = async (conversationId: number): Promise<Message[]> => {
    const messagesList = await db.select().from(messages).where(eq(messages.conversationId, conversationId));
    return messagesList;
}

export const createMessageForConversation = async (createMessage: CreateMessage): Promise<Message> => {
    const newMessage = {
        conversationId: createMessage.conversationId,
        content: createMessage.content,
        senderId: createMessage.senderId,
    };
    const [createdMessage] = await db.insert(messages).values(newMessage).returning();
    return createdMessage;
}