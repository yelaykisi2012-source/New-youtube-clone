const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createServer } = require("./index.cjs");
const { completeSignature, prepareSignature } = require("./click.cjs");

const env = {
  API_PORT: "0",
  FRONTEND_ORIGIN: "http://localhost:3000",
  PUBLIC_APP_URL: "http://localhost:3000",
  DELIVERY_FEE_UZS: "50000",
  CLICK_SERVICE_ID: "service-test",
  CLICK_MERCHANT_ID: "merchant-test",
  CLICK_SECRET_KEY: "test-secret",
};

async function startTestServer(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "loyixa-api-"));
  const server = createServer({
    dbPath: path.join(directory, "orders.sqlite"),
    env,
    fetchImpl: async () => ({
      ok: true,
      json: async () => [{ Rate: "11838.92" }],
    }),
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    server.database.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return baseUrl;
}

test("quote and order amount use the server catalog and Central Bank rate", async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ id: 2, quantity: 2 }] }),
  });
  const quote = await response.json();

  assert.equal(response.status, 200);
  assert.equal(quote.subtotalUzs, Math.round(22.3 * 2 * 11838.92));
  assert.equal(quote.deliveryFeeUzs, 50000);
  assert.equal(quote.totalUzs, quote.subtotalUzs + 50000);
  assert.equal(quote.usdUzsRate, 11838.92);
});

test("Click prepare and complete callbacks mark the persisted order as paid", async (t) => {
  const baseUrl = await startTestServer(t);
  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ id: 2, quantity: 2 }],
      customer: {
        fullName: "Test Customer",
        phone: "+998 90 123 45 67",
        city: "Toshkent",
        address: "Test ko‘chasi, 1-uy",
      },
    }),
  });
  const order = await orderResponse.json();
  assert.equal(orderResponse.status, 201);

  const prepare = {
    click_trans_id: "123456789",
    service_id: env.CLICK_SERVICE_ID,
    merchant_trans_id: order.orderId,
    amount: String(order.amountUzs),
    action: "0",
    error: "0",
    error_note: "Success",
    sign_time: "2026-10-26 12:00:00",
    click_paydoc_id: "987654321",
  };
  prepare.sign_string = prepareSignature(prepare, env.CLICK_SERVICE_ID, env.CLICK_SECRET_KEY);
  const prepareResponse = await fetch(`${baseUrl}/api/click`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(prepare),
  });
  const prepared = await prepareResponse.json();

  assert.equal(prepared.error, 0);
  assert.ok(prepared.merchant_prepare_id > 0);

  const complete = {
    ...prepare,
    action: "1",
    merchant_prepare_id: String(prepared.merchant_prepare_id),
  };
  complete.sign_string = completeSignature(complete, env.CLICK_SERVICE_ID, env.CLICK_SECRET_KEY);
  const completeResponse = await fetch(`${baseUrl}/api/click`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(complete),
  });
  const completed = await completeResponse.json();
  assert.equal(completed.error, 0);

  const statusResponse = await fetch(`${baseUrl}/api/orders/${order.orderId}/status`);
  const status = await statusResponse.json();
  assert.equal(status.status, "paid");
  assert.equal(status.amountUzs, order.amountUzs);
});

test("order creation rejects products that are not in the server catalog", async (t) => {
  const baseUrl = await startTestServer(t);
  const response = await fetch(`${baseUrl}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ id: 999, quantity: 1 }] }),
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.match(result.error, /noma’lum mahsulot/);
});

test("Click callbacks reject invalid signatures", async (t) => {
  const baseUrl = await startTestServer(t);
  const payload = {
    click_trans_id: "123456789",
    service_id: env.CLICK_SERVICE_ID,
    merchant_trans_id: "not-an-order",
    amount: "50000",
    action: "0",
    error: "0",
    sign_time: "2026-10-26 12:00:00",
    sign_string: "0".repeat(32),
  };
  const response = await fetch(`${baseUrl}/api/click`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload),
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.error, -1);
});

test("a failed Click completion marks the order as unpaid", async (t) => {
  const baseUrl = await startTestServer(t);
  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ id: 1, quantity: 1 }],
      customer: {
        fullName: "Test Customer",
        phone: "901234567",
        city: "Toshkent",
        address: "Test ko‘chasi, 1-uy",
      },
    }),
  });
  const order = await orderResponse.json();
  const payload = {
    click_trans_id: "123456790",
    service_id: env.CLICK_SERVICE_ID,
    merchant_trans_id: order.orderId,
    amount: String(order.amountUzs),
    action: "0",
    error: "0",
    error_note: "Success",
    sign_time: "2026-10-26 12:00:00",
    click_paydoc_id: "987654322",
  };
  payload.sign_string = prepareSignature(payload, env.CLICK_SERVICE_ID, env.CLICK_SECRET_KEY);
  const prepareResponse = await fetch(`${baseUrl}/api/click`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload),
  });
  const prepared = await prepareResponse.json();

  const completion = {
    ...payload,
    action: "1",
    error: "-1",
    merchant_prepare_id: String(prepared.merchant_prepare_id),
  };
  completion.sign_string = completeSignature(
    completion,
    env.CLICK_SERVICE_ID,
    env.CLICK_SECRET_KEY,
  );
  const completeResponse = await fetch(`${baseUrl}/api/click`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(completion),
  });
  const completed = await completeResponse.json();
  const statusResponse = await fetch(`${baseUrl}/api/orders/${order.orderId}/status`);
  const status = await statusResponse.json();

  assert.equal(completed.error, -9);
  assert.equal(status.status, "payment_failed");
});

test("cash on delivery creates order with cash_on_delivery status", async (t) => {
  const baseUrl = await startTestServer(t);
  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ id: 1, quantity: 1 }],
      customer: {
        fullName: "Ali Valiyev",
        phone: "+998 90 999 88 77",
        city: "Samarqand",
        address: "Registon ko'chasi 5-uy",
      },
      paymentMethod: "cash",
    }),
  });
  const order = await orderResponse.json();
  assert.equal(orderResponse.status, 201);
  assert.equal(order.status, "cash_on_delivery");
  assert.equal(order.paymentMethod, "cash");

  const statusResponse = await fetch(`${baseUrl}/api/orders/${order.orderId}/status`);
  const status = await statusResponse.json();
  assert.equal(status.status, "cash_on_delivery");
  assert.equal(status.paymentMethod, "cash");
  assert.equal(status.customer.fullName, "Ali Valiyev");
  assert.equal(status.items.length, 1);
});

test("demo pay endpoint marks pending order as paid", async (t) => {
  const baseUrl = await startTestServer(t);
  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ id: 1, quantity: 2 }],
      customer: {
        fullName: "Test Demo",
        phone: "+998 90 111 22 33",
        city: "Toshkent",
        address: "Chilonzor 9",
      },
      paymentMethod: "click",
    }),
  });
  const order = await orderResponse.json();
  assert.equal(orderResponse.status, 201);

  const demoPayResponse = await fetch(`${baseUrl}/api/orders/${order.orderId}/demo-pay`, {
    method: "POST",
  });
  const demoResult = await demoPayResponse.json();
  assert.equal(demoPayResponse.status, 200);
  assert.equal(demoResult.status, "paid");

  const statusResponse = await fetch(`${baseUrl}/api/orders/${order.orderId}/status`);
  const status = await statusResponse.json();
  assert.equal(status.status, "paid");
});
