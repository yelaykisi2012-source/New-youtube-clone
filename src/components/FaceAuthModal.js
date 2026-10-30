import React, { useEffect, useRef, useState, useCallback } from 'react';

const ADMIN_FACE_STORAGE_KEY = 'youtube-clone-admin-face-id';
const ADMIN_PIN_STORAGE_KEY = 'youtube-clone-admin-master-pin';
const DEFAULT_PIN = '2026';

// Helper: Extract face feature signature from canvas
function extractFaceFeatures(ctx, width, height) {
  const sampleSize = 32;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sampleSize;
  tempCanvas.height = sampleSize;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(ctx.canvas, 0, 0, width, height, 0, 0, sampleSize, sampleSize);

  const imgData = tempCtx.getImageData(0, 0, sampleSize, sampleSize).data;
  const signature = [];
  let totalBrightness = 0;

  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const gray = (r * 0.299 + g * 0.587 + b * 0.114);
    signature.push(gray);
    totalBrightness += gray;
  }

  const avgBrightness = totalBrightness / signature.length;
  // Normalize vector
  const normalized = signature.map((val) => val - avgBrightness);
  let normSum = 0;
  for (let i = 0; i < normalized.length; i++) {
    normSum += normalized[i] * normalized[i];
  }
  const norm = Math.sqrt(normSum) || 1;
  const vector = normalized.map((val) => val / norm);

  return { vector, avgBrightness };
}

// Helper: Calculate similarity between two face feature vectors (cosine similarity)
function calculateSimilarity(vectorA, vectorB) {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }
  // Cosine similarity in range [-1, 1], map to [0, 100]%
  return Math.max(0, Math.min(100, (dotProduct + 1) * 50));
}

