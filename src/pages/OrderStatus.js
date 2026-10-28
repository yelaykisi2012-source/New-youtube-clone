import { useCallback, useEffect, useState } from "react";
import { readApiResponse } from "../utils/api";

const apiBaseUrl = process.env.REACT_APP_API_URL || "";

function formatUzs(value) {
  return `${Number(value || 0).toLocaleString("uz-UZ")} so‘m`;
}

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function StatusIcon({ status, paymentMethod }) {
  if (status === "paid") {
    return (
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
      </span>
    );
  }
  if (status === "cash_on_delivery") {
    return (
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner text-3xl">
        {paymentMethod === "terminal" ? "💳" : "📦"}
      </span>
    );
  }
  if (status === "payment_failed") {
    return (
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-inner">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
        </svg>
      </span>
    );
  }
  return (
    <span className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-inner">
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    </span>
  );
}

function getPaymentMethodLabel(method) {
  switch (method) {
    case "click":
      return { text: "Click onlayn to‘lov", badge: "bg-blue-100 text-blue-800" };
    case "payme":
      return { text: "Payme onlayn to‘lov", badge: "bg-teal-100 text-teal-800" };
    case "cash":
      return { text: "Naqd pul (Kuryerga)", badge: "bg-emerald-100 text-emerald-800" };
    case "terminal":
      return { text: "Karta orqali kuryerga (Terminal)", badge: "bg-purple-100 text-purple-800" };
    default:
      return { text: "Onlayn to‘lov", badge: "bg-stone-100 text-stone-800" };
  }
}

