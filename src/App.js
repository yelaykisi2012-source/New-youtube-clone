import { useCallback, useEffect, useState } from "react";
import CartModal from "./components/CartModal";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Sidebar from "./components/Sidebar";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import { CartProvider, useCart } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

function StoreApp() {
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [orderId, setOrderId] = useState(
    () => new URLSearchParams(window.location.search).get("orderId"),
  );
  const { items, count, addItem, clearCart } = useCart();
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCheckout = useCallback(() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);
  const returnToStore = useCallback(() => {
    window.history.replaceState({}, "", window.location.pathname);
    setOrderId(null);
    setCheckoutOpen(false);
    setPage("home");
  }, []);
  const handlePaymentSuccess = useCallback(() => clearCart(), [clearCart]);
  const handleOrderCreated = useCallback((newOrderId) => {
    setCheckoutOpen(false);
    setOrderId(newOrderId);
    window.history.replaceState({}, "", `?orderId=${newOrderId}`);
  }, []);

  const navigateTo = useCallback((target) => {
    setSelectedProductId(null);
    setCheckoutOpen(false);
    setOrderId(null);
    window.history.replaceState({}, "", window.location.pathname);

    if (target === "home") {
      setPage("home");
      setCategory("all");
      setSearchQuery("");
    } else if (target === "shop") {
      setPage("shop");
      setCategory("all");
    } else if (target === "categories") {
      setPage("shop");
      // scroll to sidebar
      setTimeout(() => {
        document.getElementById("sidebar-categories")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (target === "about") {
      setPage("about");
    } else {
      setPage(target);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setPage("shop");
      setSelectedProductId(null);
    }
  }, []);

  const handleProductClick = useCallback((productId) => {
    setSelectedProductId(productId);
    setPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCategoryClick = useCallback((cat) => {
    setCategory(cat);
    setPage("shop");
    setSelectedProductId(null);
    setSearchQuery("");
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const oid = params.get("orderId");
      if (oid) {
        setOrderId(oid);
      } else {
        setOrderId(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const renderContent = () => {
    if (orderId) {
      return (
        <OrderStatus orderId={orderId} onBack={returnToStore} onPaid={handlePaymentSuccess} />
      );
    }
    if (checkoutOpen) {
      return (
        <Checkout items={items} onBack={() => setCheckoutOpen(false)} onOrderCreated={handleOrderCreated} />
      );
    }
    if (page === "product" && selectedProductId) {
      return (
        <ProductDetail
          productId={selectedProductId}
          onBack={() => { setPage("shop"); setSelectedProductId(null); }}
          onAddToCart={addItem}
          onProductClick={handleProductClick}
        />
      );
    }
    if (page === "about") {
      return <AboutPage onNavigate={navigateTo} />;
    }

    // home or shop — show products
    return (
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Sidebar
          onCategoryChange={(cat) => { setCategory(cat); setSearchQuery(""); }}
          onPriceChange={setMaxPrice}
        />
        <ProductList
          category={category}
          maxPrice={maxPrice}
          searchQuery={searchQuery}
          onAddToCart={addItem}
          onProductClick={handleProductClick}
        />
      </div>
    );
  };

  return (
    <>
      <Navbar
        cartCount={count}
        onCartClick={() => setCartOpen(true)}
        onNavigate={navigateTo}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      {page === "home" && !orderId && !checkoutOpen && (
        <HeroBanner onNavigate={navigateTo} />
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      <Footer onNavigate={navigateTo} />
      <CartModal isOpen={cartOpen} onClose={closeCart} onCheckout={openCheckout} onProductClick={handleProductClick} />
    </>
  );
}

/* ─── Hero Banner (Home page only) ─── */
function HeroBanner({ onNavigate }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-600 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24 lg:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur">
          ✨ 2026 yilgi yangi kolleksiya yetib keldi
        </span>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Sifatli mahsulotlar —{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            eng yaxshi narxlarda
          </span>
        </h1>
        <p className="max-w-xl text-base leading-7 text-stone-400 sm:text-lg">
          Elektronika, kiyim-kechak, zargarlik buyumlari va boshqa ko'plab mahsulotlarni toping. 
          Bepul yetkazib berish, xavfsiz to'lov va tezkor xizmat.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            className="inline-flex items-center gap-2.5 rounded-full bg-amber-400 px-8 py-4 text-sm font-bold text-stone-950 shadow-xl shadow-amber-500/25 transition hover:bg-amber-300 hover:shadow-2xl active:scale-[0.97]"
            onClick={() => onNavigate("shop")}
            type="button"
          >
            🛍️ Xarid qilishni boshlash
            <span className="text-lg">→</span>
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-stone-600 px-7 py-4 text-sm font-semibold text-stone-300 transition hover:border-stone-400 hover:text-white active:scale-[0.97]"
            onClick={() => onNavigate("categories")}
            type="button"
          >
            Kategoriyalarni ko'rish
          </button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500">
          <span className="flex items-center gap-2">
            <span className="text-lg">🚚</span> Bepul yetkazib berish
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">🔒</span> Xavfsiz to'lov
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">↩️</span> 30 kunlik kafolat
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">⭐</span> 100% original
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── About Page ─── */
function AboutPage({ onNavigate }) {
  return (
    <section className="mx-auto max-w-3xl">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-950"
        onClick={() => onNavigate("home")}
        type="button"
      >
        <span>←</span>
        <span>Bosh sahifaga</span>
      </button>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 px-8 py-14 text-center sm:px-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-4xl font-black text-amber-400">L</span>
          </div>
          <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl">
            loyixa<span className="text-amber-400">.</span> haqida
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-400">
            Sifatli va original mahsulotlarni O'zbekiston bo'ylab tez va qulay yetkazib berish xizmati.
          </p>
        </div>

        <div className="space-y-8 px-8 py-10 sm:px-12">
          <div>
            <h2 className="text-lg font-bold text-stone-950">Biz kim bo'lamiz?</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Loyixa — bu zamonaviy onlayn do'kon platformasi bo'lib, foydalanuvchilarga 
              eng sifatli mahsulotlarni qulay narxlarda taqdim etadi. Bizning maqsadimiz — 
              xarid jarayonini iloji boricha oson va yoqimli qilish.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "🚚", title: "Tez yetkazib berish", desc: "Toshkent bo'ylab 1-2 kun ichida, viloyatlarga 2-5 kun" },
              { icon: "🔒", title: "Xavfsiz to'lov", desc: "Click, Payme, naqd pul va terminal orqali to'lov" },
              { icon: "↩️", title: "30 kunlik kafolat", desc: "Mahsulot yoqmasa, 30 kun ichida qaytarish imkoniyati" },
            ].map((item) => (
              <div
                className="rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-center"
                key={item.title}
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-2 text-sm font-bold text-stone-900">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold text-stone-950">Bog'lanish</h2>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              <p>📧 Email: <a className="font-medium text-stone-900 hover:text-amber-600 transition" href="mailto:hello@loyixa.uz">hello@loyixa.uz</a></p>
              <p>📞 Telefon: <a className="font-medium text-stone-900 hover:text-amber-600 transition" href="tel:+998901234567">+998 90 123 45 67</a></p>
              <p>📍 Manzil: Toshkent shahri, Chilonzor tumani</p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-6 text-center">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-stone-800 active:scale-[0.97]"
              onClick={() => onNavigate("shop")}
              type="button"
            >
              🛍️ Do'konga o'tish
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <StoreApp />
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;