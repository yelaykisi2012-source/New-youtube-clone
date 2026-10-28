import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import sampleProducts from "../data/products.json";

function ProductList({
  products,
  category = "all",
  maxPrice = 1000,
  searchQuery = "",
  onAddToCart,
  onProductClick,
}) {
  const [items, setItems] = useState(products || sampleProducts);

  useEffect(() => {
    if (products) {
      setItems(products);
      return;
    }
    fetch("https://fakestoreapi.com/products")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        // Keeps local sampleProducts
      });
  }, [products]);

  const filteredProducts = items.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesPrice = product.price <= maxPrice;
    const matchesSearch = !searchQuery.trim() ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <section aria-label="Mahsulotlar" className="min-w-0 flex-1">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          {searchQuery.trim() ? (
            <>
              <p className="mb-1 text-sm font-medium text-stone-500">Qidiruv natijalari</p>
              <h1 className="text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
                "{searchQuery}" <span className="text-stone-400 text-lg font-normal">bo'yicha</span>
              </h1>
            </>
          ) : (
            <>
              <p className="mb-1 text-sm font-medium text-stone-500">Bizning tanlov</p>
              <h1 className="text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
                Mahsulotlar
              </h1>
            </>
          )}
        </div>
        <p aria-live="polite" className="text-sm text-stone-500">
          {filteredProducts.length} ta mahsulot
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-2xl">🔍</span>
          <p className="text-base font-semibold text-stone-800">
            {searchQuery ? `"${searchQuery}" bo'yicha hech narsa topilmadi` : "Mahsulot topilmadi"}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {searchQuery
              ? "Boshqa kalit so'z bilan qidirib ko'ring yoki filtrlarni tozalang."
              : "Filtrlarni o'zgartirib qayta urinib ko'ring."
            }
          </p>
        </div>
      )}
    </section>
  );
}

export default ProductList;
