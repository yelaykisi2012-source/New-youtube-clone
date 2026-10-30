import React, { useState } from 'react';

export default function ShareModal({ isOpen, onClose, videoId, videoTitle, onCopied }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !videoId) return null;

  const videoUrl = `https://youtu.be/${videoId}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(videoUrl).catch(() => {});
    setCopied(true);
    onCopied?.('Havola nusxalandi!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareServices = [
    {
      name: 'Telegram',
      icon: '✈️',
      color: '#229ED9',
      url: `https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(videoTitle || '')}`,
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${videoTitle || ''} ${videoUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: '🌐',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
    },
    {
      name: 'Twitter (X)',
      icon: '🐦',
      color: '#000000',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(videoTitle || '')}`,
    },
    {
      name: 'Email',
      icon: '✉️',
      color: '#ea4335',
      url: `mailto:?subject=${encodeURIComponent(videoTitle || 'YouTube Video')}&body=${encodeURIComponent(videoUrl)}`,
    },
  ];

  return (
    <div
      className="share-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="share-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <button
          type="button"
          className="share-modal-close"
          onClick={onClose}
          aria-label="Yopish"
        >
          ✕
        </button>
        <h3 id="share-title" className="share-modal-title">Ulashish</h3>

        <div className="share-social-grid">
          {shareServices.map((service) => (
            <a
              key={service.name}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="share-social-item"
            >
              <span className="share-social-icon" style={{ backgroundColor: service.color }}>
                {service.icon}
              </span>
              <span className="share-social-name">{service.name}</span>
            </a>
          ))}
        </div>

        <div className="share-link-box">
          <input
            type="text"
            readOnly
            value={videoUrl}
            className="share-link-input"
            onClick={(e) => e.target.select()}
          />
          <button
            type="button"
            className={`share-copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Nusxalandi ✓' : 'Nusxalash'}
          </button>
        </div>
      </div>
    </div>
  );
}
