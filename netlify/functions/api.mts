import type { Config } from "@netlify/functions";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { clickTransactions, orders } from "../../db/schema.js";
import products from "../../src/data/products.json" with { type: "json" };
import click from "../../server/click.cjs";

const { completeSignature, prepareSignature, signatureMatches } = click;

type Product = { id: number; title: string; price: number; image: string };
type Payload = Record<string, string>;

const maximumBodySize = 32 * 1024;
const productById = new Map((products as Product[]).map((product) => [product.id, product]));
const env = process.env;

let cachedRate: number | undefined;
let cachedAt = 0;

class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function json(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function readBody(req: Request) {
  const body = await req.text();
  if (Buffer.byteLength(body) > maximumBodySize) {
    throw new HttpError(413, "So‘rov hajmi juda katta.");
  }
  return body;
}

async function parseJson(req: Request) {
  const body = await readBody(req);
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(400, "So‘rov JSON formati noto‘g‘ri.");
  }
}

function normalizeItems(inputItems: unknown) {
  if (!Array.isArray(inputItems) || inputItems.length === 0 || inputItems.length > 50) {
    throw new HttpError(400, "Savatda mahsulot bo‘lishi kerak.");
  }

  const quantities = new Map<number, number>();
  for (const entry of inputItems) {
    const id = Number(entry?.id);
    const quantity = Number(entry?.quantity);
    if (!Number.isSafeInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HttpError(400, "Mahsulot yoki miqdor noto‘g‘ri.");
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  return Array.from(quantities, ([id, quantity]) => {
    const product = productById.get(id);
    if (!product) throw new HttpError(400, "Savatda noma’lum mahsulot bor.");
    if (quantity > 99) throw new HttpError(400, "Mahsulot miqdori 99 tadan oshmasligi kerak.");
    return { id: product.id, title: product.title, price: product.price, image: product.image, quantity };
  });
}

function normalizeCustomer(input: any) {
  const fullName = String(input?.fullName || "").trim();
  const phoneDigits = String(input?.phone || "").replace(/\D/g, "");
  const phone = phoneDigits.length === 9 ? `998${phoneDigits}` : phoneDigits;
  const city = String(input?.city || "").trim();
  const address = String(input?.address || "").trim();
  const notes = String(input?.notes || "").trim();

  if (fullName.length < 2 || fullName.length > 100) {
    throw new HttpError(400, "Ism-familiyani to‘g‘ri kiriting.");
  }
  if (!/^998\d{9}$/.test(phone)) {
    throw new HttpError(400, "Telefon raqamini +998 formatida kiriting.");
  }
  if (city.length < 2 || city.length > 100 || address.length < 5 || address.length > 300) {
    throw new HttpError(400, "Shahar va to‘liq manzilni kiriting.");
  }
  if (notes.length > 500) {
    throw new HttpError(400, "Izoh 500 belgidan oshmasligi kerak.");
  }

  return { fullName, phone: `+${phone}`, city, address, notes };
}

function normalizePaymentMethod(inputMethod: unknown) {
  const method = String(inputMethod || "click").trim().toLowerCase();
  return ["click", "payme", "cash", "terminal"].includes(method) ? method : "click";
}

function publicAppUrl() {
  return env.PUBLIC_APP_URL || env.URL || "";
}

function clickConfigured() {
  return !!(env.CLICK_SERVICE_ID && env.CLICK_MERCHANT_ID && env.CLICK_SECRET_KEY);
}

function clickConfiguration() {
  if (!clickConfigured() || !publicAppUrl()) {
    throw new HttpError(503, "Click sozlamalari tayyor emas. Netlify muhit o‘zgaruvchilarini to‘ldiring.");
  }
  let appUrl: URL;
  try {
    appUrl = new URL(publicAppUrl());
  } catch {
    throw new HttpError(500, "PUBLIC_APP_URL serverda noto‘g‘ri sozlangan.");
  }
  return {
    serviceId: env.CLICK_SERVICE_ID as string,
    merchantId: env.CLICK_MERCHANT_ID as string,
    secret: env.CLICK_SECRET_KEY as string,
    appUrl: appUrl.toString(),
  };
}

function callbackResponse(payload: Payload, error: number, errorNote: string, prepareId = 0) {
  const clickTransactionId = /^\d+$/.test(String(payload.click_trans_id || ""))
    ? Number(payload.click_trans_id)
    : payload.click_trans_id || 0;
  return json({
    click_trans_id: clickTransactionId,
    merchant_trans_id: payload.merchant_trans_id || "",
    merchant_prepare_id: prepareId,
    error,
    error_note: errorNote,
  });
}

function validAmount(received: unknown, expected: number) {
  const amount = Number(received);
  return Number.isFinite(amount) && Math.abs(amount - expected) < 0.005;
}

async function getUsdRate() {
  if (cachedRate && Date.now() - cachedAt < 60 * 60 * 1000) return cachedRate;

  try {
    const fallback = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(8000) });
    const fallbackRate = Number((await fallback.json())?.rates?.UZS);
    if (!env.CBU_USD_URL && Number.isFinite(fallbackRate) && fallbackRate > 0) {
      cachedRate = fallbackRate;
      cachedAt = Date.now();
    }
  } catch {
    /* fall through to CBU */
  }

  let response: Response;
  try {
    response = await fetch(env.CBU_USD_URL || "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/", {
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    if (cachedRate) return cachedRate;
    throw new HttpError(502, "Markaziy bank kursini olish imkoni bo‘lmadi. Keyinroq urinib ko‘ring.");
  }
  if (!response.ok && cachedRate) return cachedRate;
  if (!response.ok) throw new HttpError(502, "Markaziy bank kursi vaqtincha mavjud emas.");

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new HttpError(502, "Valyuta kursi javobi noto‘g‘ri.");
  }
  const rate = Number(data?.[0]?.Rate);
  if (!Number.isFinite(rate) || rate <= 0) throw new HttpError(502, "Valyuta kursi javobi noto‘g‘ri.");
  cachedRate = rate;
  cachedAt = Date.now();
  return rate;
}

function buildQuote(items: ReturnType<typeof normalizeItems>, rate: number) {
  const subtotalUzs = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * rate);
  const deliveryFeeUzs = Number(env.DELIVERY_FEE_UZS || 50000);
  if (!Number.isSafeInteger(deliveryFeeUzs) || deliveryFeeUzs < 0) {
    throw new HttpError(500, "Yetkazib berish narxi serverda noto‘g‘ri sozlangan.");
  }
  return { subtotalUzs, deliveryFeeUzs, totalUzs: subtotalUzs + deliveryFeeUzs, usdUzsRate: rate };
}

