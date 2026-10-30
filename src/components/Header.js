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

const sampleNotifications = [
  {
    id: 1,
    title: 'Najot Ta’lim yangi video yukladi',
    desc: 'Frontend dasturlashda 2026 yil trendlari va yangi kutubxonalar',
    time: '15 daqiqa oldin',
    unread: true,
  },
  {
    id: 2,
    title: 'Kanal obunasi yangilandi',
    desc: 'Texnologiyalar olami kanali jonli efirni boshladi',
    time: '2 soat oldin',
    unread: true,
  },
  {
    id: 3,
    title: 'Izohingiz yoqdi',
    desc: 'Alisher videodagi fikringizga like bosdi',
    time: '1 kun oldin',
    unread: false,
  },
];

export default function Header({
  onSearch,
  onToggleSidebar,
  onOpenAdmin,
  onOpenCreate,
  currentUser,
  onOpenSignIn,
  onToggleProfileMenu,
  sidebarExpanded,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openPanel, setOpenPanel] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const searchInput = useRef(null);
  const recognitionRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  React.useEffect(() => () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
    }
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    onSearch(query);
    setSearchOpen(false);
  };

  const handleSearchButtonClick = () => {
    if (!searchQuery.trim() && !searchOpen) {
      setSearchOpen((isOpen) => !isOpen);
      window.setTimeout(() => searchInput.current?.focus(), 0);
    }
  };

  const togglePanel = (panel) => {
    setOpenPanel((currentPanel) => (currentPanel === panel ? '' : panel));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleVoiceSearch = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage('Bu brauzer ovozli qidiruvni qo‘llab-quvvatlamaydi. Matn orqali qidiring.');
      setOpenPanel('voice');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
    }
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = 'uz-UZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const query = event.results[0][0].transcript.trim();
      setIsListening(false);
      setOpenPanel('');
      if (query) {
        setSearchQuery(query);
        onSearch(query);
      }
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(`Ovozli qidiruv ishlamadi (${event.error}). Mikrofon ruxsatini tekshiring.`);
      setOpenPanel('voice');
    };
    recognition.onend = () => setIsListening(false);

    try {
      setVoiceMessage('Gapiring — ovozingizni tinglayapman...');
      setIsListening(true);
      setOpenPanel('voice');
      recognition.start();
    } catch (recognitionError) {
      setIsListening(false);
      setVoiceMessage(`Ovozli qidiruvni boshlab bo‘lmadi: ${recognitionError.message}`);
      setOpenPanel('voice');
    }
  };

  return (
    <header className="site-header">
      <div className="header-left">
        <button
          aria-label={sidebarExpanded ? 'Yon panelni yopish' : 'Yon panelni ochish'}
          aria-expanded={sidebarExpanded}
          className="icon-button menu-button"
          onClick={() => {
            setOpenPanel('');
            onToggleSidebar();
          }}
          type="button"
        >
          <Icon name="menu" />
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
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Qidiruv matnini tozalash"
              >
                ✕
              </button>
            )}
          </label>
          <button
            aria-label={searchOpen ? 'Qidiruvni yopish' : 'Qidirish'}
            className="search-button"
            onClick={(event) => {
              if (!searchQuery.trim()) {
                event.preventDefault();
                handleSearchButtonClick();
              }
            }}
            type="submit"
          >
            <Icon name={searchOpen ? 'close' : 'search'} size={21} />
          </button>
        </form>
        <button
          aria-label={isListening ? 'Ovozli qidiruvni tinglayapti' : 'Ovoz bilan qidirish'}
          aria-pressed={isListening}
          className={`icon-button voice-button ${isListening ? 'voice-button-listening' : ''}`}
          onClick={handleVoiceSearch}
          type="button"
        >
          <Icon name="microphone" size={21} />
        </button>
      </div>

      <div className="header-actions">
        <button
          aria-label="Video yaratish"
          className="icon-button action-button create-button"
          onClick={() => {
            setOpenPanel('');
            onOpenCreate();
          }}
          type="button"
        >
          <Icon name="create" />
          <span className="create-button-text">Yaratish</span>
        </button>

        <div className="notification-button-wrapper">
          <button
            aria-label="Bildirishnomalar"
            aria-expanded={openPanel === 'notifications'}
            className="icon-button action-button notification-button"
            onClick={() => togglePanel('notifications')}
            type="button"
          >
            <Icon name="bell" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        </div>

        {currentUser ? (
          <button
            aria-label="Profil menyusini ochish"
            aria-haspopup="true"
            className="profile-button profile-button-active"
            onClick={() => {
              setOpenPanel('');
              onToggleProfileMenu();
            }}
            type="button"
          >
            {currentUser.avatarImage ? (
              <img alt={currentUser.name} className="profile-avatar-image" src={currentUser.avatarImage} />
            ) : (
              <span
                className="profile-avatar-initials"
                style={{ backgroundColor: currentUser.color || '#2563eb' }}
              >
                {currentUser.initials || currentUser.name?.slice(0, 1).toUpperCase()}
              </span>
            )}
          </button>
        ) : (
          <button
            className="header-sign-in-pill"
            onClick={() => {
              setOpenPanel('');
              onOpenSignIn();
            }}
            type="button"
          >
            <Icon name="user" size={18} />
            <span>Kirish</span>
          </button>
        )}
      </div>

      {openPanel === 'notifications' && (
        <div className="header-popover header-popover-notifications" role="dialog" aria-label="Bildirishnomalar">
          <div className="notification-popover-header">
            <h3>Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <button type="button" className="mark-all-read-btn" onClick={markAllRead}>
                Barchasini o‘qish
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.map((item) => (
              <div key={item.id} className={`notification-item ${item.unread ? 'unread' : ''}`}>
                <div className="notification-dot" />
                <div className="notification-content">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  <span className="notification-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {openPanel === 'voice' && (
        <div className="header-popover header-popover-voice" role="status">
          <div className={`voice-visualizer ${isListening ? 'active' : ''}`}>
            <span /><span /><span /><span />
          </div>
          <span>{voiceMessage}</span>
        </div>
      )}
    </header>
  );
}
