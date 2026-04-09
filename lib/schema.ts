import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const polls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: text("creator_id").notNull(),
  question: text("question").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  passwordHash: text("password_hash"), // NULL si pública, bcrypt hash si privada
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // fijado en la API: now + 24h
});

export const options = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => polls.id),
  optionId: uuid("option_id")
    .notNull()
    .references(() => options.id),
  sessionToken: text("session_token").notNull(), // token del browser para evitar votos duplicados
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
