import React from 'react';

const primaryLinks = [
  { label: 'Bosh sahifa', icon: 'home', page: 'home' },
  { label: 'Shorts', icon: 'shorts', page: 'shorts' },
  { label: 'Obunalar', icon: 'subscriptions', page: 'subscriptions' },
];

const libraryLinks = [
  { label: 'Tarix', icon: 'history', page: 'history' },
  { label: 'Pleylistlar', icon: 'playlists', page: 'playlists' },
  { label: 'Videolaringiz', icon: 'videos', page: 'videos' },
  { label: 'Keyinroq ko‘rish', icon: 'watchLater', page: 'watchLater' },
  { label: 'Yoqtirgan videolar', icon: 'liked', page: 'liked' },
];

function SidebarIcon({ name }) {
  const paths = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
    shorts: (
      <>
        <path d="m15.5 3.5-7 4 7 4-7 4 7 4" />
        <path d="M8.5 3.5a3 3 0 0 1 4.1-1.1l5.9 3.4a3 3 0 0 1 0 5.2l-1 .6" />
        <path d="M15.5 20.5a3 3 0 0 1-4.1 1.1l-5.9-3.4a3 3 0 0 1 0-5.2l1-.6" />
      </>
    ),
    subscriptions: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3Z" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
        <path d="M3 3v5h5m4-1v5l3 2" />
      </>
    ),
    playlists: (
      <>
        <path d="M4 6h12M4 11h12M4 16h7" />
        <path d="m17 14 4 2.5-4 2.5Z" />
      </>
    ),
    videos: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3Z" />
      </>
    ),
    watchLater: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    liked: (
      <path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Zm0 0 4-7a3 3 0 0 1 2 3v3h5a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7" />
    ),
    user: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="sidebar-svg-icon"
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

function SidebarLink({ label, icon, page, active = false, onClick }) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
      onClick={() => onClick(page)}
      type="button"
    >
      <SidebarIcon name={icon} />
      <span className="sidebar-link-label">{label}</span>
    </button>
  );
}

export default function Sidebar({
  isExpanded,
  activePage,
  onNavigate,
  currentUser,
  onOpenSignIn,
  onSignOut,
  subscriptions = [],
}) {
  return (
    <aside
      aria-label="Yon navigatsiya"
      className={`sidebar-glass ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
    >
      <nav className="sidebar-nav-section" aria-label="Asosiy bo‘limlar">
        {primaryLinks.map((link) => (
          <SidebarLink
            active={activePage === link.page}
            key={link.page}
            onClick={onNavigate}
            {...link}
          />
        ))}
      </nav>

      <div className="sidebar-divider" />

      <section aria-labelledby="library-title" className="sidebar-nav-section">
        <h2 id="library-title" className="sidebar-heading">
          Siz <span aria-hidden="true">›</span>
        </h2>
        {libraryLinks.map((link) => (
          <SidebarLink
            active={activePage === link.page}
            key={link.page}
            onClick={onNavigate}
            {...link}
          />
        ))}
      </section>

      <div className="sidebar-divider" />

      {/* Account Section */}
      <section aria-labelledby="account-sidebar-title" className="sidebar-subscriptions">
        <h2 id="account-sidebar-title" className="sidebar-heading">Hisob</h2>
        {currentUser ? (
          <div className="sidebar-account-box">
            <div className="sidebar-account-details">
              {currentUser.avatarImage ? (
                <img
                  alt={currentUser.name}
                  className="sidebar-account-avatar sidebar-account-avatar-img"
                  src={currentUser.avatarImage}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="sidebar-account-avatar"
                  style={{ backgroundColor: currentUser.color || '#2563eb' }}
                >
                  {currentUser.initials || currentUser.name?.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="sidebar-account-text">
                <span className="sidebar-account-name">{currentUser.name}</span>
                <span className="sidebar-account-email">{currentUser.email}</span>
              </div>
            </div>

            <div className="sidebar-account-actions">
              <button
                className="sidebar-pill-btn"
                onClick={() => onNavigate('subscriptions')}
                type="button"
              >
                Obunalar ({subscriptions.length})
              </button>
              <button
                className="sidebar-pill-btn sidebar-pill-btn-danger"
                onClick={onSignOut}
                type="button"
              >
                Chiqish
              </button>
            </div>
          </div>
        ) : (
          <div className="sidebar-sign-in-prompt">
            <p className="sidebar-sign-in-text">
              Videolarni yoqtirish, izoh qoldirish va obuna bo‘lish uchun tizimga kiring.
            </p>
            <button
              className="sidebar-sign-in-cta-btn"
              onClick={onOpenSignIn}
              type="button"
            >
              <SidebarIcon name="user" />
              <span>Kirish</span>
            </button>
          </div>
        )}
      </section>

      {/* Subscriptions list if any */}
      {subscriptions.length > 0 && isExpanded && (
        <>
          <div className="sidebar-divider" />
          <section aria-label="Obunalar" className="sidebar-channels-section">
            <h2 className="sidebar-heading">Obunalar</h2>
            <div className="sidebar-channel-list">
              {subscriptions.slice(0, 10).map((channel) => (
                <a
                  key={channel.id}
                  href={`https://www.youtube.com/channel/${encodeURIComponent(channel.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar-channel-item"
                >
                  <span className="sidebar-channel-avatar">
                    {(channel.title || 'K').slice(0, 1).toUpperCase()}
                  </span>
                  <span className="sidebar-channel-name truncate">{channel.title}</span>
                  <span className="sidebar-live-dot" />
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </aside>
  );
}