function OrderStatus({ orderId, onBack, onPaid }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoPaying, setDemoPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/status`);
      const result = await readApiResponse(response);
      setOrder(result);
    } catch (requestError) {
      setError(requestError.message || "Server bilan bog‘lanib bo‘lmadi.");
    } finally {
      setChecking(false);
    }
  }, [orderId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/payment-config`);
        const config = await response.json();
        setDemoMode(config.demoMode === true);
      } catch {
        /* ignore */
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    if (order?.status === "paid" || order?.status === "payment_failed" || order?.status === "cash_on_delivery") {
      return undefined;
    }
    const intervalId = window.setInterval(checkStatus, 4000);
    return () => window.clearInterval(intervalId);
  }, [checkStatus, order?.status]);

  useEffect(() => {
    if (order?.status === "paid" || order?.status === "cash_on_delivery") {
      onPaid?.();
    }
  }, [onPaid, order?.status]);

  const copyOrderId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const demoPay = async () => {
    setDemoPaying(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/demo-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      await readApiResponse(response);
      await checkStatus();
    } catch (payError) {
      setError(payError.message || "Demo to‘lovda xatolik yuz berdi.");
    } finally {
      setDemoPaying(false);
    }
  };

  const isPaid = order?.status === "paid";
  const isCashOnDelivery = order?.status === "cash_on_delivery";
  const isFailed = order?.status === "payment_failed";
  const isPending = order && !isPaid && !isFailed && !isCashOnDelivery;
  const paymentMethodInfo = getPaymentMethodLabel(order?.paymentMethod);

  return (
    <section className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
        <div
          className={`px-6 py-10 text-center sm:px-10 sm:py-12 ${
            isPaid
              ? "bg-gradient-to-b from-emerald-50 via-emerald-50/30 to-white"
              : isCashOnDelivery
                ? "bg-gradient-to-b from-blue-50 via-blue-50/30 to-white"
                : isFailed
                  ? "bg-gradient-to-b from-rose-50 via-rose-50/30 to-white"
                  : "bg-gradient-to-b from-amber-50 via-amber-50/30 to-white"
          }`}
        >
          <StatusIcon paymentMethod={order?.paymentMethod} status={order?.status} />

          <h1 className="mt-5 text-2xl font-extrabold text-stone-950 sm:text-3xl">
            {isPaid
              ? "To‘lov muvaffaqiyatli amalga oshirildi! 🎉"
              : isCashOnDelivery
                ? "Buyurtmangiz qabul qilindi! 📦"
                : isFailed
                  ? "To‘lov yakunlanmadi"
                  : "To‘lov kutilmoqda..."}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
            {isPaid
              ? "Rahmat! Buyurtmangiz to‘liq tasdiqlandi va tez orada ko‘rsatilgan manzilga yetkazib beriladi."
              : isCashOnDelivery
                ? order?.paymentMethod === "terminal"
                  ? "Buyurtmangiz yetkazib berishga tayyorlanmoqda. To‘lov tovar topshirilganda Uzcard yoki Humo karta orqali qabul qilinadi."
                  : "Buyurtmangiz yetkazib berishga tayyorlanmoqda. To‘lovni mahsulotni qabul qilib olganda naqd pulda kuryerga berasiz."
                : isFailed
                  ? "To‘lov bekor qilindi yoki xatolik yuz berdi. Do‘konga qaytib, buyurtmani qaytadan rasmiylashtirishingiz mumkin."
                  : demoMode
                    ? "Do‘konda sinov rejimi faol. To‘lov tizimi ishlashini quyidagi tugma orqali test qilishingiz mumkin."
                    : "To‘lov tasdiqlangach, buyurtma holati ushbu sahifada avtomatik yangilanadi."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-semibold text-stone-700">
              ID: {orderId ? orderId.slice(0, 13) : "..."}...
            </span>
            <button
              className="rounded-full bg-stone-200/80 px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-300 active:scale-95"
              onClick={copyOrderId}
              type="button"
            >
              {copied ? "Nusxalandi ✓" : "Nusxa olish 📋"}
            </button>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMethodInfo.badge}`}>
              {paymentMethodInfo.text}
            </span>
          </div>
        </div>

        <div className="space-y-6 px-6 pb-8 sm:px-10">
          {order && (
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-5 text-sm">
              <h2 className="font-bold text-stone-950 text-base">Buyurtma ma’lumotlari</h2>

              {order.customer && (
                <div className="grid gap-2 border-b border-stone-200/80 pb-3.5 text-xs text-stone-600 sm:grid-cols-2">
                  <div>
                    <span className="text-stone-400 block">Qabul qiluvchi:</span>
                    <strong className="text-stone-900 font-medium">{order.customer.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Telefon raqami:</span>
                    <strong className="text-stone-900 font-medium font-mono">{order.customer.phone}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-stone-400 block">Yetkazib berish manzili:</span>
                    <span className="text-stone-800">{order.customer.city}, {order.customer.address}</span>
                  </div>
                  {order.customer.notes && (
                    <div className="sm:col-span-2 text-stone-500 italic">
                      Izoh: {order.customer.notes}
                    </div>
                  )}
                </div>
              )}

              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="border-b border-stone-200/80 pb-3.5">
                  <span className="text-stone-400 text-xs block mb-2">Buyurtma qilingan mahsulotlar:</span>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div className="flex items-center justify-between text-xs" key={item.id}>
                        <div className="flex items-center gap-2 truncate pr-2">
                          {item.image && (
                            <img
                              alt=""
                              className="h-7 w-7 rounded object-contain bg-white p-0.5 border border-stone-100"
                              onError={(e) => {
                                if (e.currentTarget.src.includes(".jpg")) {
                                  e.currentTarget.src = e.currentTarget.src.replace(/\.jpg$/, "_t.png");
                                }
                              }}
                              src={item.image}
                            />
                          )}
                          <span className="truncate text-stone-700">
                            {item.title} <span className="text-stone-400">× {item.quantity}</span>
                          </span>
                        </div>
                        <span className="font-semibold text-stone-900 shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Mahsulotlar summasi</span>
                  <span>{formatUzs(order.subtotalUzs)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Yetkazib berish xizmati</span>
                  <span>{order.deliveryFeeUzs === 0 ? "Bepul" : formatUzs(order.deliveryFeeUzs)}</span>
                </div>
                {order.createdAt && (
                  <div className="flex justify-between text-stone-400 text-[11px]">
                    <span>Sana</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline border-t border-stone-200 pt-3 text-base font-extrabold text-stone-950">
                  <span>Jami summa</span>
                  <span className="text-lg text-emerald-700">{formatUzs(order.amountUzs)}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p aria-live="assertive" className="rounded-xl bg-rose-50 p-3.5 text-center text-xs font-semibold text-rose-700">
              ⚠️ {error}
            </p>
          )}

          {isPending && demoMode && (
            <div className="rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 p-5 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <span className="text-lg">⚡</span>
              </div>
              <h3 className="text-sm font-bold text-stone-950">Sinov / Test to‘lov rejimi</h3>
              <p className="mt-1 text-xs leading-5 text-stone-600">
                Click yoki Payme merchant kalitlari kiritilmagan. To‘lov jarayonini to‘liq tekshirish uchun quyidagi tugmani bosing:
              </p>
              <button
                className="mt-4 w-full rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-400"
                disabled={demoPaying}
                onClick={demoPay}
                type="button"
              >
                {demoPaying ? "To‘lov amalga oshirilmoqda..." : "💳 To‘lovni tasdiqlash (Test)"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
            {isPending && !demoMode && (
              <button
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
                disabled={checking}
                onClick={checkStatus}
                type="button"
              >
                {checking ? "Tekshirilmoqda..." : "Holatni tekshirish"}
              </button>
            )}

            {(isPaid || isCashOnDelivery) && (
              <button
                className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                onClick={() => window.print()}
                type="button"
              >
                Chekni chop etish 🖨️
              </button>
            )}

            <button
              className="rounded-full bg-stone-950 px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-stone-800 active:scale-[0.98]"
              onClick={onBack}
              type="button"
            >
              Do‘konga qaytish
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderStatus;
