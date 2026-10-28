const footerLinks = [
  {
    title: "Do‘kon",
    links: [
      { label: "Barcha mahsulotlar", href: "#shop" },
      { label: "Kategoriyalar", href: "#categories" },
      { label: "Yangi kelganlar", href: "#new-arrivals" },
    ],
  },
  {
    title: "Yordam",
    links: [
      { label: "Yetkazib berish", href: "#delivery" },
      { label: "To‘lov usullari", href: "#payment" },
      { label: "Savol-javob", href: "#faq" },
    ],
  },
];

function Footer() {
  return (
    <footer className="mt-16 bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <a aria-label="Loyixa — bosh sahifa" className="inline-flex items-center gap-2.5" href="#home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-stone-950">
                L
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                loyixa<span className="text-amber-400">.</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
              Kundalik hayotingiz uchun tanlangan mahsulotlar. Sifatli xarid va qulay xizmat — bizning ustuvorligimiz.
            </p>
            <a
              className="mt-5 inline-flex text-sm text-stone-300 transition hover:text-amber-300"
              href="mailto:hello@loyixa.uz"
            >
              hello@loyixa.uz
            </a>
          </div>

          {footerLinks.map((group) => (
            <nav aria-label={group.title} key={group.title}>
              <h2 className="mb-4 text-sm font-semibold text-white">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a className="text-sm text-stone-400 transition hover:text-amber-300" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-stone-800 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} loyixa. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-5">
            <a className="transition hover:text-stone-300" href="#privacy">
              Maxfiylik siyosati
            </a>
            <a className="transition hover:text-stone-300" href="#terms">
              Foydalanish shartlari
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;