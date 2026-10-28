function CartItem({ item, onQuantityChange, onRemove }) {
  const { product, quantity } = item;

  return (
    <li className="flex gap-4 sm:gap-5 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 transition-all duration-200 hover:border-stone-300 hover:shadow-md">
      {/* Product Image */}
      <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/80 p-2.5">
        <img
          alt={product.title}
          className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.src.includes(".jpg")) {
              e.currentTarget.src = e.currentTarget.src.replace(/\.jpg$/, "_t.png");
            }
          }}
          src={product.image}
        />
      </div>

      {/* Product Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 pr-2">
            {product.category && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                {product.category}
              </span>
            )}
            <h3 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-stone-900">
              {product.title}
            </h3>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              ${product.price.toFixed(2)} <span className="font-normal text-stone-400">/ dona</span>
            </p>
          </div>

          <button
            aria-label={`${product.title} savatdan olib tashlash`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
            onClick={() => onRemove(product.id)}
            title="Olib tashlash"
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>

        {/* Stepper & Total */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <div
            aria-label="Mahsulot miqdori"
            className="flex items-center rounded-full border border-stone-300 bg-stone-50/60 p-0.5 shadow-xs"
          >
            <button
              aria-label={`${product.title} miqdorini kamaytirish`}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-xs transition hover:bg-stone-100 active:scale-95 disabled:opacity-30"
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(product.id, quantity - 1)}
              type="button"
            >
              −
            </button>
            <span className="min-w-9 text-center text-xs sm:text-sm font-black text-stone-900">
              {quantity}
            </span>
            <button
              aria-label={`${product.title} miqdorini oshirish`}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-xs transition hover:bg-stone-100 active:scale-95"
              onClick={() => onQuantityChange(product.id, quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <span className="text-stone-400 text-[11px] block">Jami:</span>
            <span className="text-base sm:text-lg font-black text-stone-950">
              ${(product.price * quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

export default CartItem;
