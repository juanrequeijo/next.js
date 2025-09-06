import { db, users, conversations, conversationUsers, messages } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');
  await db.delete(messages);
  await db.delete(conversationUsers);
  await db.delete(conversations);
  await db.delete(users);
  
  // Reset sequences to ensure IDs start from 1
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE conversations_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE messages_id_seq RESTART WITH 1`);
  
  console.log('✅ Database cleaned');
}

async function seed() {
  console.log('🌱 Starting database seed with small dataset...');

  try {
    // Clean existing data first
    await cleanDatabase();
    // Create users - User 1 is our main user (the logged in user)
    const createdUsers = await db.insert(users).values([
      { name: 'Me', phoneNumber: '+1234567890' }, // This is user ID 1 - our main user
      { name: 'Jane Smith', phoneNumber: '+1234567891' },
      { name: 'Bob Johnson', phoneNumber: '+1234567892' },
      { name: 'Alice Williams', phoneNumber: '+1234567893' },
      { name: 'Charlie Brown', phoneNumber: '+1234567894' },
    ]).returning();

    console.log(`✅ Created ${createdUsers.length} users`);
    
    const mainUserId = createdUsers[0].id; // User 1 - our logged in user

    // Create conversations - all will include user 1
    const createdConversations = await db.insert(conversations).values([
      { title: 'Chat with Jane' },
      { title: 'Chat with Bob' },
      { title: 'Project Team' },
      { title: 'Weekend Plans' },
      { title: 'Family Chat' },
    ]).returning();

    console.log(`✅ Created ${createdConversations.length} conversations`);

    // Add users to conversations - User 1 is in ALL conversations
    await db.insert(conversationUsers).values([
      // Chat with Jane (1-on-1)
      { conversationId: createdConversations[0].id, userId: mainUserId },
      { conversationId: createdConversations[0].id, userId: createdUsers[1].id },
      
      // Chat with Bob (1-on-1)
      { conversationId: createdConversations[1].id, userId: mainUserId },
      { conversationId: createdConversations[1].id, userId: createdUsers[2].id },
      
      // Project Team - User 1, Jane, Bob
      { conversationId: createdConversations[2].id, userId: mainUserId, isAdmin: true },
      { conversationId: createdConversations[2].id, userId: createdUsers[1].id },
      { conversationId: createdConversations[2].id, userId: createdUsers[2].id },
      
      // Weekend Plans - User 1, Alice, Charlie
      { conversationId: createdConversations[3].id, userId: mainUserId },
      { conversationId: createdConversations[3].id, userId: createdUsers[3].id },
      { conversationId: createdConversations[3].id, userId: createdUsers[4].id },
      
      // Family Chat - All users
      { conversationId: createdConversations[4].id, userId: mainUserId, isAdmin: true },
      { conversationId: createdConversations[4].id, userId: createdUsers[1].id },
      { conversationId: createdConversations[4].id, userId: createdUsers[2].id },
      { conversationId: createdConversations[4].id, userId: createdUsers[3].id },
      { conversationId: createdConversations[4].id, userId: createdUsers[4].id },
    ]);

    console.log('✅ Added users to conversations');

    // Create messages
    const messageData = [
      // Chat with Jane
      { senderId: mainUserId, conversationId: createdConversations[0].id, content: 'Hey Jane, how\'s the project going?' },
      { senderId: createdUsers[1].id, conversationId: createdConversations[0].id, content: 'Going well! Just finished the design phase' },
      { senderId: mainUserId, conversationId: createdConversations[0].id, content: 'Great! Let me know if you need any help' },
      
      // Chat with Bob
      { senderId: createdUsers[2].id, conversationId: createdConversations[1].id, content: 'Can we review the code tomorrow?' },
      { senderId: mainUserId, conversationId: createdConversations[1].id, content: 'Sure, how about 10 AM?' },
      { senderId: createdUsers[2].id, conversationId: createdConversations[1].id, content: 'Perfect, see you then!' },
      
      // Project Team messages
      { senderId: mainUserId, conversationId: createdConversations[2].id, content: 'Team meeting at 3 PM today' },
      { senderId: createdUsers[1].id, conversationId: createdConversations[2].id, content: 'I\'ll be there' },
      { senderId: createdUsers[2].id, conversationId: createdConversations[2].id, content: 'Me too!' },
      
      // Weekend Plans
      { senderId: createdUsers[3].id, conversationId: createdConversations[3].id, content: 'Anyone up for hiking this weekend?' },
      { senderId: mainUserId, conversationId: createdConversations[3].id, content: 'Count me in! What time?' },
      { senderId: createdUsers[4].id, conversationId: createdConversations[3].id, content: 'Let\'s start early, 7 AM?' },
      
      // Family Chat messages
      { senderId: mainUserId, conversationId: createdConversations[4].id, content: 'Don\'t forget about dinner tonight!' },
      { senderId: createdUsers[3].id, conversationId: createdConversations[4].id, content: 'I\'ll be there by 7' },
      { senderId: createdUsers[1].id, conversationId: createdConversations[4].id, content: 'Looking forward to it!' },
    ];

    const createdMessages = await db.insert(messages).values(messageData).returning();

    console.log(`✅ Created ${createdMessages.length} messages`);
    console.log('🎉 Database seeded successfully with small dataset!');
    console.log('👤 Main user ID is: 1 (hardcoded with sequence reset)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  process.exit(0);
}

seed();