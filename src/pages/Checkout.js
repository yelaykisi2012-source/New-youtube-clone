import { useEffect, useState } from "react";
import { readApiResponse } from "../utils/api";
import { ClickLogo, PaymeLogo, CashIcon, TerminalIcon } from "../components/PaymentIcons";

const apiBaseUrl = process.env.REACT_APP_API_URL || "";

function formatUzs(value) {
  return `${Number(value).toLocaleString("uz-UZ")} so‘m`;
}

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, "");
  let raw = digits;
  if (raw.startsWith("998")) {
    raw = raw.slice(3);
  }
  raw = raw.slice(0, 9);

  if (raw.length === 0) return "+998 ";
  if (raw.length <= 2) return `+998 ${raw}`;
  if (raw.length <= 5) return `+998 ${raw.slice(0, 2)} ${raw.slice(2)}`;
  if (raw.length <= 7) return `+998 ${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5)}`;
  return `+998 ${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5, 7)} ${raw.slice(7, 9)}`;
}

const PAYMENT_METHODS = [
  {
    id: "click",
    name: "Click",
    subtitle: "Click Upay va Click Evolution ilovasi orqali xavfsiz onlayn to‘lov",
    badge: "⚡ Onlayn to‘lov",
    badgeColor: "bg-blue-100 text-blue-800 border border-blue-200",
    activeClass: "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md",
    icon: <ClickLogo className="h-12 w-12" />,
  },
  {
    id: "payme",
    name: "Payme",
    subtitle: "Payme orqali istalgan Uzcard yoki Humo kartasidan tezkor to‘lov",
    badge: "💳 Uzcard / Humo",
    badgeColor: "bg-teal-100 text-teal-800 border border-teal-200",
    activeClass: "border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-md",
    icon: <PaymeLogo className="h-12 w-12" />,
  },
  {
    id: "cash",
    name: "Naqd pul",
    subtitle: "Buyurtma yetkazib berilganda eshik oldida kuryerga to‘lash",
    badge: "💵 Qulay usul",
    badgeColor: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    activeClass: "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md",
    icon: <CashIcon className="h-12 w-12" />,
  },
  {
    id: "terminal",
    name: "Kuryerga karta (Terminal)",
    subtitle: "Kuryer yetkazganda Uzcard yoki Humo kartasi bilan to‘lov",
    badge: "📲 POS Terminal",
    badgeColor: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    activeClass: "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-md",
    icon: <TerminalIcon className="h-12 w-12" />,
  },
];

