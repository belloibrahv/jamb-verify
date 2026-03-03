import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum
} from "drizzle-orm/pg-core";

export const transactionType = pgEnum("transaction_type", [
  "credit",
  "debit",
  "refund"
]);

export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "refunded"
]);

export const verificationStatus = pgEnum("verification_status", [
  "pending",
  "success",
  "failed"
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const wallets = pgTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  balance: integer("balance").notNull().default(0),
  currency: text("currency").notNull().default("NGN"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: transactionType("type").notNull(),
  status: transactionStatus("status").notNull(),
  amount: integer("amount").notNull(),
  provider: text("provider").notNull(),
  reference: text("reference"),
  description: text("description"),
  ninMasked: text("nin_masked"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const ninVerifications = pgTable("nin_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ninMasked: text("nin_masked").notNull(),
  consent: boolean("consent").notNull().default(false),
  status: verificationStatus("status").notNull(),
  fullName: text("full_name"),
  dateOfBirth: text("date_of_birth"),
  phone: text("phone"),
  providerReference: text("provider_reference"),
  errorMessage: text("error_message"),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
