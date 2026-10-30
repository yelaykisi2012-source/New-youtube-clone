import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import SignInModal from './components/SignInModal';
import ProfileMenu from './components/ProfileMenu';
import FaceAuthModal from './components/FaceAuthModal';
import MiniPlayer from './components/MiniPlayer';
import ShortsFeed from './components/ShortsFeed';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import { getPopularVideos, searchVideos } from './youtubeApi';

const LOCAL_VIDEOS_KEY = 'youtube-clone-local-videos';
const USER_DATA_KEY = 'youtube-clone-user-data';
const THEME_KEY = 'youtube-clone-theme';
const ACTIVE_USER_KEY = 'youtube-clone-active-user';
const ACCOUNTS_KEY = 'youtube-clone-accounts-list';

const defaultAccounts = [
  {
    id: 'user-1',
    name: 'Azizbek Karimov',
    email: '@azizbek_dev',
    initials: 'A',
    color: '#2563eb',
    bio: 'Frontend dasturchi va YouTube ijodkori.',
  },
  {
    id: 'user-2',
    name: 'Malika Raximova',
    email: '@malika_design',
    initials: 'M',
    color: '#db2777',
    bio: 'UI/UX dizayner va raqamli san’at ixlosmandi.',
  },
  {
    id: 'user-3',
    name: 'Javohir Tursunov',
    email: '@javohir_t',
    initials: 'J',
    color: '#059669',
    bio: 'Texnologiyalar va sun’iy intellekt bo‘yicha bloger.',
  },
];

const fallbackSampleVideos = [
  {
    id: 'dQw4w9WgXcQ',
    snippet: {
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      channelTitle: 'Rick Astley',
      channelId: 'rick-astley',
      publishedAt: '2024-01-15T10:00:00Z',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
      },
      description: 'The official video for “Never Gonna Give You Up” by Rick Astley.',
    },
  },
  {
    id: 'kJQP7kiw5Fk',
    snippet: {
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channelTitle: 'Luis Fonsi',
      channelId: 'luis-fonsi',
      publishedAt: '2023-11-20T14:30:00Z',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
      },
      description: 'Despacito official video featuring Daddy Yankee.',
    },
  },
  {
    id: 'JGwWNGJdvx8',
    snippet: {
      title: 'Ed Sheeran - Shape of You (Official Music Video)',
      channelTitle: 'Ed Sheeran',
      channelId: 'ed-sheeran',
      publishedAt: '2024-02-01T12:00:00Z',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
      },
      description: 'Official music video for Ed Sheeran - Shape of You.',
    },
  },
  {
    id: 'fJ9rUzIMcZQ',
    snippet: {
      title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
      channelTitle: 'Queen Official',
      channelId: 'queen',
      publishedAt: '2023-10-12T09:00:00Z',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
      },
      description: 'Bohemian Rhapsody official remastered video by Queen.',
    },
  },
  {
    id: 'L_LUpnjgPso',
    snippet: {
      title: 'Sun’iy Intellekt va Kelajak Dasturlash Texnologiyalari 2026',
      channelTitle: 'IT Park Uzbekistan',
      channelId: 'it-park-uz',
      publishedAt: '2025-05-18T16:00:00Z',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg' },
      },
      description: 'O‘zbekistonda IT sohasi va zamonaviy texnologiyalar rivojlanishi haqida maxsus ko‘rsatuv.',
    },
  },
  {
    id: 'e-ORhEE9VVg',
    snippet: {
      title: 'Taylor Swift - Blank Space (Official Music Video)',
      channelTitle: 'Taylor Swift',
      channelId: 'taylor-swift',
      publishedAt: '2024-04-10T08:00:00Z',
      thumbnails: {
        high: { url: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg' },
      },
      description: 'Taylor Swift Blank Space official music video.',
    },
  },
];

const emptyUserData = {
  history: [],
  watchLater: [],
  likedVideos: [],
  subscriptions: [],
};

