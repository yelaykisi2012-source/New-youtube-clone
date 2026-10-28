const { createHash, timingSafeEqual } = require("node:crypto");

function createSignature(fields) {
  return createHash("md5").update(fields.join("")).digest("hex");
}

function prepareSignature(payload, serviceId, secret) {
  return createSignature([
    payload.click_trans_id,
    serviceId,
    secret,
    payload.merchant_trans_id,
    payload.amount,
    payload.action,
    payload.sign_time,
  ]);
}

function completeSignature(payload, serviceId, secret) {
  return createSignature([
    payload.click_trans_id,
    serviceId,
    secret,
    payload.merchant_trans_id,
    payload.merchant_prepare_id,
    payload.amount,
    payload.action,
    payload.sign_time,
  ]);
}

function signatureMatches(received, expected) {
  if (typeof received !== "string" || !/^[a-f\d]{32}$/i.test(received)) return false;
  const receivedBuffer = Buffer.from(received.toLowerCase(), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

module.exports = { completeSignature, prepareSignature, signatureMatches };
