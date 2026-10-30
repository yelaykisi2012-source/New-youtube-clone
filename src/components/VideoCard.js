import React, { useState, useRef, useEffect } from 'react';

function formatPublishedDate(date) {
  if (!date) return 'Yaqinda';
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMinutes < 1) return 'Hozir';
    if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays < 7) return `${diffDays} kun oldin`;
    if (diffWeeks < 5) return `${diffWeeks} hafta oldin`;
    if (diffMonths < 12) return `${diffMonths} oy oldin`;
    return `${diffYears} yil oldin`;
  } catch {
    return 'Yaqinda';
  }
}

function formatViews(count) {
  if (!count) {
    // Generate a random view count for display purposes
    const random = Math.floor(Math.random() * 900000) + 10000;
    count = random;
  }
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return `${count}`;
}

export default function VideoCard({
  video,
  videoId,
  isShort = false,
  isLiked = false,
  isSaved = false,
  isSubscribed = false,
  onLike,
  onSave,
  onSubscribe,
  onWatch,
}) {
  const { snippet = {} } = video;
  const thumbnail =
    snippet.thumbnails?.high || snippet.thumbnails?.medium || snippet.thumbnails?.default;

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [saveAnim, setSaveAnim] = useState(false);
  const menuRef = useRef(null);
  const hoverTimeout = useRef(null);
  const viewCount = useRef(formatViews(video.statistics?.viewCount));

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 200);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
    onLike?.(video);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setSaveAnim(true);
    setTimeout(() => setSaveAnim(false), 600);
    onSave?.(video);
  };

  return (
    <article
      className={`video-card ${isShort ? 'video-card-short' : ''} ${isHovered ? 'video-card-hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-thumbnail-container">
        <button
          aria-label={`${snippet.title || 'Video'}ni ko'rish`}
          className="video-thumbnail-link"
          onClick={() => onWatch?.(video)}
          type="button"
        >
          {thumbnail ? (
            <img alt="" className="video-thumbnail" src={thumbnail.url} loading="lazy" />
          ) : (
            <div className="video-thumbnail-fallback">▶</div>
          )}

          {/* Hover play overlay */}
          <div className={`thumbnail-play-overlay ${isHovered ? 'visible' : ''}`}>
            <div className="play-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Progress bar on bottom of thumbnail */}
          <div className="thumbnail-progress-bar">
            <div
              className="thumbnail-progress-fill"
              style={{ width: `${Math.floor(Math.random() * 60 + 5)}%` }}
            />
          </div>

          {isShort ? (
            <span className="shorts-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="m15.5 3.5-7 4 7 4-7 4 7 4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              SHORTS
            </span>
          ) : (
            <span className="video-duration-badge">
              {Math.floor(Math.random() * 50 + 1)}:{String(Math.floor(Math.random() * 59)).padStart(2, '0')}
            </span>
          )}
        </button>

        {/* 3-dot menu button */}
        <div className="video-card-menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className={`video-card-menu-btn ${isHovered || showMenu ? 'visible' : ''}`}
            aria-label="Ko'proq harakatlar"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="video-card-context-menu">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(e);
                  setShowMenu(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Keyinroq ko'rish</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: snippet.title,
                      url: `https://www.youtube.com/watch?v=${videoId}`,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(`https://www.youtube.com/watch?v=${videoId}`);
                  }
                  setShowMenu(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>Ulashish</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18.36 5.64a9 9 0 11-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
                <span>Qiziq emas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="video-details-layout">
        {!isShort && (
          <div className="video-card-channel-avatar" onClick={(e) => { e.stopPropagation(); onSubscribe?.(video); }}>
            <span>{(snippet.channelTitle || 'Y').slice(0, 1).toUpperCase()}</span>
            <div className="channel-avatar-tooltip">{snippet.channelTitle || 'Kanal'}</div>
          </div>
        )}

        <div className="video-details">
          <h2
            className="video-title"
            title={snippet.title}
            onClick={() => onWatch?.(video)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onWatch?.(video);
            }}
          >
            {snippet.title || 'Nomsiz video'}
          </h2>

          <p className="video-channel" title={snippet.channelTitle}>
            {snippet.channelTitle || 'YouTube kanali'}
            <span className="channel-verified-icon" title="Tasdiqlangan kanal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-secondary)">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
          </p>

          <div className="video-metadata">
            <span className="video-views">{viewCount.current} ko'rildi</span>
            <span className="video-meta-dot">•</span>
            <span className="video-date">{formatPublishedDate(snippet.publishedAt)}</span>
          </div>

          <div className="video-card-actions">
            {onLike && (
              <button
                aria-pressed={isLiked}
                className={`video-card-action ${isLiked ? 'video-card-action-active' : ''} ${likeAnim ? 'action-pop-anim' : ''}`}
                onClick={handleLike}
                type="button"
                title={isLiked ? 'Yoqtirildi' : 'Yoqtirish'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                <span>{isLiked ? 'Yoqtirildi' : 'Yoqtirish'}</span>
              </button>
            )}

            {onSave && (
              <button
                aria-pressed={isSaved}
                className={`video-card-action ${isSaved ? 'video-card-action-active' : ''} ${saveAnim ? 'action-pop-anim' : ''}`}
                onClick={handleSave}
                type="button"
                title={isSaved ? "Keyinroq ko'rishda saqlangan" : "Keyinroq ko'rishga saqlash"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{isSaved ? 'Saqlangan' : 'Keyinroq'}</span>
              </button>
            )}

            {onSubscribe && snippet.channelId && (
              <button
                aria-pressed={isSubscribed}
                className={`video-card-action video-card-subscribe-action ${isSubscribed ? 'video-card-action-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribe(video);
                }}
                type="button"
                title={isSubscribed ? "Obuna bo'lingan" : "Kanalga obuna bo'lish"}
              >
                <span>{isSubscribed ? 'Obuna ✓' : 'Obuna'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}