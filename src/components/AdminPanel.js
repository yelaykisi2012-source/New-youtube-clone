import React, { useEffect, useMemo, useState } from 'react';

const sections = [
  { id: 'overview', label: 'Umumiy ko‘rinish', icon: 'overview' },
  { id: 'videos', label: 'Videolar', icon: 'videos' },
  { id: 'analytics', label: 'Tahlil', icon: 'analytics' },
  { id: 'settings', label: 'Profil va Sozlamalar', icon: 'settings' },
];

function getYouTubeVideoId(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return '';
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';

  const hostname = url.hostname.toLowerCase();
  let videoId = '';
  if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0] || '';
  } else if (
    hostname === 'youtube.com' ||
    hostname === 'www.youtube.com' ||
    hostname === 'm.youtube.com'
  ) {
    if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v') || '';
    } else {
      const pathMatch = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
      videoId = pathMatch?.[1] || '';
    }
  }

  return /^[\w-]{11}$/.test(videoId) ? videoId : '';
}

function AdminIcon({ name, size = 20 }) {
  const paths = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    videos: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3Z" />
      </>
    ),
    analytics: (
      <>
        <path d="M4 19V5m0 14h17" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
      </>
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

function getVideoId(video) {
  return typeof video.id === 'string' ? video.id : video.id?.videoId;
}

export default function AdminPanel({
  videos = [],
  localVideos = [],
  isLoading = false,
  error = '',
  localVideoError = '',
  onAddVideo,
  currentUser = null,
  onUpdateProfile,
  onReRegisterFace,
  initialSection = 'overview',
  onClose,
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [videoQuery, setVideoQuery] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Profile editing state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');
  const [profileImage, setProfileImage] = useState(currentUser?.avatarImage || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Face ID Biometric state
  const [registeredFace, setRegisteredFace] = useState(() => {
    try {
      const data = localStorage.getItem('youtube-clone-admin-face-id');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const [masterPin, setMasterPin] = useState(() => {
    return localStorage.getItem('youtube-clone-admin-master-pin') || '2026';
  });
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfileBio(currentUser.bio || '');
      setProfileImage(currentUser.avatarImage || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const channelsCount = useMemo(
    () => new Set(videos.map((video) => video.snippet?.channelId).filter(Boolean)).size,
    [videos]
  );

  const localVideoIds = useMemo(
    () => new Set(localVideos.map((video) => getVideoId(video))),
    [localVideos]
  );

  const filteredVideos = useMemo(() => {
    const query = videoQuery.trim().toLocaleLowerCase();
    if (!query) return videos;

    return videos.filter((video) => {
      const title = video.snippet?.title || '';
      const channel = video.snippet?.channelTitle || '';
      return `${title} ${channel}`.toLocaleLowerCase().includes(query);
    });
  }, [videoQuery, videos]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleAddVideo = (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const id = getYouTubeVideoId(videoUrl.trim());
    if (!id) {
      setFormError('YouTube video havolasini to‘g‘ri kiriting (masalan: https://youtu.be/dQw4w9WgXcQ).');
      return;
    }
    if (!videoTitle.trim()) {
      setFormError('Video sarlavhasini kiriting.');
      return;
    }
    if (videos.some((video) => getVideoId(video) === id)) {
      setFormError('Bu video allaqachon ro‘yxatga qo‘shilgan.');
      return;
    }

    const saved = onAddVideo?.({
      id,
      snippet: {
        title: videoTitle.trim(),
        channelTitle: channelTitle.trim() || currentUser?.name || 'Mening Kanalim',
        channelId: 'local',
        publishedAt: new Date().toISOString(),
        thumbnails: {
          high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` },
        },
      },
    });

    if (saved) {
      setVideoUrl('');
      setVideoTitle('');
      setChannelTitle('');
      setSuccessMessage('Video muvaffaqiyatli qo‘shildi va saqlandi!');
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setProfileMessage('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMessage('JPG, PNG yoki WebP formatidagi rasm tanlang.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage('Rasm hajmi 2 MB dan oshmasligi kerak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setProfileMessage('Yangi rasm tanlandi. Saqlash tugmasini bosing.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMessage('');

    if (!profileName.trim()) {
      setProfileMessage('Ismni kiritish majburiy.');
      return;
    }

    const updated = {
      ...(currentUser || {}),
      name: profileName.trim(),
      email: profileEmail.trim() || `@${profileName.trim().toLowerCase().replace(/\s+/g, '')}`,
      bio: profileBio.trim(),
      avatarImage: profileImage || null,
      initials: profileName.trim().slice(0, 1).toUpperCase(),
    };

    onUpdateProfile?.(updated);
    setProfileMessage('Profil ma’lumotlari muvaffaqiyatli yangilandi ✓');
  };

  return (
    <div className="admin-backdrop" onMouseDown={handleBackdropClick}>
      <section
        aria-labelledby="admin-title"
        aria-modal="true"
        className="admin-panel"
        role="dialog"
      >
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span aria-hidden="true" className="admin-brand-mark">▶</span>
            <span>YouTube Studio</span>
          </div>

          <div className="admin-user-profile-badge">
            {profileImage ? (
              <img src={profileImage} alt="" className="admin-user-avatar admin-user-avatar-img" />
            ) : (
              <span className="admin-user-avatar" style={{ backgroundColor: currentUser?.color || '#2563eb' }}>
                {profileName ? profileName.slice(0, 1).toUpperCase() : 'U'}
              </span>
            )}
            <div className="admin-user-text">
              <span className="admin-user-name truncate">{profileName || 'Foydalanuvchi'}</span>
              <span className="admin-user-role">Kanal egasi</span>
            </div>
          </div>

          <p className="admin-sidebar-caption">BOSHQARUV PANELI</p>
          <nav aria-label="Admin bo‘limlari" className="admin-nav">
            {sections.map((section) => (
              <button
                aria-current={activeSection === section.id ? 'page' : undefined}
                className={`admin-nav-link ${activeSection === section.id ? 'admin-nav-link-active' : ''}`}
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                type="button"
              >
                <AdminIcon name={section.icon} />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-note">
            <span className="admin-demo-dot" />
            Lokal ma’lumotlar bazasi
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <p className="admin-eyebrow">YOUTUBE CLONE / STUDIO</p>
              <h1 id="admin-title">
                {sections.find((s) => s.id === activeSection)?.label || 'Boshqaruv'}
              </h1>
            </div>
            <button
              aria-label="Admin panelini yopish"
              className="admin-close"
              onClick={onClose}
              type="button"
            >
              <AdminIcon name="close" />
            </button>
          </header>

          <div className="admin-content">
            {localVideoError && <p className="admin-form-error" role="alert">{localVideoError}</p>}

            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <section aria-labelledby="admin-overview-title">
                <div className="admin-section-heading">
                  <div>
                    <h2 id="admin-overview-title">Kanal tahliliy xulosasi</h2>
                    <p>Kanal va videolaringiz statistikasi</p>
                  </div>
                  <span className="admin-date-label">Faol holat</span>
                </div>

                <div className="admin-stat-grid">
                  <article className="admin-stat-card">
                    <span className="admin-stat-label">Jami videolar</span>
                    <strong>{isLoading ? '…' : videos.length}</strong>
                    <span className="admin-stat-caption">API va kiritilgan videolar</span>
                  </article>
                  <article className="admin-stat-card">
                    <span className="admin-stat-label">Siz qo‘shgan videolar</span>
                    <strong>{localVideos.length}</strong>
                    <span className="admin-stat-caption">Brauzerda saqlangan</span>
                  </article>
                  <article className="admin-stat-card">
                    <span className="admin-stat-label">Faol kanallar</span>
                    <strong>{isLoading ? '…' : channelsCount}</strong>
                    <span className="admin-stat-caption">Kuzatuvdagi manbalar</span>
                  </article>
                  <article className="admin-stat-card">
                    <span className="admin-stat-label">Taxminiy ko‘rishlar</span>
                    <strong>124.8K</strong>
                    <span className="admin-stat-caption">Oxirgi 28 kunda (+14%)</span>
                  </article>
                </div>

                <section aria-labelledby="admin-latest-title" className="admin-latest">
                  <div className="admin-section-heading admin-latest-heading">
                    <div>
                      <h2 id="admin-latest-title">So‘nggi videolar</h2>
                      <p>Hozirgi video oqimidan lavhalar</p>
                    </div>
                  </div>
                  <VideoList
                    error={error}
                    isLoading={isLoading}
                    localVideoIds={localVideoIds}
                    videos={videos.slice(0, 5)}
                  />
                </section>
              </section>
            )}

            {/* VIDEOS MANAGEMENT SECTION */}
            {activeSection === 'videos' && (
              <section aria-labelledby="admin-videos-title">
                <div className="admin-section-heading">
                  <div>
                    <h2 id="admin-videos-title">Videolarni boshqarish</h2>
                    <p>Yangi video havolasini qo‘shing yoki mavjudlarini qidiring</p>
                  </div>
                </div>

                <form className="admin-add-video-form" onSubmit={handleAddVideo}>
                  <h3>+ Saytga yangi video qo‘shish</h3>
                  <div className="admin-form-grid">
                    <label className="admin-form-field admin-form-field-wide">
                      <span>YouTube Video Havolasi (URL) *</span>
                      <input
                        placeholder="Masalan: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        required
                      />
                    </label>
                    <label className="admin-form-field">
                      <span>Video sarlavhasi *</span>
                      <input
                        placeholder="Videongiz nomini kiriting"
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        required
                      />
                    </label>
                    <label className="admin-form-field">
                      <span>Kanal nomi (ixtiyoriy)</span>
                      <input
                        placeholder={currentUser?.name || 'Mening Kanalim'}
                        type="text"
                        value={channelTitle}
                        onChange={(e) => setChannelTitle(e.target.value)}
                      />
                    </label>
                  </div>

                  {formError && <p className="admin-form-error" role="alert">{formError}</p>}
                  {successMessage && <p className="admin-form-success" role="status">{successMessage}</p>}

                  <div className="admin-form-actions">
                    <button className="admin-submit-button" type="submit">
                      Videoni Saqlash
                    </button>
                  </div>
                </form>

                <div className="admin-video-search-wrap">
                  <input
                    type="search"
                    placeholder="Videolarni sarlavha bo‘yicha qidirish..."
                    value={videoQuery}
                    onChange={(e) => setVideoQuery(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                <VideoList
                  error={error}
                  isLoading={isLoading}
                  localVideoIds={localVideoIds}
                  videos={filteredVideos}
                />
              </section>
            )}

            {/* ANALYTICS SECTION */}
            {activeSection === 'analytics' && (
              <section aria-labelledby="admin-analytics-title">
                <div className="admin-section-heading">
                  <div>
                    <h2 id="admin-analytics-title">Auditoriya va ko‘rishlar tahlili</h2>
                    <p>So‘nggi 30 kunlik kanal ko‘rsatkichlari</p>
                  </div>
                </div>

                <div className="analytics-metrics-cards">
                  <div className="metric-box">
                    <span className="metric-title">Tomosha vaqti (soat)</span>
                    <strong className="metric-val">3,420</strong>
                    <span className="metric-change positive">+18.2% o‘sish</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">Yangi obunachilar</span>
                    <strong className="metric-val">+486</strong>
                    <span className="metric-change positive">+24.0% o‘sish</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-title">O‘rtacha ko‘rish davomiyligi</span>
                    <strong className="metric-val">4:32 daqiqa</strong>
                    <span className="metric-change neutral">O‘zgarmagan</span>
                  </div>
                </div>

                <div className="analytics-chart-mock">
                  <div className="chart-header">
                    <h4>Ko‘rishlar dinamikasi (Grafik)</h4>
                    <span className="chart-range">Oxirgi 7 kun</span>
                  </div>
                  <div className="chart-bars">
                    {[
                      { day: 'Dush', h: '60%' },
                      { day: 'Sesh', h: '75%' },
                      { day: 'Chor', h: '50%' },
                      { day: 'Pay', h: '85%' },
                      { day: 'Jum', h: '95%' },
                      { day: 'Shan', h: '100%' },
                      { day: 'Yak', h: '90%' },
                    ].map((item) => (
                      <div key={item.day} className="chart-bar-item">
                        <div className="chart-bar-pill" style={{ height: item.h }} />
                        <span className="chart-bar-day">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* PROFILE & SETTINGS SECTION (RESPONSIVE) */}
            {activeSection === 'settings' && (
              <section aria-labelledby="admin-settings-title" className="admin-profile-full-section">
                <div className="admin-section-heading">
                  <div>
                    <h2 id="admin-settings-title">Profil va Kanal Sozlamalari</h2>
                    <p>O‘z profilingiz, ismingiz, avatar va bio ma’lumotlarini moslashtiring</p>
                  </div>
                </div>

                <form className="admin-profile-form-card" onSubmit={handleSaveProfile}>
                  <div className="admin-profile-header-group">
                    <div className="admin-profile-avatar-large">
                      {profileImage ? (
                        <img alt="Profil rasmi" className="admin-avatar-img" src={profileImage} />
                      ) : (
                        <span
                          className="admin-avatar-initials"
                          style={{ backgroundColor: currentUser?.color || '#2563eb' }}
                        >
                          {profileName ? profileName.slice(0, 1).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    <div className="admin-avatar-uploader">
                      <h4>Profil rasmi</h4>
                      <p>JPG, PNG yoki WebP formatida (Maksimal 2 MB)</p>
                      <div className="admin-avatar-btn-row">
                        <label className="admin-btn-pill admin-upload-pill">
                          📷 Yangi rasm tanlash
                          <input
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            type="file"
                            style={{ display: 'none' }}
                          />
                        </label>
                        {profileImage && (
                          <button
                            type="button"
                            className="admin-btn-pill admin-remove-pill"
                            onClick={() => {
                              setProfileImage('');
                              setProfileMessage('Profil rasmi olib tashlandi.');
                            }}
                          >
                            Olib tashlash
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-grid" style={{ marginTop: '20px' }}>
                    <label className="admin-form-field">
                      <span>Kanal / Foydalanuvchi ismi *</span>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Masalan: Sardor Rustamov"
                        required
                      />
                    </label>

                    <label className="admin-form-field">
                      <span>Handle / Foydalanuvchi nomi (@)</span>
                      <input
                        type="text"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="@sardor_dev"
                      />
                    </label>

                    <label className="admin-form-field admin-form-field-wide">
                      <span>Kanal tavsifi (Bio)</span>
                      <textarea
                        rows="3"
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Kanal haqida qisqacha ma’lumot..."
                      />
                    </label>
                  </div>

                  {profileMessage && (
                    <p className="admin-form-success" role="status" style={{ marginTop: '14px' }}>
                      {profileMessage}
                    </p>
                  )}

                  <div className="admin-form-actions" style={{ marginTop: '20px' }}>
                    <button type="submit" className="admin-submit-button">
                      O‘zgarishlarni Saqlash
                    </button>
                  </div>
                </form>

                {/* Face ID Biometric Security Management */}
                <div className="admin-face-id-card" style={{ marginTop: '24px' }}>
                  <div className="admin-face-id-header">
                    <div className="admin-face-id-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="m9 9 .01 0" />
                        <path d="m15 9 .01 0" />
                        <path d="M10 16c.8.7 1.8 1 2 1s1.2-.3 2-1" />
                      </svg>
                    </div>
                    <div>
                      <h3>Admin Biometrik Face ID Xavfsizligi</h3>
                      <p>Admin paneliga faqat sizning yuzingiz orqali kiriladi (1 umrga saqlangan)</p>
                    </div>
                    <span className="admin-face-badge active">
                      {registeredFace ? 'Himoyalangan ✓' : 'Kutilmoqda'}
                    </span>
                  </div>

                  <div className="admin-face-id-body">
                    {registeredFace ? (
                      <div className="admin-face-preview-row">
                        <div className="admin-face-thumb-wrap">
                          {registeredFace.photo ? (
                            <img src={registeredFace.photo} alt="Ro‘yxatdan o‘tgan yuz" className="admin-face-thumb-img" />
                          ) : (
                            <span className="admin-face-thumb-placeholder">👤</span>
                          )}
                          <span className="admin-face-verified-tag">✓</span>
                        </div>
                        <div className="admin-face-info">
                          <h4>Ro‘yxatdan o‘tgan yuz faol</h4>
                          <span className="admin-face-date">
                            Saqlangan sana: {new Date(registeredFace.registeredAt).toLocaleDateString('uz-UZ')} {new Date(registeredFace.registeredAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <p>Ushbu yuz orqali har safar Admin panelga kirishda shaxsingiz tasdiqlanadi.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="admin-face-not-registered">Hali yuz ro‘yxatdan o‘tkazilmagan.</p>
                    )}

                    <div className="admin-face-actions-row">
                      <button
                        type="button"
                        className="admin-re-register-face-btn"
                        onClick={onReRegisterFace}
                      >
                        📷 {registeredFace ? 'Yuzni qayta skanerlash va o‘zgartirish' : 'Yuzni ro‘yxatdan o‘tkazish'}
                      </button>

                      {registeredFace && (
                        <button
                          type="button"
                          className="admin-remove-face-btn"
                          onClick={() => {
                            if (window.confirm('Rostdan ham saqlangan Face ID ni o‘chirmoqchimisiz? Keyingi kirishda yangi yuz talab qilinadi.')) {
                              localStorage.removeItem('youtube-clone-admin-face-id');
                              setRegisteredFace(null);
                            }
                          }}
                        >
                          Face ID ni o‘chirish
                        </button>
                      )}
                    </div>

                    {/* Master PIN Settings */}
                    <div className="admin-pin-settings-subcard">
                      <div className="admin-pin-subcard-header">
                        <div>
                          <strong>Zaxira Master PIN</strong>
                          <p>Kamera ishlamasa kirish uchun ishlatiladi (Joriy: ****{masterPin.slice(-2)})</p>
                        </div>
                        <button
                          type="button"
                          className="admin-edit-pin-btn"
                          onClick={() => {
                            setIsEditingPin(!isEditingPin);
                            setPinChangeMsg('');
                          }}
                        >
                          {isEditingPin ? 'Yopish' : 'O‘zgartirish'}
                        </button>
                      </div>

                      {isEditingPin && (
                        <div className="admin-pin-edit-form">
                          <input
                            type="password"
                            placeholder="Yangi PIN (4-8 ta raqam)"
                            maxLength="8"
                            value={newPinInput}
                            onChange={(e) => setNewPinInput(e.target.value)}
                            className="admin-pin-field"
                          />
                          <button
                            type="button"
                            className="admin-save-pin-btn"
                            onClick={() => {
                              if (newPinInput.length >= 4) {
                                localStorage.setItem('youtube-clone-admin-master-pin', newPinInput);
                                setMasterPin(newPinInput);
                                setPinChangeMsg('Master PIN muvaffaqiyatli yangilandi!');
                                setIsEditingPin(false);
                                setNewPinInput('');
                              } else {
                                setPinChangeMsg('PIN kamida 4 ta belgidan iborat bo‘lishi kerak.');
                              }
                            }}
                          >
                            Saqlash
                          </button>
                        </div>
                      )}
                      {pinChangeMsg && <p className="admin-pin-msg">{pinChangeMsg}</p>}
                    </div>
                  </div>
                </div>

                <div className="admin-settings-card" style={{ marginTop: '24px' }}>
                  <div>
                    <h3>Ma’lumot manbai</h3>
                    <p>YouTube Data API v3 — jonli qidiruv va mashhur videolar</p>
                  </div>
                  <span className="admin-readonly-badge">Ulangan ✓</span>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function VideoList({ videos, isLoading, error, localVideoIds }) {
  if (isLoading) {
    return <p className="admin-list-message" role="status">Videolar yuklanmoqda...</p>;
  }

  if (error) {
    return <p className="admin-list-message admin-list-error" role="alert">{error}</p>;
  }

  if (videos.length === 0) {
    return <p className="admin-list-message" role="status">Ko‘rsatish uchun video topilmadi.</p>;
  }

  return (
    <div className="admin-video-list">
      <div className="admin-video-row admin-video-row-heading" aria-hidden="true">
        <span>VIDEO</span>
        <span>KANAL</span>
        <span>SANA</span>
      </div>
      {videos.map((video, index) => {
        const snippet = video.snippet || {};
        const videoId = getVideoId(video) || `${snippet.title || 'video'}-${index}`;
        const thumbnail = snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
        const publishedDate = snippet.publishedAt
          ? new Date(snippet.publishedAt).toLocaleDateString('uz-UZ')
          : '—';

        return (
          <article className="admin-video-row" key={videoId}>
            <div className="admin-video-info">
              {thumbnail ? (
                <img alt="" className="admin-video-thumbnail" src={thumbnail} />
              ) : (
                <span aria-hidden="true" className="admin-video-thumbnail admin-thumbnail-placeholder">▶</span>
              )}
              <span className="admin-video-title">
                {snippet.title || 'Nomsiz video'}
                {localVideoIds.has(videoId) && <span className="admin-local-badge">Sayt videosi</span>}
              </span>
            </div>
            <span className="admin-video-channel">{snippet.channelTitle || 'Noma’lum kanal'}</span>
            <time className="admin-video-date" dateTime={snippet.publishedAt || undefined}>
              {publishedDate}
            </time>
          </article>
        );
      })}
    </div>
  );
}
