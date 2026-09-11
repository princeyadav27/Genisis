import { pgTable, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import type { World, WorldEvent } from '@/lib/simulation';
export const worlds = pgTable('genesis_worlds', { id: text('id').primaryKey(), state: jsonb('state').$type<World>().notNull(), updatedAt: timestamp('updated_at').defaultNow().notNull() });
export const checkpoints = pgTable('genesis_checkpoints', { id: text('id').primaryKey(), state: jsonb('state').$type<World>().notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
export const eventJournal = pgTable('genesis_events', { id: text('id').primaryKey(), generation: integer('generation').notNull(), event: jsonb('event').$type<WorldEvent>().notNull(), createdAt: timestamp('created_at').defaultNow().notNull() });
