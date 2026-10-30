import React, { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.video-content');
    if (!container) return;

    const handleScroll = () => {
      setVisible(container.scrollTop > 400);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('.video-content');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      className={`scroll-to-top-btn ${visible ? 'scroll-to-top-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Yuqoriga qaytish"
      type="button"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
