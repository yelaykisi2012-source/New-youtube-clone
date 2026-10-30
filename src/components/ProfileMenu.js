import React, { useEffect, useRef } from 'react';

export default function ProfileMenu({
  isOpen,
  onClose,
  currentUser,
  theme = 'light',
  onToggleTheme,
  onOpenStudio,
  onOpenSwitchAccount,
  onSignOut,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="profile-menu-backdrop" role="presentation">
      <div
        className="profile-menu-container profile-menu-animated"
        ref={menuRef}
        role="menu"
        aria-label="Hisob menyusi"
      >
        <div className="profile-menu-mobile-handle" aria-hidden="true" />

        {/* User Card */}
        <div className="profile-menu-user-card">
          {currentUser?.avatarImage ? (
            <img
              src={currentUser.avatarImage}
              alt=""
              className="profile-menu-avatar profile-menu-avatar-img"
            />
          ) : (
            <span
              className="profile-menu-avatar"
              style={{ backgroundColor: currentUser?.color || '#2563eb' }}
            >
              {currentUser?.initials || currentUser?.name?.slice(0, 1).toUpperCase() || 'U'}
            </span>
          )}
          <div className="profile-menu-user-info">
            <h3 className="profile-menu-user-name">{currentUser?.name || 'Foydalanuvchi'}</h3>
            <p className="profile-menu-user-handle">{currentUser?.email || '@foydalanuvchi'}</p>
            <button
              type="button"
              className="profile-menu-manage-link"
              onClick={() => {
                onClose();
                onOpenStudio('settings');
              }}
            >
              Profilni tahrirlash ›
            </button>
          </div>
        </div>

        <div className="profile-menu-divider" />

        {/* Action List */}
        <div className="profile-menu-actions">
          <button
            type="button"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenStudio('overview');
            }}
          >
            <span className="profile-menu-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <span>YouTube Studio / Admin</span>
          </button>

          <button
            type="button"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenSwitchAccount();
            }}
          >
            <span className="profile-menu-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span>Hisobni almashtirish</span>
            <span className="profile-menu-arrow" aria-hidden="true">›</span>
          </button>

          <button
            type="button"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => {
              onClose();
              onSignOut();
            }}
          >
            <span className="profile-menu-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span>Hisobdan chiqish</span>
          </button>

          <div className="profile-menu-divider" />

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            className="profile-menu-item profile-menu-theme-item"
            role="menuitem"
            onClick={onToggleTheme}
          >
            <span className="profile-menu-icon" aria-hidden="true">
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </span>
            <div className="theme-toggle-label">
              <span>Mavzu: {theme === 'dark' ? 'Qorong‘i' : 'Yorug‘'}</span>
            </div>
            <div className={`theme-toggle-switch ${theme === 'dark' ? 'active' : ''}`}>
              <div className="theme-toggle-thumb" />
            </div>
          </button>

          <button
            type="button"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenStudio('settings');
            }}
          >
            <span className="profile-menu-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span>Sozlamalar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
