import React, { useRef, useState } from 'react';

function Icon({ name, size = 24 }) {
  const paths = {
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    microphone: (
      <>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" />
      </>
    ),
    create: (
      <>
        <path d="M14 5h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
        <path d="M12 2v10m-4-4 4 4 4-4" />
      </>
    ),
    bell: (
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0" />
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openPanel, setOpenPanel] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef(null);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      onSearch(query);
      setSearchOpen(false);
    }
  };

  const handleSearchButtonClick = () => {
    if (!searchQuery.trim()) {
      setSearchOpen((isOpen) => !isOpen);
      window.setTimeout(() => searchInput.current?.focus(), 0);
    }
  };

  const togglePanel = (panel) => {
    setOpenPanel((currentPanel) => (currentPanel === panel ? '' : panel));
  };

  return (
    <header className="site-header">
      <div className="header-left">
        <button
          aria-label={openPanel === 'navigation' ? 'Menyuni yopish' : 'Menyuni ochish'}
          aria-expanded={openPanel === 'navigation'}
          className="icon-button menu-button"
          onClick={() => togglePanel('navigation')}
          type="button"
        >
          <Icon name={openPanel === 'navigation' ? 'close' : 'menu'} />
        </button>
        <a aria-label="YouTube bosh sahifasi" className="brand" href="/">
          <span className="brand-mark">
            <svg aria-hidden="true" viewBox="0 0 28 20">
              <path d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5C28 14.7 28 10 28 10s0-4.7-.6-6.9Z" />
              <path className="brand-play" d="m11 14.3 7.3-4.3L11 5.7v8.6Z" />
            </svg>
          </span>
          <span className="brand-name">YouTube</span>
          <span className="brand-region">UZ</span>
        </a>
      </div>

      <div className={`header-search-area${searchOpen ? ' search-area-expanded' : ''}`}>
        <form className="search-form" onSubmit={handleSearch} role="search">
          <label className="search-input-wrap">
            <span className="visually-hidden">YouTube’dan qidirish</span>
            <input
              autoComplete="off"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Qidirish"
              ref={searchInput}
              type="search"
              value={searchQuery}
            />
          </label>
          <button
            aria-label={searchOpen ? 'Qidiruvni yopish' : 'Qidirish'}
            className="search-button"
            onClick={handleSearchButtonClick}
            type="submit"
          >
            <Icon name={searchOpen ? 'close' : 'search'} size={21} />
          </button>
        </form>
        <button
          aria-label="Ovoz bilan qidirish"
          className="icon-button voice-button"
          onClick={() => togglePanel('voice')}
          type="button"
        >
          <Icon name="microphone" size={21} />
        </button>
      </div>

      <div className="header-actions">
        <button
          aria-label="Video yaratish"
          aria-expanded={openPanel === 'create'}
          className="icon-button action-button create-button"
          onClick={() => togglePanel('create')}
          type="button"
        >
          <Icon name="create" />
          <span>Yaratish</span>
        </button>
        <button
          aria-label="Bildirishnomalar"
          aria-expanded={openPanel === 'notifications'}
          className="icon-button action-button notification-button"
          onClick={() => togglePanel('notifications')}
          type="button"
        >
          <Icon name="bell" />
        </button>
        <button
          aria-label="Profil"
          aria-expanded={openPanel === 'profile'}
          className="profile-button"
          onClick={() => togglePanel('profile')}
          type="button"
        >
          Y
        </button>
      </div>

      {openPanel && (
        <div className={`header-popover header-popover-${openPanel}`} role="status">
          {openPanel === 'navigation' && (
            <nav aria-label="Asosiy navigatsiya">
              <a href="/">Bosh sahifa</a>
              <a href="/shorts">Shorts</a>
              <a href="/subscriptions">Obunalar</a>
            </nav>
          )}
          {openPanel === 'create' && <span>Video yuklash</span>}
          {openPanel === 'notifications' && <span>Hozircha yangi bildirishnomalar yo‘q</span>}
          {openPanel === 'profile' && <span>Profil: Y</span>}
          {openPanel === 'voice' && <span>Ovozli qidiruv hozircha mavjud emas</span>}
        </div>
      )}
    </header>
  );
}
