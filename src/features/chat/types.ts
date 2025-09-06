import { conversations, messages, users } from "@/lib/db/schema";

export type Contact = Omit<typeof users.$inferSelect, "updatedAt">;
export type Conversation = typeof conversations.$inferSelect;

export type Message = typeof messages.$inferSelect;
export type CreateMessage = typeof messages.$inferInsert;
export type UpdateMessage = Partial<Omit<CreateMessage, "id" | "createdAt">>;