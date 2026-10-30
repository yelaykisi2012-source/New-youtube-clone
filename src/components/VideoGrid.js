import React from 'react';
import VideoCard from './VideoCard';

function SkeletonCard() {
  return (
    <div className="video-card skeleton-card" aria-hidden="true">
      <div className="video-thumbnail-container">
        <div className="skeleton-thumbnail skeleton-pulse" />
      </div>
      <div className="video-details-layout">
        <div className="skeleton-avatar skeleton-pulse" />
        <div className="video-details">
          <div className="skeleton-title skeleton-pulse" />
          <div className="skeleton-title skeleton-title-short skeleton-pulse" />
          <div className="skeleton-meta skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function VideoGrid({
  videos = [],
  isLoading = false,
  isShorts = false,
  likedIds = [],
  savedIds = [],
  subscribedIds = [],
  onWatch,
  onLike,
  onSave,
  onSubscribe,
}) {
  return (
    <section className="video-grid" aria-label="Videolar ro'yxati">
      {isLoading ? (
        Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
      ) : (
        videos.map((video) => {
          const id = typeof video.id === 'string' ? video.id : video.id?.videoId;
          return (
            <VideoCard
              key={id}
              video={video}
              videoId={id}
              isShort={isShorts}
              isLiked={likedIds.includes(id)}
              isSaved={savedIds.includes(id)}
              isSubscribed={subscribedIds.includes(video.snippet?.channelId)}
              onWatch={onWatch}
              onLike={onLike}
              onSave={onSave}
              onSubscribe={onSubscribe}
            />
          );
        })
      )}
    </section>
  );
}