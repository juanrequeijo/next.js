import { db, users, conversations, conversationUsers, messages } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');
  await db.delete(messages);
  await db.delete(conversationUsers);
  await db.delete(conversations);
  await db.delete(users);
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE conversations_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE messages_id_seq RESTART WITH 1`);
  
  console.log('✅ Database cleaned');
}

async function seedLarge() {
  console.log('🌱 Starting database seed with HUGE dataset for performance testing...');
  console.log('⏳ This will create 5 MILLION messages and may take a long time...');

  try {
    await cleanDatabase();
    const [mainUser] = await db.insert(users).values([
      { name: 'Me', phoneNumber: '+1234567890' }
    ]).returning();
    
    const mainUserId = mainUser.id;
    console.log(`✅ Created main user with ID: ${mainUserId}`);

    console.log('Creating other users...');
    const userBatches = [mainUser];
    const batchSize = 100;
    
    for (let i = 1; i < 1000; i += batchSize) {
      const userBatch = [];
      for (let j = 0; j < batchSize && i + j < 1000; j++) {
        userBatch.push({
          name: `User ${i + j}`,
          phoneNumber: `+1555${String(i + j).padStart(7, '0')}`,
        });
      }
      const createdBatch = await db.insert(users).values(userBatch).returning();
      userBatches.push(...createdBatch);
      
      if ((i + batchSize) % 500 === 0) {
        console.log(`✅ Created ${i + batchSize} users...`);
      }
    }

    console.log(`✅ Created ${userBatches.length} users total`);

    console.log('Creating conversations for user 1...');
    const conversationBatches = [];
    
    for (let i = 0; i < 500; i += 20) {
      const convBatch = [];
      for (let j = 0; j < 20 && i + j < 500; j++) {
        const otherUser = userBatches[1 + ((i + j) % 999)];
        convBatch.push({
          title: `Chat with ${otherUser.name}`,
        });
      }
      const createdBatch = await db.insert(conversations).values(convBatch).returning();
      conversationBatches.push(...createdBatch);
    }

    console.log(`✅ Created ${conversationBatches.length} conversations`);

    console.log('Adding users to conversations...');
    const conversationUserData = [];
    
    for (let i = 0; i < conversationBatches.length; i++) {
      const conv = conversationBatches[i];
      
      conversationUserData.push({
        conversationId: conv.id,
        userId: mainUserId,
        isAdmin: false,
      });
      
      const numOtherUsers = 1 + Math.floor(Math.random() * 4);
      const selectedUsers = new Set<number>();
      
      while (selectedUsers.size < numOtherUsers) {
        const randomUser = userBatches[1 + Math.floor(Math.random() * 999)];
        selectedUsers.add(randomUser.id);
      }
      
      selectedUsers.forEach(userId => {
        conversationUserData.push({
          conversationId: conv.id,
          userId: userId,
          isAdmin: false,
        });
      });
    }

    for (let i = 0; i < conversationUserData.length; i += 100) {
      const batch = conversationUserData.slice(i, i + 100);
      await db.insert(conversationUsers).values(batch);
    }

    console.log('✅ Added users to conversations');

    console.log('Creating messages (this may take a while)...');
    const messageTemplates = [
      'Hey, how are you doing?',
      'Did you see that news?',
      'Thanks for your help!',
      'Can we meet tomorrow?',
      'I agree with you',
      'That sounds great!',
      'Let me check and get back to you',
      'Sorry for the late reply',
      'Looking forward to it',
      'What do you think about this?',
      'I\'ll handle that task',
      'Great work on the project!',
      'Can you review this for me?',
      'Meeting confirmed for 3 PM',
      'Just finished the report',
      'Any updates on this?',
      'Let\'s discuss this further',
      'I have some concerns about this',
      'Everything looks good to me',
      'Thanks for the quick response!',
    ];

    let totalMessages = 0;
    const targetMessages = 5000000;
    const messageBatchSize = 5000;

    while (totalMessages < targetMessages) {
      const messageBatch = [];
      const remainingMessages = targetMessages - totalMessages;
      const currentBatchSize = Math.min(messageBatchSize, remainingMessages);

      for (let i = 0; i < currentBatchSize; i++) {
        const randomConv = conversationBatches[Math.floor(Math.random() * conversationBatches.length)];
        
        const convUsers = conversationUserData.filter(cu => cu.conversationId === randomConv.id);
        
        const isFromMainUser = Math.random() < 0.5;
        let senderId: number;
        
        if (isFromMainUser) {
          senderId = mainUserId;
        } else {
          const otherUsers = convUsers.filter(cu => cu.userId !== mainUserId);
          if (otherUsers.length > 0) {
            senderId = otherUsers[Math.floor(Math.random() * otherUsers.length)].userId;
          } else {
            senderId = mainUserId;
          }
        }
        
        const messageContent = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        
        messageBatch.push({
          senderId: senderId,
          conversationId: randomConv.id,
          content: `${messageContent} (Message #${totalMessages + i + 1})`,
        });
      }

      if (messageBatch.length > 0) {
        await db.insert(messages).values(messageBatch);
        totalMessages += messageBatch.length;
        
        if (totalMessages % 100000 === 0) {
          console.log(`✅ Created ${totalMessages.toLocaleString()} messages...`);
        }
      }
    }

    console.log(`✅ Created ${totalMessages.toLocaleString()} messages total`);
    console.log('🎉 Database seeded successfully with HUGE dataset!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${userBatches.length.toLocaleString()}`);
    console.log(`   - Conversations for user 1: ${conversationBatches.length}`);
    console.log(`   - Messages: ${totalMessages.toLocaleString()}`);
    console.log('👤 Main user ID is: 1 (hardcoded with sequence reset)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }

  process.exit(0);
}

seedLarge();