export default function FaceAuthModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'verify', // 'verify' | 'register'
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'failed'
  const [statusMessage, setStatusMessage] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const [usePinFallback, setUsePinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Check if face is already registered in localStorage
  const getRegisteredFace = useCallback(() => {
    try {
      const data = localStorage.getItem(ADMIN_FACE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const [savedFaceData, setSavedFaceData] = useState(() => getRegisteredFace());

  useEffect(() => {
    if (!isOpen) return;
    const existing = getRegisteredFace();
    setSavedFaceData(existing);
    if (!existing) {
      setCurrentMode('register');
    } else {
      setCurrentMode(mode);
    }
    setScanStatus('idle');
    setMatchScore(0);
    setUsePinFallback(false);
    setPinInput('');
    setPinError('');
  }, [isOpen, mode, getRegisteredFace]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setStatusMessage(
        currentMode === 'register'
          ? 'Kameraga to‘g‘ri qarang va yuzingizni doira ichida tuting'
          : 'Yuz skanerlanmoqda...'
      );
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraActive(false);
      setCameraError('Kamera ulanmadi yoki ruxsat berilmadi. Zaxira PIN orqali kirishingiz mumkin.');
      setUsePinFallback(true);
    }
  }, [currentMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen && !usePinFallback) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, usePinFallback, startCamera, stopCamera]);

  // Capture face photo & vector from video stream
  const captureFaceData = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // Mirror horizontally for natural webcam feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const { vector, avgBrightness } = extractFaceFeatures(ctx, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    return { vector, avgBrightness, photoDataUrl };
  };

  // Register Face (1 time, lifetime persistence)
  const handleRegisterFace = () => {
    setScanStatus('scanning');
    setStatusMessage('Yuz biometrik ma’lumotlari tahlil qilinmoqda...');

    setTimeout(() => {
      const captured = captureFaceData();
      if (!captured || captured.avgBrightness < 20) {
        setScanStatus('failed');
        setStatusMessage('Yuz aniqlanmadi yoki yorug‘lik yetarli emas. Kameraga yaqinroq turing.');
        return;
      }

      const faceRecord = {
        registeredAt: new Date().toISOString(),
        photo: captured.photoDataUrl,
        vector: captured.vector,
      };

      try {
        localStorage.setItem(ADMIN_FACE_STORAGE_KEY, JSON.stringify(faceRecord));
        setSavedFaceData(faceRecord);
        setScanStatus('success');
        setStatusMessage('Admin yuzi muvaffaqiyatli ro‘yxatdan o‘tkazildi!');

        setTimeout(() => {
          stopCamera();
          onSuccess();
        }, 1200);
      } catch (err) {
        setScanStatus('failed');
        setStatusMessage(`Xatolik: ${err.message}`);
      }
    }, 900);
  };

  // Auto-scan / verify face on verify mode
  useEffect(() => {
    if (!isOpen || currentMode !== 'verify' || !cameraActive || scanStatus === 'success') return;

    const registered = savedFaceData || getRegisteredFace();
    if (!registered || !registered.vector) {
      setCurrentMode('register');
      return;
    }

    setScanStatus('scanning');
    setStatusMessage('Yuz skanerlanmoqda...');

    let attempts = 0;
    scanIntervalRef.current = setInterval(() => {
      attempts++;
      const live = captureFaceData();
      if (!live) return;

      const score = calculateSimilarity(registered.vector, live.vector);
      setMatchScore(Math.round(score));

      // Match threshold: > 62% similarity
      if (score >= 62 && live.avgBrightness >= 25) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
        setScanStatus('success');
        setStatusMessage(`Yuz tasdiqlandi! (${Math.round(score)}% moslik) Xush kelibsiz!`);

        setTimeout(() => {
          stopCamera();
          onSuccess();
        }, 1100);
      } else if (attempts >= 18) {
        // After ~10 seconds of scanning without match
        setScanStatus('failed');
        setStatusMessage('Yuz mos kelmadi! Faqat ro‘yxatdan o‘tgan admin yuzi bilan kirish mumkin.');
      }
    }, 550);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isOpen, currentMode, cameraActive, savedFaceData, getRegisteredFace, onSuccess, stopCamera, scanStatus]);

  // Master PIN verification handler
  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError('');
    const storedPin = localStorage.getItem(ADMIN_PIN_STORAGE_KEY) || DEFAULT_PIN;

    if (pinInput.trim() === storedPin) {
      setScanStatus('success');
      setStatusMessage('Master PIN to‘g‘ri! Xush kelibsiz.');
      setTimeout(() => {
        stopCamera();
        onSuccess();
      }, 700);
    } else {
      setPinError('Kiritilgan PIN noto‘g‘ri! (Standart PIN: 2026)');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="face-auth-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
      role="presentation"
    >
      <div className="face-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="face-auth-title">
        <button
          type="button"
          className="face-auth-close-btn"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          aria-label="Yopish"
        >
          ✕
        </button>

        <div className="face-auth-header">
          <div className="face-auth-icon-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <h2 id="face-auth-title">
            {currentMode === 'register' ? 'Admin Face ID Ro‘yxatdan O‘tish' : 'Admin Face ID Kirish'}
          </h2>
          <p className="face-auth-subtitle">
            {currentMode === 'register'
              ? 'Admin paneliga faqat sizning yuzingiz orqali kiriladi. Yuzingiz 1 marta saqlanadi va butun umr qoladi.'
              : 'Xavfsizlik: Admin paneliga kirish uchun ro‘yxatdan o‘tgan yuzingizni kameraga ko‘rsating.'}
          </p>
        </div>

        {!usePinFallback ? (
          <div className="face-scanner-container">
            {/* Live Camera View with Face ID Ring */}
            <div className={`face-scanner-viewport ${scanStatus}`}>
              <video
                ref={videoRef}
                playsInline
                muted
                className="face-scanner-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Animated Face Target Overlay */}
              <div className="face-target-frame">
                <div className="face-corner top-left" />
                <div className="face-corner top-right" />
                <div className="face-corner bottom-left" />
                <div className="face-corner bottom-right" />
                <div className={`face-laser-scanner ${scanStatus === 'scanning' ? 'active' : ''}`} />
                <div className="face-mesh-grid" />
              </div>

              {/* Status Indicator inside Viewport */}
              {scanStatus === 'success' && (
                <div className="face-result-overlay face-success-overlay">
                  <div className="success-checkmark-circle">✓</div>
                  <span>TASDIQLANDI</span>
                </div>
              )}

              {scanStatus === 'failed' && (
                <div className="face-result-overlay face-failed-overlay">
                  <div className="failed-x-circle">✕</div>
                  <span>MOS KELMADI</span>
                </div>
              )}
            </div>

            {/* Match Score & Status Info */}
            <div className="face-scan-feedback">
              {currentMode === 'verify' && matchScore > 0 && (
                <div className="match-score-bar-wrap">
                  <div className="match-score-labels">
                    <span>Yuz mosligi:</span>
                    <strong className={matchScore >= 62 ? 'score-high' : 'score-low'}>
                      {matchScore}%
                    </strong>
                  </div>
                  <div className="match-score-track">
                    <div
                      className={`match-score-fill ${matchScore >= 62 ? 'fill-high' : ''}`}
                      style={{ width: `${Math.min(100, matchScore)}%` }}
                    />
                  </div>
                </div>
              )}

              <p className={`face-status-text status-${scanStatus}`}>
                {statusMessage || 'Kameraga qarang...'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="face-scanner-actions">
              {currentMode === 'register' && (
                <button
                  type="button"
                  className="face-primary-btn"
                  onClick={handleRegisterFace}
                  disabled={!cameraActive || scanStatus === 'scanning'}
                >
                  <span className="btn-icon">📷</span>
                  Yuzni Ro‘yxatga Olish
                </button>
              )}

              {currentMode === 'verify' && scanStatus === 'failed' && (
                <button
                  type="button"
                  className="face-primary-btn"
                  onClick={() => {
                    setScanStatus('scanning');
                    setStatusMessage('Yuz qayta skanerlanmoqda...');
                  }}
                >
                  Qayta urinish ↻
                </button>
              )}

              <button
                type="button"
                className="face-secondary-btn"
                onClick={() => setUsePinFallback(true)}
              >
                PIN-kod orqali kirish
              </button>
            </div>
          </div>
        ) : (
          /* Emergency PIN Fallback */
          <form className="face-pin-form" onSubmit={handlePinSubmit}>
            <div className="pin-icon-wrap">🔑</div>
            <h3>Master PIN orqali kirish</h3>
            <p className="pin-description">
              Kamera ishlamasa yoki ruxsat berilmagan bo‘lsa, zaxira PIN-kodni kiriting:
            </p>

            <div className="pin-input-group">
              <input
                type="password"
                maxLength="8"
                autoFocus
                placeholder="PIN kod (standart: 2026)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="pin-code-input"
              />
            </div>

            {pinError && <p className="face-error-text">{pinError}</p>}
            {cameraError && <p className="face-warning-text">{cameraError}</p>}

            <div className="pin-actions">
              <button
                type="button"
                className="face-secondary-btn"
                onClick={() => setUsePinFallback(false)}
              >
                Kameraga qaytish
              </button>
              <button type="submit" className="face-primary-btn">
                Tasdiqlash va Kirish
              </button>
            </div>
          </form>
        )}

        <div className="face-auth-footer">
          <span className="face-security-note">
            🔒 Biometrik yuz shabloni faqat ushbu brauzerda xavfsiz saqlanadi
          </span>
        </div>
      </div>
    </div>
  );
}
