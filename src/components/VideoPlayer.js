import React, { useEffect, useState, useRef } from 'react';
import ShareModal from './ShareModal';

const initialSampleComments = [
  {
    id: 'c1',
    author: 'Sanjarbek Olimov',
    authorAvatar: '',
    authorColor: '#2563eb',
    time: '2 kun oldin',
    text: 'Juda ajoyib video bo‘libdi! Ayniqsa tushuntirish uslubi juda sodda va ravon.',
    likes: 24,
    isLiked: false,
  },
  {
    id: 'c2',
    author: 'Dildora Karimova',
    authorAvatar: '',
    authorColor: '#db2777',
    time: '1 hafta oldin',
    text: 'Rahmat foydali ma’lumotlar uchun! Keyingi qismini intizorlik bilan kutamiz.',
    likes: 12,
    isLiked: false,
  },
  {
    id: 'c3',
    author: 'Bobur Mirzayev',
    authorAvatar: '',
    authorColor: '#059669',
    time: '3 hafta oldin',
    text: 'Kanalga yangi obuna bo‘ldim, sifat juda yuqori darajada ekan 👍',
    likes: 8,
    isLiked: false,
  },
];

const SPEED_OPTIONS = ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'];

export default function VideoPlayer({
  video,
  videoId,
  onClose,
  onMinimize,
  allVideos = [],
  onSelectVideo,
  isLiked = false,
  isSaved = false,
  isSubscribed = false,
  onLike,
  onSave,
  onSubscribe,
  currentUser = null,
  onOpenSignIn,
  onShowToast,
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [comments, setComments] = useState(initialSampleComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [likeCount, setLikeCount] = useState(1420);
  const [hasDisliked, setHasDisliked] = useState(false);

  // New features state
  const [isAmbientMode, setIsAmbientMode] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const settingsRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isShareOpen && !isSettingsOpen) onClose();
      if (event.key === 't' || event.key === 'T') {
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
          setIsTheaterMode((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isShareOpen, isSettingsOpen]);

  // Click outside to close settings popover
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleLikeClick = () => {
    if (!currentUser) {
      onShowToast?.('Videoga like bosish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }
    if (onLike) onLike(video);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    if (hasDisliked) setHasDisliked(false);
  };

  const handleDislikeClick = () => {
    if (!currentUser) {
      onShowToast?.('Fikr bildirish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }
    setHasDisliked((prev) => !prev);
    if (!hasDisliked && isLiked && onLike) {
      onLike(video);
      setLikeCount((prev) => prev - 1);
    }
  };

  const handleSaveClick = () => {
    if (!currentUser) {
      onShowToast?.('Videoni saqlash uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }
    if (onSave) {
      onSave(video);
      onShowToast?.(
        isSaved ? 'Video "Keyinroq ko‘rish"dan olib tashlandi' : 'Video "Keyinroq ko‘rish"ga qo‘shildi ✓',
        'success'
      );
    }
  };

  const handleSubscribeClick = () => {
    if (!currentUser) {
      onShowToast?.('Obuna bo‘lish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }
    if (onSubscribe) {
      onSubscribe(video);
      onShowToast?.(
        isSubscribed ? 'Kanal obunasi bekor qilindi' : 'Kanalga obuna bo‘lindi ✓',
        'success'
      );
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!currentUser) {
      onShowToast?.('Izoh qoldirish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      author: currentUser.name || 'Foydalanuvchi',
      authorAvatar: currentUser.avatarImage || '',
      authorColor: currentUser.color || '#2563eb',
      time: 'Hozirgina',
      text: newCommentText.trim(),
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    setIsInputFocused(false);
    onShowToast?.('Izohingiz muvaffaqiyatli qo‘shildi!', 'success');
  };

  const toggleCommentLike = (commentId) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  };

  const relatedVideos = allVideos
    .filter((v) => {
      const vId = typeof v.id === 'string' ? v.id : v.id?.videoId;
      return vId && vId !== videoId;
    })
    .slice(0, 8);

  const snippet = video.snippet || {};
  const thumbUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;

  return (
    <div className="video-player-backdrop video-player-backdrop-animated" onMouseDown={handleBackdropClick}>
      <section
        aria-label={`${snippet.title || 'Video'} pleeri`}
        aria-modal="true"
        className={`video-player-dialog video-player-dialog-large ${isTheaterMode ? 'theater-layout-active' : ''}`}
        role="dialog"
      >
        {/* Top Toolbar */}
        <div className="video-player-toolbar">
          <div className="player-toolbar-title-wrap">
            <span className="player-brand-icon">▶</span>
            <span className="player-toolbar-title truncate">{snippet.title || 'Video'}</span>
          </div>

          <div className="player-toolbar-actions">
            {/* Kinoteatr (Theater mode) toggle */}
            <button
              type="button"
              className={`video-player-toolbar-btn ${isTheaterMode ? 'active' : ''}`}
              onClick={() => setIsTheaterMode((prev) => !prev)}
              title={isTheaterMode ? 'Standart rejim (T)' : 'Kinoteatr rejimi (T)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="16" x2="22" y2="16" />
              </svg>
            </button>

            {/* Mini Player button */}
            {onMinimize && (
              <button
                type="button"
                className="video-player-toolbar-btn"
                onClick={() => onMinimize(video)}
                title="Kichik pleyer (Mini Player)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <rect x="11" y="11" width="8" height="8" rx="1" />
                </svg>
              </button>
            )}

            {/* Close button */}
            <button
              aria-label="Videoni yopish"
              className="video-player-close"
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={`video-player-main-layout ${isTheaterMode ? 'theater-mode-grid' : ''}`}>
          {/* Left Column: Video + Info + Comments */}
          <div className="video-player-primary-col">
            {/* Video Frame with Ambient Glow */}
            <div className={`video-ambient-wrapper ${isAmbientMode ? 'ambient-on' : ''}`}>
              {isAmbientMode && thumbUrl && (
                <div
                  className="video-ambient-glow"
                  style={{ backgroundImage: `url(${thumbUrl})` }}
                  aria-hidden="true"
                />
              )}
              <div className="video-player-frame">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
                  title={snippet.title || 'YouTube video pleeri'}
                />
              </div>
            </div>

            <h1 className="video-player-title">{snippet.title || 'Nomsiz video'}</h1>

            {/* Channel Bar & Action Buttons */}
            <div className="video-player-channel-bar">
              <div className="video-channel-info-group">
                <span className="video-channel-avatar">
                  {(snippet.channelTitle || 'Y').slice(0, 1).toUpperCase()}
                </span>
                <div className="video-channel-text">
                  <span className="video-channel-name">{snippet.channelTitle || 'YouTube kanali'}</span>
                  <span className="video-channel-sub-count">128K obunachi</span>
                </div>
                <button
                  type="button"
                  className={`player-subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                  onClick={handleSubscribeClick}
                >
                  {isSubscribed ? 'Obuna bo‘lindi ✓' : 'Obuna bo‘lish'}
                </button>
              </div>

              <div className="video-player-action-buttons">
                {/* Like / Dislike pill */}
                <div className="like-dislike-pill">
                  <button
                    type="button"
                    className={`like-btn ${isLiked ? 'active' : ''}`}
                    onClick={handleLikeClick}
                    title="Menga yoqdi"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span>{likeCount + (isLiked ? 1 : 0)}</span>
                  </button>
                  <div className="like-divider" />
                  <button
                    type="button"
                    className={`dislike-btn ${hasDisliked ? 'active' : ''}`}
                    onClick={handleDislikeClick}
                    title="Menga yoqmadi"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={hasDisliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                    </svg>
                  </button>
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  className="player-action-pill"
                  onClick={() => setIsShareOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Ulashish</span>
                </button>

                {/* Watch Later / Save */}
                <button
                  type="button"
                  className={`player-action-pill ${isSaved ? 'active' : ''}`}
                  onClick={handleSaveClick}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{isSaved ? 'Saqlangan ✓' : 'Keyinroq'}</span>
                </button>

                {/* Player Settings Gear (Ambient, Speed, Theater) */}
                <div className="player-settings-wrapper" ref={settingsRef}>
                  <button
                    type="button"
                    className={`player-action-pill player-gear-btn ${isSettingsOpen ? 'active' : ''}`}
                    onClick={() => setIsSettingsOpen((prev) => !prev)}
                    title="Pleyer sozlamalari"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </button>

                  {isSettingsOpen && (
                    <div className="player-settings-popover">
                      <h4>Pleyer sozlamalari</h4>

                      {/* Ambient Mode Toggle */}
                      <div className="player-setting-row" onClick={() => setIsAmbientMode((prev) => !prev)}>
                        <span>✨ Ambient Mode</span>
                        <div className={`toggle-pill ${isAmbientMode ? 'on' : ''}`}>
                          <div className="toggle-thumb" />
                        </div>
                      </div>

                      {/* Theater Mode Toggle */}
                      <div className="player-setting-row" onClick={() => setIsTheaterMode((prev) => !prev)}>
                        <span>🎬 Kinoteatr rejimi</span>
                        <div className={`toggle-pill ${isTheaterMode ? 'on' : ''}`}>
                          <div className="toggle-thumb" />
                        </div>
                      </div>

                      {/* Speed selector */}
                      <div className="player-speed-section">
                        <span className="speed-title">Tezlik: {playbackSpeed}</span>
                        <div className="speed-chips-grid">
                          {SPEED_OPTIONS.map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              className={`speed-chip ${playbackSpeed === spd ? 'active' : ''}`}
                              onClick={() => {
                                setPlaybackSpeed(spd);
                                onShowToast?.(`Tezlik ${spd} ga o‘rnatildi`, 'info');
                              }}
                            >
                              {spd}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Box */}
            <div className="video-player-description-box">
              <div className="description-stats-row">
                <span className="description-views">24,510 marta ko‘rilgan</span>
                <span className="description-dot">•</span>
                <span className="description-date">
                  {snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString('uz-UZ') : 'Yaqinda'}
                </span>
                {isAmbientMode && <span className="ambient-active-badge">✨ Ambient</span>}
              </div>
              <p className={`description-content ${descExpanded ? 'expanded' : ''}`}>
                {snippet.description || 'Ushbu video uchun qo‘shimcha tavsif berilmagan.'}
              </p>
              {snippet.description && snippet.description.length > 120 && (
                <button
                  type="button"
                  className="description-toggle-btn"
                  onClick={() => setDescExpanded((prev) => !prev)}
                >
                  {descExpanded ? 'Kamroq ko‘rsatish ▲' : 'Ko‘proq ko‘rsatish ▼'}
                </button>
              )}
            </div>

            {/* Comments Section */}
            <section className="video-player-comments-section" aria-label="Izohlar">
              <div className="comments-header">
                <h3>{comments.length} ta izoh</h3>
              </div>

              {/* Add Comment Input */}
              <form className="add-comment-form" onSubmit={handleAddComment}>
                {currentUser?.avatarImage ? (
                  <img
                    src={currentUser.avatarImage}
                    alt=""
                    className="comment-author-avatar comment-author-avatar-img"
                  />
                ) : (
                  <span
                    className="comment-author-avatar"
                    style={{ backgroundColor: currentUser?.color || '#64748b' }}
                  >
                    {currentUser?.initials || currentUser?.name?.slice(0, 1).toUpperCase() || 'U'}
                  </span>
                )}
                <div className="comment-input-wrap">
                  <input
                    type="text"
                    placeholder="Izoh qoldiring..."
                    value={newCommentText}
                    onFocus={() => setIsInputFocused(true)}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  />
                  {(isInputFocused || newCommentText) && (
                    <div className="comment-form-actions">
                      <button
                        type="button"
                        className="comment-cancel-btn"
                        onClick={() => {
                          setNewCommentText('');
                          setIsInputFocused(false);
                        }}
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="comment-submit-btn"
                        disabled={!newCommentText.trim()}
                      >
                        Izoh qoldirish
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Comments List */}
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt=""
                        className="comment-author-avatar comment-author-avatar-img"
                      />
                    ) : (
                      <span
                        className="comment-author-avatar"
                        style={{ backgroundColor: comment.authorColor }}
                      >
                        {comment.author.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author-name">{comment.author}</span>
                        <span className="comment-time">{comment.time}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <button
                          type="button"
                          className={`comment-like-btn ${comment.isLiked ? 'active' : ''}`}
                          onClick={() => toggleCommentLike(comment.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                          </svg>
                          <span>{comment.likes > 0 ? comment.likes : ''}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Related Videos */}
          {relatedVideos.length > 0 && (
            <aside className="video-player-sidebar-col" aria-label="Tavsiya etilgan videolar">
              <h3 className="related-videos-title">Tavsiya etilgan videolar</h3>
              <div className="related-videos-list">
                {relatedVideos.map((item) => {
                  const rId = typeof item.id === 'string' ? item.id : item.id?.videoId;
                  const rSnippet = item.snippet || {};
                  const rThumb = rSnippet.thumbnails?.medium?.url || rSnippet.thumbnails?.default?.url;

                  return (
                    <button
                      key={rId}
                      type="button"
                      className="related-video-card"
                      onClick={() => onSelectVideo?.(item)}
                    >
                      <div className="related-thumb-wrap">
                        {rThumb && <img src={rThumb} alt="" className="related-thumb-img" />}
                        <span className="related-duration">12:40</span>
                      </div>
                      <div className="related-info">
                        <h4 className="related-title truncate-2">{rSnippet.title || 'Nomsiz video'}</h4>
                        <span className="related-channel">{rSnippet.channelTitle}</span>
                        <span className="related-views">52K ko‘rildi</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        videoId={videoId}
        videoTitle={snippet.title}
        onCopied={(msg) => onShowToast?.(msg, 'success')}
      />
    </div>
  );
}