async function findOrder(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId));
  return order;
}

async function findTransaction(clickTransId: string) {
  const [transaction] = await db
    .select()
    .from(clickTransactions)
    .where(eq(clickTransactions.clickTransId, clickTransId));
  return transaction;
}

async function handleClickCallback(req: Request) {
  const payload: Payload = Object.fromEntries(new URLSearchParams(await readBody(req)).entries());
  const config = clickConfiguration();
  const action = payload.action;
  const expectedSignature =
    action === "0"
      ? prepareSignature(payload, config.serviceId, config.secret)
      : action === "1"
        ? completeSignature(payload, config.serviceId, config.secret)
        : null;

  if (!expectedSignature) return callbackResponse(payload, -2, "ACTION NOT FOUND");
  if (!signatureMatches(payload.sign_string, expectedSignature)) {
    return callbackResponse(payload, -1, "SIGN CHECK FAILED");
  }
  if (!/^\d+$/.test(String(payload.click_trans_id || ""))) {
    return callbackResponse(payload, -3, "TRANSACTION NOT FOUND");
  }

  const order = payload.merchant_trans_id ? await findOrder(payload.merchant_trans_id) : undefined;
  if (!order) return callbackResponse(payload, -3, "ORDER NOT FOUND");
  if (!validAmount(payload.amount, order.amountUzs)) {
    return callbackResponse(payload, -5, "INCORRECT AMOUNT");
  }

  if (action === "0") {
    const existingTransaction = await findTransaction(payload.click_trans_id);
    if (existingTransaction) {
      if (existingTransaction.orderId !== order.orderId || !validAmount(payload.amount, existingTransaction.amount)) {
        return callbackResponse(payload, -1, "TRANSACTION DATA MISMATCH");
      }
      return callbackResponse(payload, 0, "Success", existingTransaction.prepareId);
    }
    if (order.status === "paid") return callbackResponse(payload, -4, "ALREADY PAID");
    if (Number(payload.error) !== 0) return callbackResponse(payload, -9, "PAYMENT FAILED");

    const [inserted] = await db
      .insert(clickTransactions)
      .values({
        clickTransId: payload.click_trans_id,
        orderId: order.orderId,
        amount: Number(payload.amount),
        state: "prepared",
        clickPaydocId: payload.click_paydoc_id || null,
      })
      .onConflictDoNothing()
      .returning();
    if (!inserted) return callbackResponse(payload, -1, "DUPLICATE TRANSACTION");
    return callbackResponse(payload, 0, "Success", inserted.prepareId);
  }

  const transaction = await findTransaction(payload.click_trans_id);
  if (!transaction || String(transaction.prepareId) !== String(payload.merchant_prepare_id)) {
    return callbackResponse(payload, -6, "TRANSACTION NOT FOUND");
  }
  if (transaction.orderId !== order.orderId || !validAmount(payload.amount, transaction.amount)) {
    return callbackResponse(payload, -5, "INCORRECT TRANSACTION DATA");
  }
  if (transaction.state === "paid") return callbackResponse(payload, 0, "Success", transaction.prepareId);
  if (order.status === "paid") return callbackResponse(payload, -4, "ALREADY PAID", transaction.prepareId);

  const failed = Number(payload.error) !== 0;
  await db.transaction(async (tx) => {
    await tx
      .update(clickTransactions)
      .set({ state: failed ? "failed" : "paid" })
      .where(eq(clickTransactions.clickTransId, payload.click_trans_id));
    await tx
      .update(orders)
      .set({ status: failed ? "payment_failed" : "paid" })
      .where(eq(orders.orderId, order.orderId));
  });
  if (failed) return callbackResponse(payload, -9, "PAYMENT FAILED", transaction.prepareId);
  return callbackResponse(payload, 0, "Success", transaction.prepareId);
}

