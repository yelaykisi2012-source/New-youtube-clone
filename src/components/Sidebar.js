import { useState } from "react";

const categories = [
  { label: "Barchasi", value: "all" },
  { label: "Erkaklar kiyimi", value: "men's clothing" },
  { label: "Ayollar kiyimi", value: "women's clothing" },
  { label: "Zargarlik buyumlari", value: "jewelery" },
  { label: "Elektronika", value: "electronics" },
];

const maximumPrice = 1000;

function Sidebar({ onCategoryChange, onPriceChange }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceLimit, setPriceLimit] = useState(maximumPrice);

  const selectCategory = (value) => {
    setSelectedCategory(value);
    onCategoryChange?.(value);
  };

  const changePrice = (event) => {
    const nextPrice = Number(event.target.value);
    setPriceLimit(nextPrice);
    onPriceChange?.(nextPrice);
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceLimit(maximumPrice);
    onCategoryChange?.("all");
    onPriceChange?.(maximumPrice);
  };

  return (
    <aside
      aria-label="Mahsulot filtrlari"
      className="h-fit w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28 lg:w-72"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-950">Filtrlar</h2>
        <button
          className="text-sm font-medium text-stone-500 transition hover:text-stone-950"
          onClick={resetFilters}
          type="button"
        >
          Tozalash
        </button>
      </div>

      <section aria-labelledby="sidebar-categories" className="border-b border-stone-100 pb-6">
        <h3 className="mb-3 text-sm font-semibold text-stone-900" id="sidebar-categories">
          Kategoriyalar
        </h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value;

            return (
              <button
                aria-pressed={isSelected}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-stone-950 font-semibold text-white"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                }`}
                key={category.value}
                onClick={() => selectCategory(category.value)}
                type="button"
              >
                <span>{category.label}</span>
                {isSelected && (
                  <span aria-hidden="true" className="text-amber-300">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sidebar-price" className="border-b border-stone-100 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900" id="sidebar-price">
            Narx chegarasi
          </h3>
          <span className="text-xs font-medium text-stone-500">USD</span>
        </div>
        <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="price-limit">
          ${priceLimit.toLocaleString("en-US")} gacha
        </label>
        <input
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-950"
          id="price-limit"
          max={maximumPrice}
          min="0"
          onChange={changePrice}
          step="10"
          type="range"
          value={priceLimit}
        />
        <div className="mt-2 flex justify-between text-xs text-stone-400">
          <span>$0</span>
          <span>$1,000</span>
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
