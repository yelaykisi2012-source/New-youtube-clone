import { doublePrecision, index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  orderId: text("order_id").primaryKey(),
  status: text().notNull(),
  amountUzs: integer("amount_uzs").notNull(),
  subtotalUzs: integer("subtotal_uzs").notNull(),
  deliveryFeeUzs: integer("delivery_fee_uzs").notNull(),
  usdUzsRate: doublePrecision("usd_uzs_rate").notNull(),
  customer: jsonb().notNull(),
  items: jsonb().notNull(),
  paymentMethod: text("payment_method").notNull().default("click"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clickTransactions = pgTable(
  "click_transactions",
  {
    prepareId: serial("prepare_id").primaryKey(),
    clickTransId: text("click_trans_id").notNull().unique(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.orderId),
    amount: doublePrecision().notNull(),
    state: text().notNull(),
    clickPaydocId: text("click_paydoc_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("click_transactions_order_id").on(table.orderId)],
);