async function createOrder(req: Request) {
  const body = await parseJson(req);
  const items = normalizeItems(body.items);
  const customer = normalizeCustomer(body.customer);
  const paymentMethod = normalizePaymentMethod(body.paymentMethod);
  const quote = buildQuote(items, await getUsdRate());
  const orderId = randomUUID();
  const isOfflinePayment = paymentMethod === "cash" || paymentMethod === "terminal";

  await db.insert(orders).values({
    orderId,
    status: isOfflinePayment ? "cash_on_delivery" : "pending",
    amountUzs: quote.totalUzs,
    subtotalUzs: quote.subtotalUzs,
    deliveryFeeUzs: quote.deliveryFeeUzs,
    usdUzsRate: quote.usdUzsRate,
    customer,
    items,
    paymentMethod,
  });

  const base = { orderId, amountUzs: quote.totalUzs, paymentMethod };

  if (isOfflinePayment) return json({ ...base, status: "cash_on_delivery" }, 201);

  if (paymentMethod === "payme") {
    if (env.PAYME_MERCHANT_ID) {
      const params = `m=${env.PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${quote.totalUzs * 100}`;
      const encoded = Buffer.from(params).toString("base64");
      return json({ ...base, paymentUrl: `https://checkout.paycom.uz/${encoded}` }, 201);
    }
    return json({ ...base, demoMode: true }, 201);
  }

  if (clickConfigured()) {
    const config = clickConfiguration();
    const returnUrl = new URL(config.appUrl);
    returnUrl.searchParams.set("orderId", orderId);
    const paymentUrl = new URL("https://my.click.uz/services/pay");
    paymentUrl.searchParams.set("service_id", config.serviceId);
    paymentUrl.searchParams.set("merchant_id", config.merchantId);
    paymentUrl.searchParams.set("amount", String(quote.totalUzs));
    paymentUrl.searchParams.set("transaction_param", orderId);
    paymentUrl.searchParams.set("return_url", returnUrl.toString());
    return json({ ...base, paymentUrl: paymentUrl.toString() }, 201);
  }

  return json({ ...base, demoMode: true }, 201);
}

async function handle(req: Request) {
  const { pathname } = new URL(req.url);

  if (req.method === "GET" && pathname === "/api/health") return json({ status: "ok" });

  if (req.method === "POST" && pathname === "/api/click") {
    if (!req.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) {
      return json({ error: "Click callback formati noto‘g‘ri." }, 400);
    }
    return handleClickCallback(req);
  }

  if (req.method === "POST" && pathname === "/api/quote") {
    const body = await parseJson(req);
    const items = normalizeItems(body.items);
    return json(buildQuote(items, await getUsdRate()));
  }

  if (req.method === "POST" && pathname === "/api/orders") return createOrder(req);

  const statusMatch = req.method === "GET" && pathname.match(/^\/api\/orders\/([0-9a-f-]{36})\/status$/i);
  if (statusMatch) {
    const order = await findOrder(statusMatch[1]);
    if (!order) return json({ error: "Buyurtma topilmadi." }, 404);
    return json({
      status: order.status,
      amountUzs: order.amountUzs,
      subtotalUzs: order.subtotalUzs,
      deliveryFeeUzs: order.deliveryFeeUzs,
      usdUzsRate: order.usdUzsRate,
      paymentMethod: order.paymentMethod || "click",
      customer: order.customer,
      items: order.items,
      createdAt: order.createdAt,
    });
  }

  if (req.method === "GET" && pathname === "/api/payment-config") {
    const paymeConfigured = !!env.PAYME_MERCHANT_ID;
    return json({
      clickEnabled: clickConfigured(),
      paymeEnabled: paymeConfigured,
      cashEnabled: true,
      terminalEnabled: true,
      demoMode: !clickConfigured() && !paymeConfigured,
    });
  }

  const demoPayMatch = req.method === "POST" && pathname.match(/^\/api\/orders\/([0-9a-f-]{36})\/demo-pay$/i);
  if (demoPayMatch) {
    const order = await findOrder(demoPayMatch[1]);
    if (!order) return json({ error: "Buyurtma topilmadi." }, 404);
    if (order.status === "paid") {
      return json({ status: "paid", message: "Buyurtma allaqachon to'langan." });
    }
    await db.update(orders).set({ status: "paid" }).where(eq(orders.orderId, order.orderId));
    return json({ status: "paid", message: "Demo to'lov muvaffaqiyatli amalga oshirildi." });
  }

  return json({ error: "Manzil topilmadi." }, 404);
}

export default async (req: Request) => {
  try {
    return await handle(req);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.statusCode >= 500) console.error("API request failed:", error.message);
      return json({ error: error.message }, error.statusCode);
    }
    console.error("API request failed:", error);
    return json({ error: "Serverda kutilmagan xatolik yuz berdi." }, 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
