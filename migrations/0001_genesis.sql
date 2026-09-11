CREATE TABLE IF NOT EXISTS "genesis_worlds" (
 "id" text PRIMARY KEY NOT NULL,
 "state" jsonb NOT NULL,
 "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "genesis_checkpoints" (
 "id" text PRIMARY KEY NOT NULL,
 "state" jsonb NOT NULL,
 "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "genesis_events" (
 "id" text PRIMARY KEY NOT NULL,
 "generation" integer NOT NULL,
 "event" jsonb NOT NULL,
 "created_at" timestamp DEFAULT now() NOT NULL
);
