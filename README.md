# Chat Application - Technical Interview

Welcome! This is a chat application built with Next.js and React. Your task is to identify and fix several issues, then implement new features. Please take no more than 4h on this challenge, and document your train of thought. We're more interested in see how you solve problems and the trade-offs made than in the solutions themselves.

## Prerequisites
- Node.js installed
- Docker Desktop installed and running

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start database:**
```bash
npm run db:up
```

3. **Run migrations:**
```bash
npm run db:migrate
```
4. **Seed database:**
```bash
npm run db:seed        # Small dataset (5 conversations, ~15 messages)
# OR
npm run db:seed:large  # Large dataset (500 conversations, 100K messages) - Used for hard challenges
```

5. **Start development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

PS: If you have any problem running any of the commands, reach out. You shouldn't have a problem setting the application up - just solving the problems.

## Database Info
- **Host:** localhost:5432
- **Database:** chatapp_db
- **User:** chatapp
- **Password:** chatapp123

## Available Commands
- `npm run dev` - Start development server
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:migrate` - Apply database schema
- `npm run db:seed` - Seed with small dataset
- `npm run db:seed:large` - Seed with large dataset (performance testing)
- `npm run db:studio` - Open Drizzle Studio GUI

## Your Tasks

### Easy
1. **Prevent duplicate message sending** - When clicking send multiple times, messages are sent repeatedly. Prevent duplicate sends on multiple clicks.

2. **Add sending feedback** - Users have no indication when a message is being sent. Add visual feedback during message sending.

### Medium - from here on, populate the large dataset
3. **Text input takes forever when conversation is long** - When the conversation has a lot of messages, the input is all glitchy. I'd like for it to be fast and responsive.

4. **large conversations have weird scroll animation** - When I load a large conversation, there's a weird scroll animation to the bottom. I'd like the conversations to already start in the bottom.

### Hard
5. **Search messages** - Currently can only search by contact name. Implement search across all messages.

6. **Optimize initial load** - Loading hundreds of conversations is slow. Improve the loading performance.

## Evaluation

We'll discuss:
- How you identified each issue
- Your solution approach, through your commit history.
- Trade-offs you considered
- What you would improve with more time

Good luck!