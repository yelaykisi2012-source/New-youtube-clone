import { useRef, useState } from "react";
import { useWishlist } from "../context/WishlistContext";

const links = [
  { label: "Bosh sahifa", target: "home" },
  { label: "Do'kon", target: "shop" },
  { label: "Kategoriyalar", target: "categories" },
  { label: "Biz haqimizda", target: "about" },
];

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M5 8h14l1 12H4L5 8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function Navbar({ cartCount = 0, onCartClick, onNavigate, onSearch, searchQuery = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchInputRef = useRef(null);
  const safeCartCount = Math.max(0, Number(cartCount) || 0);
  const { count: wishlistCount } = useWishlist();

  const closeMenu = () => setMenuOpen(false);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch?.(localSearch);
    closeMenu();
    searchInputRef.current?.blur();
  };

  const handleSearchInput = (event) => {
    const value = event.target.value;
    setLocalSearch(value);
    // Live search as user types
    onSearch?.(value);
  };

  const handleNavClick = (target) => {
    closeMenu();
    onNavigate?.(target);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur">
      <div className="bg-stone-950 px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        Birinchi buyurtmangizga <span className="font-semibold text-amber-300">10% chegirma</span>
        <span className="hidden sm:inline"> — </span>
        <button
          className="ml-1 underline underline-offset-2 text-amber-300 hover:text-amber-200 transition hidden sm:inline"
          onClick={() => onNavigate?.("shop")}
          type="button"
        >
          xarid qilishni hoziroq boshlang →
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          aria-label="Loyixa — bosh sahifa"
          className="flex shrink-0 items-center gap-2.5 transition hover:opacity-80"
          onClick={() => handleNavClick("home")}
          type="button"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-lg font-bold text-amber-300">
            L
          </span>
          <span className="text-xl font-bold tracking-tight text-stone-950">
            loyixa<span className="text-amber-600">.</span>
          </span>
        </button>

        <nav aria-label="Asosiy navigatsiya" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <button
              className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
              key={link.label}
              onClick={() => handleNavClick(link.target)}
              type="button"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <form
          className="hidden w-full max-w-xs items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 transition focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200 md:flex"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <SearchIcon />
          <input
            ref={searchInputRef}
            aria-label="Mahsulot qidirish"
            className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
            onChange={handleSearchInput}
            placeholder="Mahsulot qidirish..."
            type="search"
            value={localSearch}
          />
          {localSearch && (
            <button
              aria-label="Qidiruvni tozalash"
              className="shrink-0 text-stone-400 hover:text-stone-700 transition"
              onClick={() => { setLocalSearch(""); onSearch?.(""); }}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </button>
          )}
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {/* Wishlist Button */}
          <button
            aria-label={`Sevimlilar${wishlistCount ? `, ${wishlistCount} ta` : ""}`}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-rose-50 hover:text-rose-600 sm:flex"
            onClick={() => handleNavClick("wishlist")}
            type="button"
          >
            <HeartIcon />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            aria-label={`Savat${safeCartCount ? `, ${safeCartCount} ta mahsulot` : ""}`}
            className="relative flex h-10 items-center justify-center gap-2 rounded-full bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
            onClick={onCartClick}
            type="button"
          >
            <BagIcon />
            <span className="hidden sm:inline">Savat</span>
            {safeCartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-xs font-bold text-stone-950">
                {safeCartCount}
              </span>
            )}
          </button>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Menyuni yopish" : "Menyuni ochish"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-800 transition hover:bg-stone-100 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="Mobil navigatsiya" className="border-t border-stone-100 bg-white px-4 py-3 lg:hidden">
          <form
            className="mb-3 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 md:hidden"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <SearchIcon />
            <input
              aria-label="Mahsulot qidirish"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              onChange={handleSearchInput}
              placeholder="Mahsulot qidirish..."
              type="search"
              value={localSearch}
            />
          </form>
          <div className="mx-auto flex max-w-7xl flex-col">
            {links.map((link) => (
              <button
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-950"
                key={link.label}
                onClick={() => handleNavClick(link.target)}
                type="button"
              >
                {link.label}
              </button>
            ))}
            <button
              className="rounded-lg px-3 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-950 flex items-center gap-2"
              onClick={() => handleNavClick("wishlist")}
              type="button"
            >
              <span>❤️</span> Sevimlilar {wishlistCount > 0 && `(${wishlistCount})`}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
