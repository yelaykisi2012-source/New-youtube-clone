import { useState } from "react";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ product, onAddToCart, onProductClick }) {
  const { title, price, category, image, rating, id } = product;
  const [addedToCart, setAddedToCart] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(id);

  const handleAddToCart = (event) => {
    event.stopPropagation();
    onAddToCart?.(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleWishlist = (event) => {
    event.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl"
      onClick={() => onProductClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onProductClick?.(id); }}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-stone-50 p-6">
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize text-stone-600 shadow-sm">
          {category}
        </span>

        {/* Wishlist button */}
        <button
          aria-label={wishlisted ? `${title} sevimlilardan olib tashlash` : `${title} sevimlilarga qo'shish`}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 active:scale-90 ${
            wishlisted
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-white/90 text-stone-400 hover:bg-white hover:text-rose-500"
          }`}
          onClick={handleWishlist}
          type="button"
        >
          <svg className="h-4.5 w-4.5" fill={wishlisted ? "currentColor" : "none"} viewBox="0 0 24 24">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        <img
          alt={title}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src.includes(".jpg")) {
              e.currentTarget.src = e.currentTarget.src.replace(/\.jpg$/, "_t.png");
            }
          }}
          src={image}
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-1.5 text-sm">
          <span aria-label={`${rating.rate} out of 5 stars`} className="text-amber-500">
            {"★".repeat(Math.round(rating.rate))}{"☆".repeat(5 - Math.round(rating.rate))}
          </span>
          <span className="font-semibold text-stone-800">{rating.rate}</span>
          <span className="text-stone-400">({rating.count})</span>
        </div>

        <h2 className="mb-4 line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-stone-900 sm:text-base">
          {title}
        </h2>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <span className="text-lg font-bold text-stone-950">${price.toFixed(2)}</span>
          <button
            aria-label={addedToCart ? "Savatga qo'shildi" : `${title} mahsulotini savatga qo'shish`}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 ${
              addedToCart
                ? "bg-emerald-500 text-white"
                : "bg-stone-950 text-white hover:bg-amber-500 hover:text-stone-950"
            }`}
            onClick={handleAddToCart}
            type="button"
          >
            {addedToCart ? "✓ Qo'shildi" : "Savatga"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
