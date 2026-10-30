import React, { useEffect, useState } from 'react';

const AVATAR_COLORS = [
  '#2563eb', // Blue
  '#db2777', // Pink
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
];

export default function SignInModal({
  isOpen,
  onClose,
  accounts = [],
  currentAccount = null,
  onSelectAccount,
  onCreateAccount,
}) {
  const [tab, setTab] = useState('list'); // 'list' | 'create'
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [newAvatarImage, setNewAvatarImage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [animatingId, setAnimatingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAccountClick = (account) => {
    setAnimatingId(account.id || account.email);
    window.setTimeout(() => {
      onSelectAccount(account);
      setAnimatingId(null);
      onClose();
    }, 280);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Iltimos, rasm faylini tanlang (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Rasm hajmi 2 MB dan oshmasligi kerak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewAvatarImage(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const name = newName.trim();
    if (!name) {
      setErrorMsg('Ismingizni kiriting.');
      return;
    }

    const handle = newEmail.trim()
      ? (newEmail.includes('@') ? newEmail.trim() : `@${newEmail.replace(/^@/, '').trim()}`)
      : `@${name.toLowerCase().replace(/\s+/g, '')}`;

    const newAccount = {
      id: `user-${Date.now()}`,
      name,
      email: handle,
      initials: name.slice(0, 1).toUpperCase(),
      color: newColor,
      avatarImage: newAvatarImage || null,
      custom: true,
    };

    onCreateAccount(newAccount);
    setNewName('');
    setNewEmail('');
    setNewAvatarImage('');
    setTab('list');
    onClose();
  };

  return (
    <div
      className="sign-in-backdrop sign-in-backdrop-animated"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="sign-in-dialog sign-in-dialog-animated"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-modal-title"
      >
        <div className="bottom-sheet-handle" aria-hidden="true" />

        <button
          aria-label="Oynani yopish"
          className="sign-in-close"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

        <div className="sign-in-header">
          <div className="sign-in-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 28 20" width="28" height="20" fill="currentColor">
              <path d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5C28 14.7 28 10 28 10s0-4.7-.6-6.9Z" fill="#ff0033" />
              <path d="m11 14.3 7.3-4.3L11 5.7v8.6Z" fill="#fff" />
            </svg>
          </div>
          <h2 id="sign-in-modal-title">YouTube Hisobi</h2>
          <p className="sign-in-description">
            {tab === 'list'
              ? 'Tizimga kirish uchun mavjud hisobni tanlang yoki yangisini qo‘shing'
              : 'Yangi profil yarating va o‘z kanalingizga ega bo‘ling'}
          </p>
        </div>

        <div className="sign-in-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'list'}
            className={`sign-in-tab ${tab === 'list' ? 'sign-in-tab-active' : ''}`}
            onClick={() => {
              setTab('list');
              setErrorMsg('');
            }}
          >
            Mavjud hisoblar ({accounts.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'create'}
            className={`sign-in-tab ${tab === 'create' ? 'sign-in-tab-active' : ''}`}
            onClick={() => {
              setTab('create');
              setErrorMsg('');
            }}
          >
            + Yangi hisob
          </button>
        </div>

        {tab === 'list' && (
          <div className="demo-account-list">
            {accounts.map((account, index) => {
              const isCurrent = currentAccount?.email === account.email;
              const isSelected = animatingId === (account.id || account.email);

              return (
                <button
                  key={account.id || account.email}
                  className={`demo-account-option ${isCurrent ? 'demo-account-active' : ''} ${
                    isSelected ? 'demo-account-selected-anim' : ''
                  }`}
                  onClick={() => handleAccountClick(account)}
                  type="button"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {account.avatarImage ? (
                    <img
                      src={account.avatarImage}
                      alt={account.name}
                      className="demo-account-avatar demo-account-avatar-img"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="demo-account-avatar"
                      style={{ backgroundColor: account.color || '#2563eb' }}
                    >
                      {account.initials || account.name?.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="demo-account-info">
                    <div className="demo-account-name-row">
                      <span className="demo-account-name">{account.name}</span>
                      {isCurrent && <span className="account-badge-active">Joriy hisob</span>}
                    </div>
                    <span className="demo-account-email">{account.email}</span>
                  </div>
                  <span className="demo-account-arrow" aria-hidden="true">
                    {isSelected ? '✓' : '›'}
                  </span>
                </button>
              );
            })}

            <div className="sign-in-footer-actions">
              <button
                type="button"
                className="add-account-shortcut-btn"
                onClick={() => setTab('create')}
              >
                <span className="shortcut-plus">+</span> Yangi profil qo‘shish
              </button>
            </div>
          </div>
        )}

        {tab === 'create' && (
          <form className="create-account-form" onSubmit={handleCreateAccount}>
            <div className="create-avatar-section">
              <div
                className="create-avatar-preview"
                style={{
                  backgroundColor: newAvatarImage ? 'transparent' : newColor,
                }}
              >
                {newAvatarImage ? (
                  <img src={newAvatarImage} alt="Oldindan ko‘rish" className="preview-img" />
                ) : (
                  <span>{(newName.trim() || 'A').slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="create-avatar-controls">
                <span className="avatar-color-label">Rangni tanlang:</span>
                <div className="color-palette">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot ${newColor === c ? 'color-dot-active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setNewColor(c);
                        setNewAvatarImage('');
                      }}
                      aria-label={`Rang ${c}`}
                    />
                  ))}
                </div>
                <label className="upload-avatar-btn">
                  📷 Rasm yuklash
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="create-name-input">Ism va familiya *</label>
              <input
                id="create-name-input"
                type="text"
                placeholder="Masalan: Sardor Rustamov"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="create-email-input">Foydalanuvchi nomi yoki email (ixtiyoriy)</label>
              <input
                id="create-email-input"
                type="text"
                placeholder="@sardor yoki sardor@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            {errorMsg && <p className="sign-in-error-msg">{errorMsg}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setTab('list')}
              >
                Ortga
              </button>
              <button type="submit" className="submit-account-btn">
                Saqlash va Kirish
              </button>
            </div>
          </form>
        )}

        <p className="demo-account-notice">
          Tanlangan hisob ma’lumotlari brauzeringizda saqlanadi
        </p>
      </div>
    </div>
  );
}