const categories = [
  { id: 'all', label: 'Hammasi' },
  { id: 'music', label: 'Musiqa', apiId: '10' },
  { id: 'gaming', label: 'O‘yinlar', apiId: '20' },
  { id: 'entertainment', label: 'Ko‘ngilochar', apiId: '24' },
  { id: 'news', label: 'Yangiliklar', apiId: '25' },
  { id: 'sports', label: 'Sport', apiId: '17' },
  { id: 'education', label: 'Ta’lim', apiId: '27' },
  { id: 'live', label: 'Jonli efir', liveOnly: true },
];

function isLocalVideo(video) {
  return (
    video &&
    typeof video.id === 'string' &&
    /^[\w-]{11}$/.test(video.id) &&
    typeof video.snippet?.title === 'string' &&
    typeof video.snippet?.channelTitle === 'string'
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem(THEME_KEY) || 'light';
  });

  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = window.localStorage.getItem(ACCOUNTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultAccounts;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem(ACTIVE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultAccounts[0]; // Logged in with Azizbek by default
  });

  const [toasts, setToasts] = useState([]);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFaceAuthOpen, setIsFaceAuthOpen] = useState(false);
  const [faceAuthMode, setFaceAuthMode] = useState('verify');
  const [pendingAdminSection, setPendingAdminSection] = useState('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePage, setActivePage] = useState('home');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [videos, setVideos] = useState([]);
  const [localVideos, setLocalVideos] = useState([]);
  const [localVideoError, setLocalVideoError] = useState('');
  const [userData, setUserData] = useState(emptyUserData);
  const [userDataError, setUserDataError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminInitialSection, setAdminInitialSection] = useState('overview');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [miniPlayerVideo, setMiniPlayerVideo] = useState(null);

  // Sync theme to root DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    showToast(
      theme === 'dark' ? 'Yorug‘ mavzu yoqildi' : 'Qorong‘i mavzu yoqildi',
      'info'
    );
  };

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load saved local videos and user data
  useEffect(() => {
    try {
      const savedVideos = window.localStorage.getItem(LOCAL_VIDEOS_KEY);
      if (savedVideos) {
        const parsedVideos = JSON.parse(savedVideos);
        if (Array.isArray(parsedVideos) && parsedVideos.every(isLocalVideo)) {
          setLocalVideos(parsedVideos);
        }
      }
    } catch (storageError) {
      setLocalVideoError(`Saqlangan videolarni o‘qib bo‘lmadi: ${storageError.message}`);
    }

    try {
      const savedUserData = window.localStorage.getItem(USER_DATA_KEY);
      if (savedUserData) {
        const parsedUserData = JSON.parse(savedUserData);
        const validLists = ['history', 'watchLater', 'likedVideos', 'subscriptions'].every(
          (key) => Array.isArray(parsedUserData[key])
        );
        if (validLists) {
          setUserData({ ...emptyUserData, ...parsedUserData });
        }
      }
    } catch (storageError) {
      setUserDataError(`Profil ro‘yxatlarini o‘qib bo‘lmadi: ${storageError.message}`);
    }
  }, []);

  // Fetch videos from YouTube API (with robust fallback)
  useEffect(() => {
    const controller = new AbortController();
    const category = categories.find((item) => item.id === activeCategory) || categories[0];

    if (activePage !== 'home' && activePage !== 'shorts') {
      setVideos([]);
      setIsLoading(false);
      setError('');
      return () => controller.abort();
    }

    async function loadVideos() {
      setIsLoading(true);
      setError('');

      try {
        let results;
        if (activePage === 'shorts') {
          results = await searchVideos(searchQuery.trim(), controller.signal, {
            shortsOnly: true,
          });
        } else if (searchQuery.trim() || category.liveOnly) {
          results = await searchVideos(searchQuery.trim(), controller.signal, {
            categoryId: category.apiId,
            liveOnly: category.liveOnly,
          });
        } else {
          results = await getPopularVideos(controller.signal, category.apiId);
        }

        if (results && results.length > 0) {
          setVideos(results);
        } else {
          setVideos(fallbackSampleVideos);
        }
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          console.warn('API error, using sample videos:', requestError.message);
          setVideos(fallbackSampleVideos);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadVideos();
    return () => controller.abort();
  }, [activeCategory, activePage, searchQuery]);

  const handleAddVideo = (video) => {
    const updatedVideos = [video, ...localVideos];
    try {
      window.localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(updatedVideos));
      setLocalVideos(updatedVideos);
      setLocalVideoError('');
      showToast('Yangi video muvaffaqiyatli saqlandi!', 'success');
      return true;
    } catch (storageError) {
      setLocalVideoError(`Video saqlanmadi: ${storageError.message}`);
      return false;
    }
  };

  const saveUserData = (nextData) => {
    try {
      window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(nextData));
      setUserData(nextData);
      setUserDataError('');
      return true;
    } catch (storageError) {
      setUserDataError(`Profil ma’lumotlarini saqlab bo‘lmadi: ${storageError.message}`);
      return false;
    }
  };

  const toggleSavedVideo = (listName, video) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
    if (!videoId) return;

    const currentList = userData[listName];
    const alreadySaved = currentList.some(
      (item) => (typeof item.id === 'string' ? item.id : item.id?.videoId) === videoId
    );
    const updatedList = alreadySaved
      ? currentList.filter(
          (item) => (typeof item.id === 'string' ? item.id : item.id?.videoId) !== videoId
        )
      : [video, ...currentList];

    saveUserData({ ...userData, [listName]: updatedList });

    if (listName === 'likedVideos') {
      showToast(alreadySaved ? 'Yoqtirish bekor qilindi' : 'Videoga like bosildi 👍', 'success');
    }
  };

  const handleWatchVideo = (video) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
    if (!videoId) return;
    setSelectedVideo(video);
    const nextHistory = [
      video,
      ...userData.history.filter(
        (item) => (typeof item.id === 'string' ? item.id : item.id?.videoId) !== videoId
      ),
    ].slice(0, 50);
    saveUserData({ ...userData, history: nextHistory });
  };

  const handleToggleSubscription = (video) => {
    const channelId = video.snippet?.channelId;
    if (!channelId) return;
    const isSubscribed = userData.subscriptions.some((channel) => channel.id === channelId);
    const subscriptions = isSubscribed
      ? userData.subscriptions.filter((channel) => channel.id !== channelId)
      : [
          {
            id: channelId,
            title: video.snippet.channelTitle || 'YouTube kanali',
          },
          ...userData.subscriptions,
        ];
    saveUserData({ ...userData, subscriptions });
    showToast(
      isSubscribed ? 'Kanal obunasi bekor qilindi' : 'Kanalga obuna bo‘lindi ✓',
      'success'
    );
  };

  // Account management
  const handleSelectAccount = (account) => {
    setCurrentUser(account);
    try {
      window.localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(account));
    } catch {}
    showToast(`Xush kelibsiz, ${account.name}!`, 'success');
  };

  const handleCreateAccount = (newAccount) => {
    const updated = [newAccount, ...accounts];
    setAccounts(updated);
    setCurrentUser(newAccount);
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
      window.localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newAccount));
    } catch {}
    showToast(`Yangi hisob yaratildi: ${newAccount.name}!`, 'success');
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    const updatedList = accounts.map((acc) =>
      acc.email === updatedUser.email || acc.id === updatedUser.id ? updatedUser : acc
    );
    setAccounts(updatedList);
    try {
      window.localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedList));
    } catch {}
    showToast('Profil muvaffaqiyatli yangilandi ✓', 'success');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      window.localStorage.removeItem(ACTIVE_USER_KEY);
    } catch {}
    showToast('Hisobdan chiqildi', 'info');
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    if (page !== 'home' && page !== 'shorts') setSearchQuery('');
    if (page === 'home') {
      setActiveCategory('all');
      setSearchQuery('');
    }
  };

  const openAdminPanel = (section = 'overview') => {
    setPendingAdminSection(section);
    try {
      const registeredFace = window.localStorage.getItem('youtube-clone-admin-face-id');
      if (!registeredFace) {
        setFaceAuthMode('register');
      } else {
        setFaceAuthMode('verify');
      }
    } catch {
      setFaceAuthMode('register');
    }
    setIsFaceAuthOpen(true);
  };

  const handleFaceAuthSuccess = () => {
    setIsFaceAuthOpen(false);
    setAdminInitialSection(pendingAdminSection || 'overview');
    setIsAdminPanelOpen(true);
    showToast('Face ID tasdiqlandi! Admin panelga xush kelibsiz ✓', 'success');
  };

  const handleReRegisterFace = () => {
    setIsAdminPanelOpen(false);
    setFaceAuthMode('register');
    setIsFaceAuthOpen(true);
  };

  const visibleVideos = [
    ...localVideos.filter(
      (video) =>
        activeCategory === 'all' &&
        (!searchQuery.trim() ||
          `${video.snippet.title} ${video.snippet.channelTitle}`
            .toLocaleLowerCase()
            .includes(searchQuery.trim().toLocaleLowerCase()))
    ),
    ...videos,
  ];

  const pageLabels = {
    home:
      activeCategory === 'all'
        ? 'Bosh sahifa'
        : categories.find((c) => c.id === activeCategory)?.label || 'Videolar',
    shorts: 'YouTube Shorts',
    history: 'Ko‘rish tarixi',
    playlists: 'Pleylistlar',
    videos: 'Sizning videolaringiz',
    watchLater: 'Keyinroq ko‘rish',
    liked: 'Yoqtirilgan videolar',
    subscriptions: 'Obunalar',
  };

  const pageVideos = {
    history: userData.history,
    playlists: userData.watchLater,
    videos: localVideos,
    watchLater: userData.watchLater,
    liked: userData.likedVideos,
  };

  const isSavedCollectionPage = Object.prototype.hasOwnProperty.call(pageVideos, activePage);
  const visiblePageVideos = isSavedCollectionPage ? pageVideos[activePage] : visibleVideos;
  const pageTitle =
    searchQuery && (activePage === 'home' || activePage === 'shorts')
      ? `“${searchQuery}” uchun qidiruv natijalari`
      : pageLabels[activePage] || 'Videolar';

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <Header
        currentUser={currentUser}
        onOpenAdmin={() => openAdminPanel()}
        onOpenCreate={() => openAdminPanel('videos')}
        onOpenSignIn={() => setIsSignInModalOpen(true)}
        onSearch={(query) => {
          setSearchQuery(query);
          setActivePage('home');
          setActiveCategory('all');
        }}
        onToggleProfileMenu={() => setIsProfileMenuOpen((prev) => !prev)}
        onToggleSidebar={() => setSidebarExpanded((expanded) => !expanded)}
        sidebarExpanded={sidebarExpanded}
      />

      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          currentUser={currentUser}
          isExpanded={sidebarExpanded}
          onNavigate={handleNavigate}
          onOpenSignIn={() => setIsSignInModalOpen(true)}
          onSignOut={handleSignOut}
          subscriptions={userData.subscriptions}
        />

        <main className="video-content">
          <div className="video-content-header-row">
            <h1 className="page-title">{pageTitle}</h1>
            {isSavedCollectionPage && visiblePageVideos.length > 0 && (
              <span className="collection-counter-badge">
                {visiblePageVideos.length} ta video
              </span>
            )}
          </div>

          {activePage === 'home' && (
            <nav aria-label="Video kategoriyalari" className="category-bar">
              {categories.map((category) => (
                <button
                  aria-pressed={activeCategory === category.id}
                  className={`category-chip ${
                    activeCategory === category.id ? 'category-chip-active' : ''
                  }`}
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  type="button"
                >
                  {category.label}
                </button>
              ))}
            </nav>
          )}

          {activePage === 'shorts' ? (
            <ShortsFeed
              currentUser={currentUser}
              likedIds={userData.likedVideos.map((v) =>
                typeof v.id === 'string' ? v.id : v.id?.videoId
              )}
              onClose={() => handleNavigate('home')}
              onLike={(video) => toggleSavedVideo('likedVideos', video)}
              onOpenSignIn={() => setIsSignInModalOpen(true)}
              onShowToast={showToast}
              onSubscribe={handleToggleSubscription}
              shorts={visibleVideos.length > 0 ? visibleVideos : fallbackSampleVideos}
              subscribedIds={userData.subscriptions.map((c) => c.id)}
            />
          ) : (
            <>
              {activePage === 'subscriptions' && (
                <section aria-label="Obuna bo‘lgan kanallar" className="subscription-list">
                  {userData.subscriptions.length > 0 ? (
                    <div className="subscription-grid">
                      {userData.subscriptions.map((channel) => (
                        <div className="subscription-card" key={channel.id}>
                          <span className="subscription-channel-avatar">
                            {(channel.title || 'Y').slice(0, 1).toUpperCase()}
                          </span>
                          <div className="subscription-card-info">
                            <h4>{channel.title}</h4>
                            <span>Faol kanal</span>
                          </div>
                          <a
                            className="subscription-visit-btn"
                            href={`https://www.youtube.com/channel/${encodeURIComponent(channel.id)}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Kanalga o‘tish ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-box">
                      <div className="empty-state-icon">🔔</div>
                      <h3>Hozircha obuna bo‘lgan kanal yo‘q</h3>
                      <p>Video kartalaridagi “Obuna bo‘lish” tugmasi orqali kanallarni qo‘shing.</p>
                    </div>
                  )}
                </section>
              )}

              {userDataError && (
                <p className="video-message video-error" role="alert">
                  {userDataError}
                </p>
              )}

              {!isLoading && !error && activePage !== 'subscriptions' && visiblePageVideos.length === 0 && (
                <div className="empty-state-box">
                  <div className="empty-state-icon">📂</div>
                  <h3>
                    {activePage === 'watchLater' || activePage === 'playlists'
                      ? 'Keyinroq ko‘rish uchun video qo‘shilmagan'
                      : activePage === 'history'
                      ? 'Ko‘rish tarixi hozircha bo‘sh'
                      : activePage === 'liked'
                      ? 'Hali yoqtirilgan video yo‘q'
                      : activePage === 'videos'
                      ? 'Siz hali video qo‘shmagansiz'
                      : 'Video topilmadi'}
                  </h3>
                  <p>Bosh sahifaga qaytib yangi videolarni tomosha qiling.</p>
                  <button
                    type="button"
                    className="empty-state-cta-btn"
                    onClick={() => handleNavigate('home')}
                  >
                    Bosh sahifaga o‘tish
                  </button>
                </div>
              )}

              {activePage !== 'subscriptions' &&
                (visiblePageVideos.length > 0 || (isLoading && !isSavedCollectionPage)) && (
                  <VideoGrid
                    isLoading={isLoading && !isSavedCollectionPage}
                    isShorts={false}
                    likedIds={userData.likedVideos.map((v) =>
                      typeof v.id === 'string' ? v.id : v.id?.videoId
                    )}
                    onLike={(video) => toggleSavedVideo('likedVideos', video)}
                    onSave={(video) => toggleSavedVideo('watchLater', video)}
                    onSubscribe={handleToggleSubscription}
                    onWatch={handleWatchVideo}
                    savedIds={userData.watchLater.map((v) =>
                      typeof v.id === 'string' ? v.id : v.id?.videoId
                    )}
                    subscribedIds={userData.subscriptions.map((c) => c.id)}
                    videos={visiblePageVideos}
                  />
                )}
            </>
          )}
        </main>
      </div>

      {/* Profile Menu Dropdown / Drawer */}
      <ProfileMenu
        currentUser={currentUser}
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        onOpenStudio={(section) => openAdminPanel(section)}
        onOpenSwitchAccount={() => setIsSignInModalOpen(true)}
        onSignOut={handleSignOut}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      {/* Account Login / Switcher Modal */}
      <SignInModal
        accounts={accounts}
        currentAccount={currentUser}
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onCreateAccount={handleCreateAccount}
        onSelectAccount={handleSelectAccount}
      />

      {/* Admin Panel */}
      {isAdminPanelOpen && (
        <AdminPanel
          currentUser={currentUser}
          error={error}
          initialSection={adminInitialSection}
          isLoading={isLoading}
          localVideoError={localVideoError}
          localVideos={localVideos}
          onAddVideo={handleAddVideo}
          onClose={() => setIsAdminPanelOpen(false)}
          onReRegisterFace={handleReRegisterFace}
          onUpdateProfile={handleUpdateProfile}
          videos={[...localVideos, ...videos]}
        />
      )}

      {/* Face ID Biometric Authentication Modal */}
      <FaceAuthModal
        isOpen={isFaceAuthOpen}
        mode={faceAuthMode}
        onClose={() => setIsFaceAuthOpen(false)}
        onSuccess={handleFaceAuthSuccess}
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          allVideos={visibleVideos}
          currentUser={currentUser}
          isLiked={userData.likedVideos.some(
            (v) =>
              (typeof v.id === 'string' ? v.id : v.id?.videoId) ===
              (typeof selectedVideo.id === 'string' ? selectedVideo.id : selectedVideo.id?.videoId)
          )}
          isSaved={userData.watchLater.some(
            (v) =>
              (typeof v.id === 'string' ? v.id : v.id?.videoId) ===
              (typeof selectedVideo.id === 'string' ? selectedVideo.id : selectedVideo.id?.videoId)
          )}
          isSubscribed={userData.subscriptions.some(
            (c) => c.id === selectedVideo.snippet?.channelId
          )}
          key={
            typeof selectedVideo.id === 'string' ? selectedVideo.id : selectedVideo.id?.videoId
          }
          onClose={() => setSelectedVideo(null)}
          onMinimize={(v) => {
            setSelectedVideo(null);
            setMiniPlayerVideo(v);
          }}
          onLike={(v) => toggleSavedVideo('likedVideos', v)}
          onOpenSignIn={() => setIsSignInModalOpen(true)}
          onSave={(v) => toggleSavedVideo('watchLater', v)}
          onSelectVideo={(v) => setSelectedVideo(v)}
          onShowToast={showToast}
          onSubscribe={handleToggleSubscription}
          video={selectedVideo}
          videoId={
            typeof selectedVideo.id === 'string' ? selectedVideo.id : selectedVideo.id?.videoId
          }
        />
      )}

      {/* Floating Mini Player */}
      {miniPlayerVideo && (
        <MiniPlayer
          video={miniPlayerVideo}
          videoId={
            typeof miniPlayerVideo.id === 'string' ? miniPlayerVideo.id : miniPlayerVideo.id?.videoId
          }
          isLiked={userData.likedVideos.some(
            (v) =>
              (typeof v.id === 'string' ? v.id : v.id?.videoId) ===
              (typeof miniPlayerVideo.id === 'string' ? miniPlayerVideo.id : miniPlayerVideo.id?.videoId)
          )}
          onClose={() => setMiniPlayerVideo(null)}
          onExpand={() => {
            setSelectedVideo(miniPlayerVideo);
            setMiniPlayerVideo(null);
          }}
          onLike={(v) => toggleSavedVideo('likedVideos', v)}
        />
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Toast Notifications */}
      <Toast onDismiss={dismissToast} toasts={toasts} />
    </div>
  );
}
