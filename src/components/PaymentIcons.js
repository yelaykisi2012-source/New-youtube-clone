export function ClickLogo({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0073ff] to-[#0052cc] p-2 shadow-md shadow-blue-500/20 ${className}`}>
      <svg className="h-full w-full" fill="none" viewBox="0 0 52 52">
        <rect fill="none" height="52" rx="12" width="52" />
        {/* Click stylized typography and arrow */}
        <g fill="#FFFFFF">
          {/* C */}
          <path d="M12 21C12 18.2 14.2 16 17 16H18.5C19.3 16 20 16.7 20 17.5C20 18.3 19.3 19 18.5 19H17C15.9 19 15 19.9 15 21V31C15 32.1 15.9 33 17 33H18.5C19.3 33 20 33.7 20 34.5C20 35.3 19.3 36 18.5 36H17C14.2 36 12 33.8 12 31V21Z" />
          {/* L */}
          <path d="M22 17.5C22 16.7 22.7 16 23.5 16C24.3 16 25 16.7 25 17.5V33H27.5C28.3 33 29 33.7 29 34.5C29 35.3 28.3 36 27.5 36H23.5C22.7 36 22 35.3 22 34.5V17.5Z" />
          {/* I */}
          <path d="M31 17.5C31 16.7 31.7 16 32.5 16C33.3 16 34 16.7 34 17.5V34.5C34 35.3 33.3 36 32.5 36C31.7 36 31 35.3 31 34.5V17.5Z" />
          {/* Arrow cursor mark */}
          <path
            d="M36 20L43 26L36 32V28H39L36 25.5V20Z"
            fill="#FFD600"
          />
        </g>
        <circle cx="43" cy="26" fill="#FFD600" r="2.5" />
      </svg>
    </div>
  );
}

export function PaymeLogo({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#00d6b4] to-[#00a892] p-2 shadow-md shadow-teal-500/20 ${className}`}>
      <svg className="h-full w-full" fill="none" viewBox="0 0 52 52">
        <rect fill="none" height="52" rx="12" width="52" />
        {/* Payme signature card icon */}
        <g fill="#FFFFFF">
          <rect height="22" rx="4" stroke="#FFFFFF" strokeWidth="2.5" width="34" x="9" y="15" />
          <path d="M9 22H43" stroke="#FFFFFF" strokeWidth="2.5" />
          <rect fill="#FFFFFF" height="4" rx="1" width="6" x="14" y="27" />
          <circle cx="34" cy="29" fill="#00a892" r="2.5" />
          <circle cx="37" cy="29" fill="#FFFFFF" opacity="0.8" r="2.5" />
        </g>
      </svg>
    </div>
  );
}

export function CashIcon({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] to-[#047857] p-2 shadow-md shadow-emerald-500/20 ${className}`}>
      <svg className="h-full w-full" fill="none" viewBox="0 0 52 52">
        <rect fill="none" height="52" rx="12" width="52" />
        {/* Banknote back */}
        <rect
          fill="#34d399"
          height="20"
          opacity="0.6"
          rx="3"
          transform="rotate(-8 26 26)"
          width="32"
          x="10"
          y="16"
        />
        {/* Main Banknote front */}
        <rect
          fill="#FFFFFF"
          height="22"
          rx="3.5"
          stroke="#065f46"
          strokeWidth="1.5"
          width="36"
          x="8"
          y="17"
        />
        <rect
          fill="#ecfdf5"
          height="18"
          rx="2.5"
          width="32"
          x="10"
          y="19"
        />
        {/* Bill inner circle & patterns */}
        <circle cx="26" cy="28" fill="#10b981" r="5" />
        <circle cx="26" cy="28" fill="#ecfdf5" r="3.2" />
        <path d="M26 26V30M24.5 27H27.5M24.5 29H27.5" stroke="#047857" strokeLinecap="round" strokeWidth="1.2" />
        <circle cx="13" cy="22" fill="#059669" r="1.5" />
        <circle cx="39" cy="22" fill="#059669" r="1.5" />
        <circle cx="13" cy="34" fill="#059669" r="1.5" />
        <circle cx="39" cy="34" fill="#059669" r="1.5" />
      </svg>
    </div>
  );
}

export function TerminalIcon({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] p-2 shadow-md shadow-indigo-500/20 ${className}`}>
      <svg className="h-full w-full" fill="none" viewBox="0 0 52 52">
        <rect fill="none" height="52" rx="12" width="52" />
        {/* POS Terminal body */}
        <rect
          fill="#1e1b4b"
          height="36"
          rx="5"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          width="24"
          x="14"
          y="8"
        />
        {/* Terminal Screen */}
        <rect
          fill="#38bdf8"
          height="12"
          rx="2"
          width="18"
          x="17"
          y="12"
        />
        {/* Screen text line */}
        <line stroke="#0369a1" strokeLinecap="round" strokeWidth="1.5" x1="19" x2="33" y1="16" y2="16" />
        <line stroke="#0369a1" strokeLinecap="round" strokeWidth="1.5" x1="19" x2="28" y1="20" y2="20" />
        {/* Keypad */}
        <circle cx="19" cy="28" fill="#cbd5e1" r="1.2" />
        <circle cx="26" cy="28" fill="#cbd5e1" r="1.2" />
        <circle cx="33" cy="28" fill="#cbd5e1" r="1.2" />
        <circle cx="19" cy="32" fill="#cbd5e1" r="1.2" />
        <circle cx="26" cy="32" fill="#cbd5e1" r="1.2" />
        <circle cx="33" cy="32" fill="#cbd5e1" r="1.2" />
        <circle cx="19" cy="36" fill="#10b981" r="1.2" />
        <circle cx="26" cy="36" fill="#cbd5e1" r="1.2" />
        <circle cx="33" cy="36" fill="#ef4444" r="1.2" />
        {/* Inserted card */}
        <path
          d="M28 26L42 22C43.1 21.7 44.3 22.3 44.6 23.4L46 28"
          stroke="#f59e0b"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}
