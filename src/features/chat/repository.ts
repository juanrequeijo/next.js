import { conversations, conversationUsers, db, messages, users } from "@/lib/db";
import { eq, desc, and, sql, inArray, getTableColumns } from "drizzle-orm";
import { Message, CreateMessage } from "./types";

export const getAllConversationsForUserWithLastMessage = async (userId: number) => {

  // STEP 1: Fetch all conversations the user is in.
  // This gives us the list of conversations we need to process.
  const userConversations = await db
    .select({
        conversationId: conversations.id,
        conversationTitle: conversations.title,
    })
    .from(conversations)
    .innerJoin(conversationUsers, eq(conversationUsers.conversationId, conversations.id))
    .where(eq(conversationUsers.userId, userId));

  // return empty if there is no conversations
  if (userConversations.length === 0) {
    return [];
  }

  //get all ids of the conversations
  const conversationIds = userConversations.map((c) => c.conversationId);

  // STEP 2: Fetch the latest message for ALL conversations at once.
  // We use a subquery with the `row_number()` window function to find the most recent message in each conversation.
  const lastMessagesSubquery = db
    .select({
        ...getTableColumns(messages), // Select all columns from the messages table
        // Partition by conversation and sort by date to find the most recent one (which will have row_number = 1)
        rowNumber: sql<number>`row_number() OVER(PARTITION BY ${messages.conversationId} ORDER BY ${messages.createdAt} DESC)`.as('rn'),
    })
    .from(messages)
    // Filter only by messages from our user's conversations
    .where(inArray(messages.conversationId, conversationIds))
    .as('sq'); // We give an alias ('sq' for subquery) to the subquery

  // Now, we select only the messages where row_number = 1 (i.e. the last one in each conversation)
  const lastMessages = await db
    .select({
        conversationId: lastMessagesSubquery.conversationId,
        content: lastMessagesSubquery.content,
        createdAt: lastMessagesSubquery.createdAt,
        senderId: lastMessagesSubquery.senderId,
        senderName: users.name, 
    })
    .from(lastMessagesSubquery)
    .leftJoin(users, eq(lastMessagesSubquery.senderId, users.id))
    .where(eq(lastMessagesSubquery.rowNumber, 1));


    // STEP 3: Combine the results in the code.
    // We created a Map to quickly find the last message in a conversation.
    const lastMessagesMap = new Map(
        lastMessages.map((message) => [message.conversationId, message])
    );

  const result = userConversations
    // For each conversation, we look for your last message on the Map
    .map((_conversation) => {
        const lastMessage = lastMessagesMap.get(_conversation.conversationId);
        // If there is no last message, we do not include the conversation in the final result
        if (!lastMessage) {
            return null;
        }
        return {
            conversationId: _conversation.conversationId,
            conversationTitle: _conversation.conversationTitle,
            lastMessageContent: lastMessage.content,
            lastMessageCreatedAt: lastMessage.createdAt,
            lastMessageSenderId: lastMessage.senderId,
            lastMessageAuthorName: lastMessage.senderName,
        };
    })
    // We removed conversations that returned `null` (those that had no messages)
    .filter(a => a?.lastMessageContent)
    // We order the final result by the date of the last message
    .sort((a, b) => 
       new Date(b?.lastMessageCreatedAt!).getTime() - new Date(a?.lastMessageCreatedAt!).getTime()
    );

    // console.log(result);
    // We ensure correct typing in the output
    return result as NonNullable<typeof result>; 
};



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