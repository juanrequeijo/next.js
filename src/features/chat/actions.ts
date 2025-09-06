'use server';

import { getUserConversations, getMessagesForConversation, sendMessage } from './server';

export async function fetchUserConversations(userId: number) {
  return await getUserConversations(userId);
}

export async function fetchConversationMessages(conversationId: number) {
  return await getMessagesForConversation(conversationId);
}

export async function sendMessageAction(senderId: number, conversationId: number, content: string) {
  return await sendMessage(senderId, conversationId, content);
}