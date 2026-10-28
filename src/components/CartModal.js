import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import CartItem from "./CartItem";

const FREE_SHIPPING_THRESHOLD = 150;

function CartModal({ isOpen, onClose, onCheckout }) {
  const { items, count, total, setQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-3 sm:p-6 md:p-8">
      {/* Backdrop */}
      <button
        aria-label="Savat oynasini yopish"
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        type="button"
      />

      {/* Large Centered Modal Dialog */}
      <section
        aria-labelledby="cart-title"
        aria-modal="true"
        className="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xl transition-all duration-300"
        role="dialog"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-stone-100 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-stone-950" id="cart-title">
              Savatingiz
            </h2>
            <span className="flex h-7 items-center justify-center rounded-full bg-stone-950 px-3 text-xs font-bold text-white shadow-xs">
              {count} ta mahsulot
            </span>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                className="text-xs font-semibold text-stone-400 transition hover:text-rose-600 active:scale-95"
                onClick={clearCart}
                type="button"
              >
                Barchasini o‘chirish
              </button>
            )}
            <button
              aria-label="Savatni yopish"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-900 active:scale-90"
              onClick={onClose}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.2"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Free Shipping Banner */}
        {items.length > 0 && (
          <div className="border-b border-stone-100 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-stone-50 px-6 py-3.5 sm:px-8">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700">
              <span className="flex items-center gap-2">
                <span>🚚</span>
                {remainingForFreeShipping > 0 ? (
                  <>
                    Bepul yetkazib berish uchun yana{" "}
                    <strong className="font-extrabold text-stone-950">
                      ${remainingForFreeShipping.toFixed(2)}
                    </strong>{" "}
                    lik xarid qiling!
                  </>
                ) : (
                  <span className="font-bold text-emerald-700">
                    🎉 Bepul yetkazib berish imkoniyatiga ega bo‘ldingiz!
                  </span>
                )}
              </span>
              <span className="font-bold text-stone-500">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  progressPercent >= 100
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-amber-500 to-orange-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Body Content */}
        {items.length > 0 ? (
          <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
            {/* Products List (Left Column) */}
            <div className="flex flex-col overflow-hidden">
              <ul className="flex-1 space-y-3.5 overflow-y-auto p-5 sm:p-7 max-h-[55vh]">
                {items.map((item) => (
                  <CartItem
                    item={item}
                    key={item.product.id}
                    onQuantityChange={setQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </ul>
            </div>

            {/* Order Summary (Right Column) */}
            <aside className="flex flex-col justify-between border-t border-stone-200/80 bg-stone-50/70 p-6 sm:p-7 lg:border-t-0 lg:border-l">
              <div>
                <h3 className="text-base font-extrabold text-stone-950 mb-4 pb-3 border-b border-stone-200/60">
                  Buyurtma xulosasi
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Mahsulotlar summasi</span>
                    <span className="font-semibold text-stone-900">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Yetkazib berish</span>
                    <span className="font-semibold text-stone-900">
                      {total >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="font-bold text-emerald-600">Bepul</span>
                      ) : (
                        <span>Buyurtmada hisoblanadi</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-stone-200/80 pt-3 text-stone-950">
                    <span className="text-base font-bold text-stone-900">Jami to‘lov:</span>
                    <span className="text-2xl font-black text-stone-950">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 pt-3 border-t border-stone-200/60">
                <button
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-stone-950 py-4 text-sm font-bold text-white shadow-xl shadow-stone-900/15 transition hover:bg-stone-800 active:scale-[0.98]"
                  onClick={onCheckout}
                  type="button"
                >
                  <span>Yetkazib berish va to‘lov</span>
                  <span className="text-lg">→</span>
                </button>

                <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-medium text-stone-400">
                  <span className="flex items-center gap-1">
                    <span>🔒</span> Xavfsiz to‘lov
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>🚚</span> Tezkor kuryer
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>↩️</span> Kafolat
                  </span>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Large, Luxurious Empty Cart State */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* Visual 3D Icon */}
            <div className="relative mb-7">
              <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-100 via-orange-50 to-amber-200/90 shadow-2xl shadow-amber-500/20">
                <svg
                  className="h-20 w-20 text-amber-600 transition-transform duration-300 hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg text-xl">
                ✨
              </span>
            </div>

            <h3 className="text-2xl font-black text-stone-950 sm:text-3xl">
              Savatingiz hozircha bo‘sh
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-6 text-stone-500">
              Siz hali birorta ham mahsulot tanlamadingiz. Bizning yangi kolleksiyamizni ko‘rib chiqing va yoqqanlarini savatga qo‘shing!
            </p>

            {/* Feature Pills */}
            <div className="my-8 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 px-4 py-1.5 text-xs font-semibold text-stone-700">
                <span>🚚</span> Bepul yetkazib berish
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 px-4 py-1.5 text-xs font-semibold text-stone-700">
                <span>⭐</span> 100% original tovarlar
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 px-4 py-1.5 text-xs font-semibold text-stone-700">
                <span>💳</span> 4 xil to‘lov usullari
              </span>
            </div>

            <button
              className="inline-flex items-center gap-2.5 rounded-full bg-stone-950 px-10 py-4 text-base font-bold text-white shadow-xl shadow-stone-900/20 transition hover:bg-stone-800 hover:shadow-2xl active:scale-[0.98]"
              onClick={onClose}
              type="button"
            >
              <span>🛍️</span>
              <span>Xaridni boshlash (Katalogga o‘tish)</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default CartModal;
