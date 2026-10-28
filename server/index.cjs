const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const products = require("../src/data/products.json");
const { completeSignature, prepareSignature, signatureMatches } = require("./click.cjs");

const maximumBodySize = 32 * 1024;
const productById = new Map(products.map((product) => [product.id, product]));

function loadEnvironment(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let rejected = false;
    const chunks = [];
    req.on("data", (chunk) => {
      if (rejected) return;
      size += chunk.length;
      if (size > maximumBodySize) {
        rejected = true;
        reject(Object.assign(new Error("So‘rov hajmi juda katta."), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function normalizeItems(inputItems) {
  if (!Array.isArray(inputItems) || inputItems.length === 0 || inputItems.length > 50) {
    throw Object.assign(new Error("Savatda mahsulot bo‘lishi kerak."), { statusCode: 400 });
  }

  const quantities = new Map();
  for (const entry of inputItems) {
    const id = Number(entry?.id);
    const quantity = Number(entry?.quantity);
    if (!Number.isSafeInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw Object.assign(new Error("Mahsulot yoki miqdor noto‘g‘ri."), { statusCode: 400 });
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  return Array.from(quantities, ([id, quantity]) => {
    const product = productById.get(id);
    if (!product) {
      throw Object.assign(new Error("Savatda noma’lum mahsulot bor."), { statusCode: 400 });
    }
    if (quantity > 99) {
      throw Object.assign(new Error("Mahsulot miqdori 99 tadan oshmasligi kerak."), { statusCode: 400 });
    }
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
    };
  });
}

function normalizeCustomer(input) {
  const fullName = String(input?.fullName || "").trim();
  const phoneDigits = String(input?.phone || "").replace(/\D/g, "");
  const phone = phoneDigits.length === 9 ? `998${phoneDigits}` : phoneDigits;
  const city = String(input?.city || "").trim();
  const address = String(input?.address || "").trim();
  const notes = String(input?.notes || "").trim();

  if (fullName.length < 2 || fullName.length > 100) {
    throw Object.assign(new Error("Ism-familiyani to‘g‘ri kiriting."), { statusCode: 400 });
  }
  if (!/^998\d{9}$/.test(phone)) {
    throw Object.assign(new Error("Telefon raqamini +998 formatida kiriting."), { statusCode: 400 });
  }
  if (city.length < 2 || city.length > 100 || address.length < 5 || address.length > 300) {
    throw Object.assign(new Error("Shahar va to‘liq manzilni kiriting."), { statusCode: 400 });
  }
  if (notes.length > 500) {
    throw Object.assign(new Error("Izoh 500 belgidan oshmasligi kerak."), { statusCode: 400 });
  }

  return { fullName, phone: `+${phone}`, city, address, notes };
}

function normalizePaymentMethod(inputMethod) {
  const method = String(inputMethod || "click").trim().toLowerCase();
  const validMethods = ["click", "payme", "cash", "terminal"];
  return validMethods.includes(method) ? method : "click";
}

function clickConfiguration(env) {
  const required = ["CLICK_SERVICE_ID", "CLICK_MERCHANT_ID", "CLICK_SECRET_KEY", "PUBLIC_APP_URL"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw Object.assign(
      new Error("Click sozlamalari tayyor emas. Serverdagi .env faylini to‘ldiring."),
      { statusCode: 503 },
    );
  }
  let appUrl;
  try {
    appUrl = new URL(env.PUBLIC_APP_URL);
  } catch {
    throw Object.assign(new Error("PUBLIC_APP_URL serverda noto‘g‘ri sozlangan."), { statusCode: 500 });
  }
  if (
    env.NODE_ENV === "production" &&
    appUrl.protocol !== "https:" &&
    appUrl.hostname !== "localhost"
  ) {
    throw Object.assign(new Error("Production do‘kon manzili HTTPS bo‘lishi kerak."), {
      statusCode: 500,
    });
  }
  return {
    serviceId: env.CLICK_SERVICE_ID,
    merchantId: env.CLICK_MERCHANT_ID,
    secret: env.CLICK_SECRET_KEY,
    appUrl: appUrl.toString(),
  };
}

function callbackResponse(payload, error, errorNote, prepareId = 0) {
  const clickTransactionId = /^\d+$/.test(String(payload.click_trans_id || ""))
    ? Number(payload.click_trans_id)
    : payload.click_trans_id || 0;
  return {
    click_trans_id: clickTransactionId,
    merchant_trans_id: payload.merchant_trans_id || "",
    merchant_prepare_id: prepareId,
    error,
    error_note: errorNote,
  };
}

function validAmount(received, expected) {
  const amount = Number(received);
  return Number.isFinite(amount) && Math.abs(amount - expected) < 0.005;
}

function createDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const database = new DatabaseSync(dbPath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      amount_uzs INTEGER NOT NULL,
      subtotal_uzs INTEGER NOT NULL,
      delivery_fee_uzs INTEGER NOT NULL,
      usd_uzs_rate REAL NOT NULL,
      customer_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'click',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS click_transactions (
      prepare_id INTEGER PRIMARY KEY AUTOINCREMENT,
      click_trans_id TEXT NOT NULL UNIQUE,
      order_id TEXT NOT NULL REFERENCES orders(order_id),
      amount REAL NOT NULL,
      state TEXT NOT NULL,
      click_paydoc_id TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS click_transactions_order_id ON click_transactions(order_id);
  `);
  try {
    database.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'click';");
  } catch {
    /* column already exists */
  }
  return database;
}

function createServer(options = {}) {
  const env = options.env || process.env;
  const database = createDatabase(
    options.dbPath || path.join(__dirname, "data", "orders.sqlite"),
  );
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  let cachedRate;
  let cachedAt = 0;

  async function getUsdRate() {
    if (cachedRate && Date.now() - cachedAt < 60 * 60 * 1000) return cachedRate;

    let response;
    try {
      response = await fetchImpl(
        env.CBU_USD_URL || "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/",
        { signal: AbortSignal.timeout(8000) },
      );
    } catch {
      throw Object.assign(new Error("Markaziy bank kursini olish imkoni bo‘lmadi. Keyinroq urinib ko‘ring."), {
        statusCode: 502,
      });
    }
    if (!response.ok) {
      throw Object.assign(new Error("Markaziy bank kursi vaqtincha mavjud emas."), { statusCode: 502 });
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw Object.assign(new Error("Valyuta kursi javobi noto‘g‘ri."), { statusCode: 502 });
    }
    const rate = Number(data?.[0]?.Rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw Object.assign(new Error("Valyuta kursi javobi noto‘g‘ri."), { statusCode: 502 });
    }
    cachedRate = rate;
    cachedAt = Date.now();
    return rate;
  }

  function buildQuote(items, rate) {
    const subtotalUzs = Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * rate,
    );
    const deliveryFeeUzs = Number(env.DELIVERY_FEE_UZS || 50000);
    if (!Number.isSafeInteger(deliveryFeeUzs) || deliveryFeeUzs < 0) {
      throw Object.assign(new Error("Yetkazib berish narxi serverda noto‘g‘ri sozlangan."), {
        statusCode: 500,
      });
    }
    return {
      subtotalUzs,
      deliveryFeeUzs,
      totalUzs: subtotalUzs + deliveryFeeUzs,
      usdUzsRate: rate,
    };
  }

  function sendCors(req, res) {
    const origin = req.headers.origin;
    const allowedOrigin = env.FRONTEND_ORIGIN || "http://localhost:3000";

    if (env.NODE_ENV === "production" && origin && origin !== allowedOrigin) {
      json(res, 403, { error: "Bu manbadan so‘rov yuborishga ruxsat yo‘q." });
      return false;
    }

    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    return true;
  }

  async function parseJson(req) {
    const body = await readBody(req);
    try {
      return JSON.parse(body);
    } catch {
      throw Object.assign(new Error("So‘rov JSON formati noto‘g‘ri."), { statusCode: 400 });
    }
  }

  async function handleClickCallback(req, res) {
    const form = new URLSearchParams(await readBody(req));
    const payload = Object.fromEntries(form.entries());
    const config = clickConfiguration(env);
    const action = payload.action;
    const expectedSignature =
      action === "0"
        ? prepareSignature(payload, config.serviceId, config.secret)
        : action === "1"
          ? completeSignature(payload, config.serviceId, config.secret)
          : null;

    if (!expectedSignature) {
      return json(res, 200, callbackResponse(payload, -2, "ACTION NOT FOUND"));
    }
    if (!signatureMatches(payload.sign_string, expectedSignature)) {
      return json(res, 200, callbackResponse(payload, -1, "SIGN CHECK FAILED"));
    }
    if (!/^\d+$/.test(String(payload.click_trans_id || ""))) {
      return json(res, 200, callbackResponse(payload, -3, "TRANSACTION NOT FOUND"));
    }

    const order = database.prepare("SELECT * FROM orders WHERE order_id = ?").get(payload.merchant_trans_id);
    if (!order) {
      return json(res, 200, callbackResponse(payload, -3, "ORDER NOT FOUND"));
    }
    if (!validAmount(payload.amount, order.amount_uzs)) {
      return json(res, 200, callbackResponse(payload, -5, "INCORRECT AMOUNT"));
    }

    if (action === "0") {
      const existingTransaction = database
        .prepare("SELECT * FROM click_transactions WHERE click_trans_id = ?")
        .get(payload.click_trans_id);
      if (existingTransaction) {
        if (
          existingTransaction.order_id !== order.order_id ||
          !validAmount(payload.amount, existingTransaction.amount)
        ) {
          return json(res, 200, callbackResponse(payload, -1, "TRANSACTION DATA MISMATCH"));
        }
        return json(
          res,
          200,
          callbackResponse(payload, 0, "Success", existingTransaction.prepare_id),
        );
      }
      if (order.status === "paid") {
        return json(res, 200, callbackResponse(payload, -4, "ALREADY PAID"));
      }
      if (Number(payload.error) !== 0) {
        return json(res, 200, callbackResponse(payload, -9, "PAYMENT FAILED"));
      }

      database.exec("BEGIN IMMEDIATE");
      try {
        const result = database
          .prepare(
            "INSERT INTO click_transactions (click_trans_id, order_id, amount, state, click_paydoc_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          )
          .run(
            payload.click_trans_id,
            order.order_id,
            Number(payload.amount),
            "prepared",
            payload.click_paydoc_id || null,
            new Date().toISOString(),
          );
        database.exec("COMMIT");
        return json(res, 200, callbackResponse(payload, 0, "Success", Number(result.lastInsertRowid)));
      } catch (error) {
        database.exec("ROLLBACK");
        if (error.code === "ERR_SQLITE_CONSTRAINT_UNIQUE") {
          return json(res, 200, callbackResponse(payload, -1, "DUPLICATE TRANSACTION"));
        }
        throw error;
      }
    }

    const transaction = database
      .prepare("SELECT * FROM click_transactions WHERE click_trans_id = ?")
      .get(payload.click_trans_id);
    if (!transaction || String(transaction.prepare_id) !== String(payload.merchant_prepare_id)) {
      return json(res, 200, callbackResponse(payload, -6, "TRANSACTION NOT FOUND"));
    }
    if (transaction.order_id !== order.order_id || !validAmount(payload.amount, transaction.amount)) {
      return json(res, 200, callbackResponse(payload, -5, "INCORRECT TRANSACTION DATA"));
    }
    if (transaction.state === "paid") {
      return json(res, 200, callbackResponse(payload, 0, "Success", transaction.prepare_id));
    }
    if (order.status === "paid") {
      return json(res, 200, callbackResponse(payload, -4, "ALREADY PAID", transaction.prepare_id));
    }
    if (Number(payload.error) !== 0) {
      database.exec("BEGIN IMMEDIATE");
      try {
        database
          .prepare("UPDATE click_transactions SET state = 'failed' WHERE click_trans_id = ?")
          .run(payload.click_trans_id);
        database
          .prepare("UPDATE orders SET status = 'payment_failed' WHERE order_id = ?")
          .run(order.order_id);
        database.exec("COMMIT");
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
      return json(res, 200, callbackResponse(payload, -9, "PAYMENT FAILED", transaction.prepare_id));
    }

    database.exec("BEGIN IMMEDIATE");
    try {
      database
        .prepare("UPDATE click_transactions SET state = 'paid' WHERE click_trans_id = ?")
        .run(payload.click_trans_id);
      database
        .prepare("UPDATE orders SET status = 'paid' WHERE order_id = ?")
        .run(order.order_id);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
    return json(res, 200, callbackResponse(payload, 0, "Success", transaction.prepare_id));
  }

  async function handle(req, res) {
    if (!sendCors(req, res)) return;
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { status: "ok" });
    }
    if (req.method === "POST" && url.pathname === "/api/click") {
      if (req.headers["content-type"]?.startsWith("application/x-www-form-urlencoded") !== true) {
        return json(res, 400, { error: "Click callback formati noto‘g‘ri." });
      }
      return handleClickCallback(req, res);
    }
    if (req.method === "POST" && url.pathname === "/api/quote") {
      const body = await parseJson(req);
      const items = normalizeItems(body.items);
      const rate = await getUsdRate();
      return json(res, 200, buildQuote(items, rate));
    }
    if (req.method === "POST" && url.pathname === "/api/orders") {
      const body = await parseJson(req);
      const items = normalizeItems(body.items);
      const customer = normalizeCustomer(body.customer);
      const paymentMethod = normalizePaymentMethod(body.paymentMethod);
      const rate = await getUsdRate();
      const quote = buildQuote(items, rate);
      const orderId = randomUUID();
      const createdAt = new Date().toISOString();
      const isOfflinePayment = paymentMethod === "cash" || paymentMethod === "terminal";
      const initialStatus = isOfflinePayment ? "cash_on_delivery" : "pending";

      database
        .prepare(
          "INSERT INTO orders (order_id, status, amount_uzs, subtotal_uzs, delivery_fee_uzs, usd_uzs_rate, customer_json, items_json, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          orderId,
          initialStatus,
          quote.totalUzs,
          quote.subtotalUzs,
          quote.deliveryFeeUzs,
          quote.usdUzsRate,
          JSON.stringify(customer),
          JSON.stringify(items),
          paymentMethod,
          createdAt,
        );

      if (isOfflinePayment) {
        return json(res, 201, {
          orderId,
          amountUzs: quote.totalUzs,
          paymentMethod,
          status: "cash_on_delivery",
        });
      }

      if (paymentMethod === "payme") {
        const paymeMerchantId = env.PAYME_MERCHANT_ID;
        if (paymeMerchantId) {
          const amountTiyin = quote.totalUzs * 100;
          const params = `m=${paymeMerchantId};ac.order_id=${orderId};a=${amountTiyin}`;
          const encoded = Buffer.from(params).toString("base64");
          return json(res, 201, {
            orderId,
            amountUzs: quote.totalUzs,
            paymentMethod: "payme",
            paymentUrl: `https://checkout.paycom.uz/${encoded}`,
          });
        }
        return json(res, 201, {
          orderId,
          amountUzs: quote.totalUzs,
          paymentMethod: "payme",
          demoMode: true,
        });
      }

      const clickConfigured = !!(env.CLICK_SERVICE_ID && env.CLICK_MERCHANT_ID && env.CLICK_SECRET_KEY);

      if (clickConfigured) {
        const config = clickConfiguration(env);
        const returnUrl = new URL(config.appUrl);
        returnUrl.searchParams.set("orderId", orderId);
        const paymentUrl = new URL("https://my.click.uz/services/pay");
        paymentUrl.searchParams.set("service_id", config.serviceId);
        paymentUrl.searchParams.set("merchant_id", config.merchantId);
        paymentUrl.searchParams.set("amount", String(quote.totalUzs));
        paymentUrl.searchParams.set("transaction_param", orderId);
        paymentUrl.searchParams.set("return_url", returnUrl.toString());
        return json(res, 201, {
          orderId,
          amountUzs: quote.totalUzs,
          paymentMethod: "click",
          paymentUrl: paymentUrl.toString(),
        });
      }

      return json(res, 201, {
        orderId,
        amountUzs: quote.totalUzs,
        paymentMethod: "click",
        demoMode: true,
      });
    }

    const statusMatch = req.method === "GET" && url.pathname.match(/^\/api\/orders\/([0-9a-f-]{36})\/status$/i);
    if (statusMatch) {
      const order = database
        .prepare(
          "SELECT status, amount_uzs AS amountUzs, subtotal_uzs AS subtotalUzs, delivery_fee_uzs AS deliveryFeeUzs, usd_uzs_rate AS usdUzsRate, payment_method AS paymentMethod, customer_json AS customerJson, items_json AS itemsJson, created_at AS createdAt FROM orders WHERE order_id = ?",
        )
        .get(statusMatch[1]);
      if (!order) return json(res, 404, { error: "Buyurtma topilmadi." });

      let customer = null;
      let items = [];
      try { customer = JSON.parse(order.customerJson); } catch {}
      try { items = JSON.parse(order.itemsJson); } catch {}

      return json(res, 200, {
        status: order.status,
        amountUzs: order.amountUzs,
        subtotalUzs: order.subtotalUzs,
        deliveryFeeUzs: order.deliveryFeeUzs,
        usdUzsRate: order.usdUzsRate,
        paymentMethod: order.paymentMethod || "click",
        customer,
        items,
        createdAt: order.createdAt,
      });
    }

    if (req.method === "GET" && url.pathname === "/api/payment-config") {
      const clickConfigured = !!(env.CLICK_SERVICE_ID && env.CLICK_MERCHANT_ID && env.CLICK_SECRET_KEY);
      const paymeConfigured = !!env.PAYME_MERCHANT_ID;
      return json(res, 200, {
        clickEnabled: clickConfigured,
        paymeEnabled: paymeConfigured,
        cashEnabled: true,
        terminalEnabled: true,
        demoMode: !clickConfigured && !paymeConfigured,
      });
    }

    const demoPayMatch = req.method === "POST" && url.pathname.match(/^\/api\/orders\/([0-9a-f-]{36})\/demo-pay$/i);
    if (demoPayMatch) {
      const demoOrder = database.prepare("SELECT * FROM orders WHERE order_id = ?").get(demoPayMatch[1]);
      if (!demoOrder) return json(res, 404, { error: "Buyurtma topilmadi." });
      if (demoOrder.status === "paid") {
        return json(res, 200, { status: "paid", message: "Buyurtma allaqachon to'langan." });
      }
      database.prepare("UPDATE orders SET status = 'paid' WHERE order_id = ?").run(demoOrder.order_id);
      return json(res, 200, { status: "paid", message: "Demo to'lov muvaffaqiyatli amalga oshirildi." });
    }

    return json(res, 404, { error: "Manzil topilmadi." });
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((error) => {
      if (!error.statusCode || error.statusCode >= 500) {
        console.error("API request failed:", error.message);
      }
      if (!res.headersSent) {
        json(res, error.statusCode || 500, {
          error: error.statusCode ? error.message : "Serverda kutilmagan xatolik yuz berdi.",
        });
      }
    });
  });
  server.database = database;
  return server;
}

if (require.main === module) {
  loadEnvironment(path.resolve(__dirname, "..", ".env"));
  const port = Number(process.env.API_PORT || 4000);
  const server = createServer();
  server.listen(port, () => {
    console.log(`Store API listening on port ${port}`);
    if (
      !process.env.CLICK_SERVICE_ID ||
      !process.env.CLICK_MERCHANT_ID ||
      !process.env.CLICK_SECRET_KEY
    ) {
      console.warn("Click credentials are missing. Set them in the root .env file before accepting payments.");
    }
  });
}

module.exports = { createServer, loadEnvironment };