function Checkout({ items, onBack, onOrderCreated }) {
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "+998 ",
    city: "",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("click");
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/payment-config`);
        const config = await response.json();
        setPaymentConfig(config);
      } catch {
        // Fallback default
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const quoteItems = items.map(({ product, quantity }) => ({
      id: product.id,
      quantity,
    }));

    async function loadQuote() {
      setQuote(null);
      setQuoteError("");
      try {
        const response = await fetch(`${apiBaseUrl}/api/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: quoteItems }),
          signal: controller.signal,
        });
        const result = await readApiResponse(response);
        setQuote(result);
      } catch (error) {
        if (error.name !== "AbortError") {
          setQuoteError(error.message || "Server bilan bog‘lanib bo‘lmadi.");
        }
      }
    }

    loadQuote();
    return () => controller.abort();
  }, [items]);

  const updateCustomer = (event) => {
    const { name, value } = event.target;
    if (name === "phone") {
      setCustomer((current) => ({ ...current, phone: formatPhoneNumber(value) }));
    } else {
      setCustomer((current) => ({ ...current, [name]: value }));
    }
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({ id: product.id, quantity })),
          customer,
          paymentMethod,
        }),
      });
      const result = await readApiResponse(response);

      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
      } else if (result.orderId) {
        onOrderCreated(result.orderId);
      } else {
        throw new Error("Buyurtma natijasi olinmadi. Qayta urinib ko‘ring.");
      }
    } catch (error) {
      setSubmitError(error.message || "Server bilan bog‘lanib bo‘lmadi.");
      setSubmitting(false);
    }
  };

  const getButtonText = () => {
    if (submitting) return "Buyurtma rasmiylashtirilmoqda...";
    if (paymentMethod === "click") {
      return paymentConfig?.clickEnabled
        ? "Click orqali to‘lash"
        : "Click orqali to‘lash (Test rejimi)";
    }
    if (paymentMethod === "payme") {
      return paymentConfig?.paymeEnabled
        ? "Payme orqali to‘lash"
        : "Payme orqali to‘lash (Test rejimi)";
    }
    if (paymentMethod === "cash") {
      return "Buyurtmani tasdiqlash (Naqd pul)";
    }
    if (paymentMethod === "terminal") {
      return "Buyurtmani tasdiqlash (Kuryerga karta)";
    }
    return "Buyurtmani tasdiqlash";
  };

  return (
    <section className="mx-auto max-w-5xl">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-950"
        onClick={onBack}
        type="button"
      >
        <span>←</span>
        <span>Savatga qaytish</span>
      </button>

      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-stone-500">Buyurtmani rasmiylashtirish</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-950">Yetkazib berish va To‘lov</h1>
      </div>

      <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]" onSubmit={submitOrder}>
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-stone-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">1</span>
              <span>Qabul qiluvchi ma’lumotlari</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Ism-familiya <span className="text-red-500">*</span>
                </span>
                <input
                  autoComplete="name"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-950/10"
                  maxLength="100"
                  name="fullName"
                  onChange={updateCustomer}
                  placeholder="Ali Valiyev"
                  required
                  value={customer.fullName}
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Telefon raqami <span className="text-red-500">*</span>
                </span>
                <input
                  autoComplete="tel"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-950/10 font-mono"
                  maxLength="20"
                  name="phone"
                  onChange={updateCustomer}
                  placeholder="+998 90 123 45 67"
                  required
                  type="tel"
                  value={customer.phone}
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Shahar yoki viloyat <span className="text-red-500">*</span>
                </span>
                <input
                  autoComplete="address-level2"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-950/10"
                  maxLength="100"
                  name="city"
                  onChange={updateCustomer}
                  placeholder="Toshkent shahri"
                  required
                  value={customer.city}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Aniq manzil <span className="text-red-500">*</span>
                </span>
                <textarea
                  autoComplete="street-address"
                  className="min-h-24 w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-950/10"
                  maxLength="300"
                  name="address"
                  onChange={updateCustomer}
                  placeholder="Tuman, mahalla, ko‘cha nomi, uy va xonadon raqami"
                  required
                  value={customer.address}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Kuryer uchun izoh <span className="font-normal text-stone-400">(ixtiyoriy)</span>
                </span>
                <textarea
                  className="min-h-20 w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-950/10"
                  maxLength="500"
                  name="notes"
                  onChange={updateCustomer}
                  placeholder="Mo‘ljal yoki yetkazib berish vaqti bo‘yicha qo‘shimcha eslatma"
                  value={customer.notes}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-950">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">2</span>
                <span>To‘lov usulini tanlang</span>
              </h2>
              {paymentConfig?.demoMode && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  ⚡ Sinov rejimi faol
                </span>
              )}
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <label
                    className={`relative flex cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-4 transition-all duration-200 ${
                      isSelected
                        ? method.activeClass
                        : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60"
                    }`}
                    key={method.id}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      name="paymentMethod"
                      onChange={() => setPaymentMethod(method.id)}
                      type="radio"
                      value={method.id}
                    />
                    {method.icon}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-stone-950 text-sm">{method.name}</span>
                        <span className={`whitespace-nowrap shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${method.badgeColor}`}>
                          {method.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-snug text-stone-500">
                        {method.subtitle}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isSelected
                          ? "border-stone-900 bg-stone-900"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-stone-50 px-4 py-3 text-xs text-stone-500">
              <span className="text-base">🔒</span>
              <span><strong className="text-stone-700">Xavfsiz to‘lov:</strong> Barcha to‘lovlar va buyurtma ma’lumotlari to‘liq himoyalangan.</span>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold text-stone-950">Buyurtma tafsilotlari</h2>
          <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto border-b border-stone-100 pb-4">
            {items.map(({ product, quantity }) => (
              <li className="flex items-center justify-between gap-3 text-sm" key={product.id}>
                <div className="flex items-center gap-2.5 min-w-0">
                  {product.image && (
                    <img
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white p-1 border border-stone-100"
                      onError={(e) => {
                        if (e.currentTarget.src.includes(".jpg")) {
                          e.currentTarget.src = e.currentTarget.src.replace(/\.jpg$/, "_t.png");
                        }
                      }}
                      src={product.image}
                    />
                  )}
                  <span className="truncate text-stone-700 text-xs font-medium">
                    {product.title} <span className="text-stone-400">× {quantity}</span>
                  </span>
                </div>
                <span className="shrink-0 font-semibold text-stone-900 text-xs">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {quote ? (
            <>
              <div className="space-y-2.5 py-4 text-sm">
                <div className="flex justify-between gap-3 text-stone-500">
                  <span>Mahsulotlar summasi</span>
                  <span className="font-medium text-stone-800">{formatUzs(quote.subtotalUzs)}</span>
                </div>
                <div className="flex justify-between gap-3 text-stone-500">
                  <span>Yetkazib berish</span>
                  <span className="font-medium text-stone-800">
                    {quote.deliveryFeeUzs === 0 ? (
                      <span className="font-bold text-emerald-600">Bepul</span>
                    ) : (
                      formatUzs(quote.deliveryFeeUzs)
                    )}
                  </span>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-xs text-stone-500">
                  Valyuta kursi: 1 USD = {Number(quote.usdUzsRate).toLocaleString("uz-UZ")} so‘m (Markaziy bank)
                </div>
              </div>
              <div className="flex items-baseline justify-between border-t border-stone-100 pt-4 text-stone-950">
                <span className="text-sm font-semibold text-stone-600">Jami to‘lov:</span>
                <span className="text-xl font-extrabold text-stone-950">{formatUzs(quote.totalUzs)}</span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-sm text-stone-500">
              {quoteError ? (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
                  <p className="font-semibold">{quoteError}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
                  <span>Narx hisoblanmoqda...</span>
                </div>
              )}
            </div>
          )}

          {submitError && (
            <p aria-live="assertive" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
              ⚠️ {submitError}
            </p>
          )}

          <button
            className="mt-5 w-full rounded-full bg-stone-950 px-5 py-4 text-sm font-bold text-white shadow-md transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
            disabled={!quote || Boolean(quoteError) || submitting || items.length === 0}
            type="submit"
          >
            {getButtonText()}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-stone-400">
            {paymentMethod === "cash" || paymentMethod === "terminal"
              ? "Buyurtmani tasdiqlaganingizdan so‘ng xarid yakunlanadi."
              : "To‘lov tasdiqlangandan so‘ng buyurtma yetkazib berishga yuboriladi."}
          </p>
        </aside>
      </form>
    </section>
  );
}

export default Checkout;