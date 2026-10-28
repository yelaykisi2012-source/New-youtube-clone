import { useState, useMemo } from "react";
import { useWishlist } from "../context/WishlistContext";
import sampleProducts from "../data/products.json";

function ProductDetail({ productId, onBack, onAddToCart, onProductClick }) {
  const product = useMemo(
    () => sampleProducts.find((p) => p.id === productId),
    [productId]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl py-16 text-center">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-3xl">😕</span>
        <h1 className="text-2xl font-bold text-stone-950">Mahsulot topilmadi</h1>
        <p className="mt-2 text-stone-500">Ushbu mahsulot mavjud emas yoki o'chirilgan.</p>
        <button
          className="mt-6 rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white hover:bg-stone-800 transition"
          onClick={onBack}
          type="button"
        >
          ← Do'konga qaytish
        </button>
      </section>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart?.(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Related products from same category
  const relatedProducts = sampleProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const starsFull = Math.floor(product.rating.rate);
  const starsEmpty = 5 - Math.ceil(product.rating.rate);
  const starsHalf = 5 - starsFull - starsEmpty;

  return (
    <section className="mx-auto max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
        <button className="hover:text-stone-900 transition" onClick={onBack} type="button">Do'kon</button>
        <span>/</span>
        <span className="capitalize text-stone-400">{product.category}</span>
        <span>/</span>
        <span className="text-stone-700 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 sm:p-12">
          <button
            aria-label={wishlisted ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
            className={`absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 ${
              wishlisted
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-white text-stone-400 hover:text-rose-500 border border-stone-200"
            }`}
            onClick={() => toggleWishlist(product.id)}
            type="button"
          >
            <svg className="h-5 w-5" fill={wishlisted ? "currentColor" : "none"} viewBox="0 0 24 24">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          <img
            alt={product.title}
            className="mx-auto h-72 w-72 object-contain sm:h-96 sm:w-96 transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              if (e.currentTarget.src.includes(".jpg")) {
                e.currentTarget.src = e.currentTarget.src.replace(/\.jpg$/, "_t.png");
              }
            }}
            src={product.image}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize text-stone-600">
            {product.category}
          </span>
          <h1 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-0.5 text-amber-500 text-lg">
              {"★".repeat(starsFull)}
              {starsHalf > 0 && "★"}
              {"☆".repeat(starsEmpty)}
            </div>
            <span className="text-sm font-bold text-stone-800">{product.rating.rate}</span>
            <span className="text-sm text-stone-400">({product.rating.count} ta baho)</span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-black text-stone-950">${product.price.toFixed(2)}</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              Mavjud ✓
            </span>
          </div>

          {/* Quantity + Add to cart */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              aria-label="Miqdor tanlash"
              className="flex items-center rounded-full border border-stone-300 bg-stone-50/60 p-1"
            >
              <button
                aria-label="Miqdorni kamaytirish"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-xs transition hover:bg-stone-100 active:scale-95 disabled:opacity-30"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                type="button"
              >
                −
              </button>
              <span className="min-w-10 text-center font-bold text-stone-900">{quantity}</span>
              <button
                aria-label="Miqdorni oshirish"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-xs transition hover:bg-stone-100 active:scale-95"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                type="button"
              >
                +
              </button>
            </div>

            <button
              className={`flex-1 rounded-full px-8 py-4 text-sm font-bold shadow-xl transition active:scale-[0.97] ${
                addedToCart
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-stone-950 text-white shadow-stone-900/20 hover:bg-stone-800"
              }`}
              onClick={handleAddToCart}
              type="button"
            >
              {addedToCart ? `✓ ${quantity} ta savatga qo'shildi!` : `🛒 Savatga qo'shish — $${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: "🚚", label: "Bepul yetkazib berish" },
              { icon: "↩️", label: "30 kunlik kafolat" },
              { icon: "🔒", label: "Xavfsiz to'lov" },
              { icon: "⭐", label: "100% original" },
            ].map((benefit) => (
              <div
                className="flex items-center gap-2.5 rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2.5 text-xs font-medium text-stone-600"
                key={benefit.label}
              >
                <span>{benefit.icon}</span>
                <span>{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-stone-200">
          {[
            { key: "description", label: "Tavsif" },
            { key: "reviews", label: `Baholar (${product.rating.count})` },
          ].map((tab) => (
            <button
              className={`px-6 py-3 text-sm font-semibold transition border-b-2 ${
                activeTab === tab.key
                  ? "border-stone-950 text-stone-950"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-b-2xl border border-t-0 border-stone-200 bg-white p-6 sm:p-8">
          {activeTab === "description" ? (
            <div className="prose prose-stone max-w-none text-sm leading-7 text-stone-600">
              <p>{product.description}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-4xl font-black text-stone-950">{product.rating.rate}</span>
                  <div className="mt-1 text-amber-500 text-lg">
                    {"★".repeat(starsFull)}{"☆".repeat(5 - starsFull)}
                  </div>
                  <p className="mt-1 text-xs text-stone-400">{product.rating.count} ta baho</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    // Simulated distribution based on rating
                    const percent = star === Math.round(product.rating.rate)
                      ? 45
                      : star === Math.round(product.rating.rate) - 1 || star === Math.round(product.rating.rate) + 1
                        ? 25
                        : Math.max(3, 15 - Math.abs(star - product.rating.rate) * 8);
                    return (
                      <div className="flex items-center gap-2 text-xs" key={star}>
                        <span className="w-3 text-stone-500">{star}</span>
                        <span className="text-amber-500">★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-stone-400">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="rounded-xl bg-stone-50 p-4 text-center text-sm text-stone-500">
                Baholar FakeStore API dan olingan. Haqiqiy foydalanuvchi sharhlari tez orada qo'shiladi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 text-xl font-bold text-stone-950">Shunga o'xshash mahsulotlar</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relProduct) => (
              <button
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left transition hover:-translate-y-1 hover:shadow-lg"
                key={relProduct.id}
                onClick={() => {
                  onProductClick?.(relProduct.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                type="button"
              >
                <div className="flex aspect-square items-center justify-center bg-stone-50 p-4">
                  <img
                    alt={relProduct.title}
                    className="h-full w-full object-contain transition group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src.includes(".jpg")) {
                        e.currentTarget.src = e.currentTarget.src.replace(/\.jpg$/, "_t.png");
                      }
                    }}
                    src={relProduct.image}
                  />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-xs font-semibold text-stone-800">{relProduct.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-stone-950">${relProduct.price.toFixed(2)}</span>
                    <span className="text-xs text-amber-500">★ {relProduct.rating.rate}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetail;
