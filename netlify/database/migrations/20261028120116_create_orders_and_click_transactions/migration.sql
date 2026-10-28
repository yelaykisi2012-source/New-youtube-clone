CREATE TABLE "click_transactions" (
	"prepare_id" serial PRIMARY KEY,
	"click_trans_id" text NOT NULL UNIQUE,
	"order_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"state" text NOT NULL,
	"click_paydoc_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" text PRIMARY KEY,
	"status" text NOT NULL,
	"amount_uzs" integer NOT NULL,
	"subtotal_uzs" integer NOT NULL,
	"delivery_fee_uzs" integer NOT NULL,
	"usd_uzs_rate" double precision NOT NULL,
	"customer" jsonb NOT NULL,
	"items" jsonb NOT NULL,
	"payment_method" text DEFAULT 'click' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "click_transactions_order_id" ON "click_transactions" ("order_id");--> statement-breakpoint
ALTER TABLE "click_transactions" ADD CONSTRAINT "click_transactions_order_id_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id");