import React from 'react';

export default function MiniPlayer({
  video,
  videoId,
  onExpand,
  onClose,
  isLiked = false,
  onLike,
}) {
  if (!video || !videoId) return null;

  const snippet = video.snippet || {};

  return (
    <div className="mini-player-container mini-player-animated" role="region" aria-label="Kichik pleyer">
      <div className="mini-player-video-wrap">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&enablejsapi=1`}
          title={snippet.title || 'Kichik video pleer'}
          className="mini-player-iframe"
        />

        {/* Hover overlay controls */}
        <div className="mini-player-controls-overlay">
          <button
            type="button"
            className="mini-ctrl-btn mini-expand-btn"
            onClick={onExpand}
            title="Kattalashtirish"
            aria-label="Kattalashtirish"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          <button
            type="button"
            className="mini-ctrl-btn mini-close-btn"
            onClick={onClose}
            title="Pleyerni yopish"
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mini-player-info-bar" onClick={onExpand} role="button" tabIndex={0}>
        <div className="mini-player-text">
          <h4 className="mini-player-title truncate" title={snippet.title}>
            {snippet.title || 'Video'}
          </h4>
          <span className="mini-player-channel truncate">
            {snippet.channelTitle || 'YouTube kanali'}
          </span>
        </div>

        <div className="mini-player-actions" onClick={(e) => e.stopPropagation()}>
          {onLike && (
            <button
              type="button"
              className={`mini-action-icon-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => onLike(video)}
              title={isLiked ? 'Yoqtirildi' : 'Like'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
          )}

          <button
            type="button"
            className="mini-action-icon-btn"
            onClick={onClose}
            title="Yopish"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
