import React, { useState, useEffect, useCallback } from 'react';
import ShareModal from './ShareModal';

export default function ShortsFeed({
  shorts = [],
  onLike,
  onSubscribe,
  likedIds = [],
  subscribedIds = [],
  currentUser = null,
  onOpenSignIn,
  onShowToast,
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([
    { id: 'sc1', user: 'Aziz', text: 'Juda ajoyib video bo‘libdi 🔥', time: '1 soat oldin' },
    { id: 'sc2', user: 'Shaxnoza', text: 'Eng zo‘r qismini oxirida kutmagandim haha 😂', time: '3 soat oldin' },
    { id: 'sc3', user: 'Javohir', text: 'Buni do‘stlarimga ulashdim 👍', time: '5 soat oldin' },
  ]);
  const [newComment, setNewComment] = useState('');

  const currentShort = shorts[currentIndex] || shorts[0];
  const videoId = currentShort ? (typeof currentShort.id === 'string' ? currentShort.id : currentShort.id?.videoId) : null;
  const isLiked = videoId ? likedIds.includes(videoId) : false;
  const channelId = currentShort?.snippet?.channelId;
  const isSubscribed = channelId ? subscribedIds.includes(channelId) : false;

  const currentLikes = 48200 + (isLiked ? 1 : 0);

  const goToNext = useCallback(() => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
    setIsCommentsOpen(false);
  }, [currentIndex, shorts.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(shorts.length - 1);
    }
    setIsCommentsOpen(false);
  }, [currentIndex, shorts.length]);

  // Keyboard navigation: ArrowUp, ArrowDown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (!shorts || shorts.length === 0 || !currentShort) {
    return (
      <div className="shorts-empty-state">
        <p>Shorts videolari yuklanmoqda...</p>
      </div>
    );
  }

  const snippet = currentShort.snippet || {};

  const handleLikeClick = () => {
    if (!currentUser) {
      onShowToast?.('Videoga like bosish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }
    if (onLike) onLike(currentShort);
  };

  const handleSubscribeClick = () => {
    if (!currentUser) {
      onShowToast?.('Obuna bo‘lish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }
    if (onSubscribe) onSubscribe(currentShort);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      onShowToast?.('Izoh qoldirish uchun tizimga kiring', 'info');
      onOpenSignIn?.();
      return;
    }

    const c = {
      id: `sc-${Date.now()}`,
      user: currentUser.name || 'Foydalanuvchi',
      text: newComment.trim(),
      time: 'Hozirgina',
    };
    setComments([c, ...comments]);
    setNewComment('');
    onShowToast?.('Izohingiz qo‘shildi!', 'success');
  };

  return (
    <div className="shorts-feed-container">
      {/* Vertical Navigation Buttons */}
      <div className="shorts-nav-arrows">
        <button
          type="button"
          className="shorts-nav-btn shorts-prev-btn"
          onClick={goToPrev}
          title="Oldingi video (↑)"
          aria-label="Oldingi video"
        >
          ▲
        </button>
        <button
          type="button"
          className="shorts-nav-btn shorts-next-btn"
          onClick={goToNext}
          title="Keyingi video (↓)"
          aria-label="Keyingi video"
        >
          ▼
        </button>
      </div>

      <div className="shorts-player-card">
        {/* Vertical Video Viewport */}
        <div className="shorts-viewport">
          <iframe
            key={videoId}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&controls=0&loop=1&playlist=${encodeURIComponent(videoId)}&mute=${isMuted ? 1 : 0}`}
            title={snippet.title || 'Shorts video'}
            className="shorts-iframe"
          />

          {/* Sound toggle at top right */}
          <button
            type="button"
            className="shorts-sound-toggle"
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Bottom Info Overlay */}
          <div className="shorts-info-overlay">
            <div className="shorts-channel-row">
              <span className="shorts-channel-avatar">
                {(snippet.channelTitle || 'Y').slice(0, 1).toUpperCase()}
              </span>
              <span className="shorts-channel-name truncate">
                {snippet.channelTitle || '@kanal'}
              </span>
              <button
                type="button"
                className={`shorts-sub-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribeClick}
              >
                {isSubscribed ? 'Obuna bo‘lindi ✓' : 'Obuna bo‘lish'}
              </button>
            </div>

            <h3 className="shorts-title truncate-2">{snippet.title}</h3>

            <div className="shorts-audio-row">
              <span className="shorts-music-icon">🎵</span>
              <span className="shorts-audio-name truncate">Original audio - {snippet.channelTitle}</span>
              <div className="shorts-spinning-disc" />
            </div>
          </div>
        </div>

        {/* Action Sidebar on the Right */}
        <div className="shorts-actions-column">
          <button
            type="button"
            className={`shorts-action-circle-btn ${isLiked ? 'active' : ''}`}
            onClick={handleLikeClick}
          >
            <div className="circle-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
            <span className="action-count">{currentLikes > 1000 ? `${(currentLikes / 1000).toFixed(1)}K` : currentLikes}</span>
          </button>

          <button
            type="button"
            className="shorts-action-circle-btn"
            onClick={() => onShowToast?.('Menga yoqmadi deb belgilandi', 'info')}
          >
            <div className="circle-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
              </svg>
            </div>
            <span className="action-count">Yoqmadi</span>
          </button>

          <button
            type="button"
            className={`shorts-action-circle-btn ${isCommentsOpen ? 'active' : ''}`}
            onClick={() => setIsCommentsOpen((prev) => !prev)}
          >
            <div className="circle-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="action-count">{comments.length}</span>
          </button>

          <button
            type="button"
            className="shorts-action-circle-btn"
            onClick={() => setIsShareOpen(true)}
          >
            <div className="circle-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <span className="action-count">Ulashish</span>
          </button>

          <button
            type="button"
            className="shorts-action-circle-btn"
            onClick={() => {
              onShowToast?.('Musiqa saqlandi 🎵', 'success');
            }}
          >
            <div className="circle-icon">🎵</div>
            <span className="action-count">Musiqa</span>
          </button>
        </div>

        {/* Slide-in Comments Drawer for Shorts */}
        {isCommentsOpen && (
          <div className="shorts-comments-drawer">
            <div className="shorts-comments-header">
              <h4>{comments.length} ta izoh</h4>
              <button
                type="button"
                className="shorts-drawer-close"
                onClick={() => setIsCommentsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="shorts-comments-list">
              {comments.map((c) => (
                <div key={c.id} className="shorts-comment-item">
                  <span className="comment-user-avatar">{c.user.slice(0, 1).toUpperCase()}</span>
                  <div className="comment-user-content">
                    <span className="comment-user-name">{c.user}</span>
                    <p className="comment-user-text">{c.text}</p>
                    <span className="comment-user-time">{c.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form className="shorts-comment-input-form" onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Izoh qoldiring..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={!newComment.trim()}>
                Yuborish
              </button>
            </form>
          </div>
        )}
      </div>

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
