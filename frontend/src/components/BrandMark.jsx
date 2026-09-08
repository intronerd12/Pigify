import React, { useId } from 'react'

const BrandMark = ({ size = 40, className = '' }) => {
  const uid = useId().replace(/:/g, '')
  const pigifyGradId = `pigify-grad-${uid}`
  const pigifyEarGradId = `pigify-ear-${uid}`
  const pigifyGlowId = `pigify-glow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
      aria-label="Pigify Swine Diagnostics Logo"
    >
      <defs>
        {/* Main Gradient Shield */}
        <linearGradient id={pigifyGradId} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb7185" />
          <stop offset="0.5" stopColor="#f43f5e" />
          <stop offset="1" stopColor="#be123c" />
        </linearGradient>

        {/* Inner Ear Highlights */}
        <linearGradient id={pigifyEarGradId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fecdd3" />
          <stop offset="1" stopColor="#fda4af" />
        </linearGradient>

        {/* Optic Telemetry Glow */}
        <radialGradient id={pigifyGlowId} cx="50%" cy="50%" r="50%">
          <stop stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Squircle Container with Precision Tech Border */}
      <rect x="4" y="4" width="56" height="56" rx="17" fill={`url(#${pigifyGradId})`} />
      <rect x="4" y="4" width="56" height="56" rx="17" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" />

      {/* Left Ear */}
      <path
        d="M16 26L12 15C17 14 22 17 24 21"
        fill="#fecdd3"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 23L14 17C16 16.5 19 18 20 20" fill="#fda4af" />

      {/* Right Ear */}
      <path
        d="M48 26L52 15C47 14 42 17 40 21"
        fill="#fecdd3"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M48 23L50 17C48 16.5 45 18 44 20" fill="#fda4af" />

      {/* Pig Head Contour */}
      <ellipse cx="32" cy="34" rx="19.5" ry="17.5" fill="#ffffff" />

      {/* Subtle Cheek Blush */}
      <ellipse cx="20" cy="37" rx="3.5" ry="2" fill="#fecdd3" opacity="0.8" />
      <ellipse cx="44" cy="37" rx="3.5" ry="2" fill="#fecdd3" opacity="0.8" />

      {/* Eyes */}
      <circle cx="23.5" cy="28.5" r="2.4" fill="#0f172a" />
      <circle cx="40.5" cy="28.5" r="2.4" fill="#0f172a" />
      {/* Eye Specular Highlights */}
      <circle cx="24.4" cy="27.6" r="0.9" fill="#ffffff" />
      <circle cx="41.4" cy="27.6" r="0.9" fill="#ffffff" />

      {/* Swine Snout */}
      <ellipse cx="32" cy="38" rx="9" ry="6.5" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.6" />
      {/* Nostrils */}
      <ellipse cx="28.7" cy="38" rx="1.8" ry="2.6" fill="#be123c" />
      <ellipse cx="35.3" cy="38" rx="1.8" ry="2.6" fill="#be123c" />

      {/* High-Tech Diagnostic AI Optic Crosshair (Top-Right) */}
      <circle cx="50" cy="14" r="7" fill={`url(#${pigifyGlowId})`} />
      <circle cx="50" cy="14" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="50" cy="14" r="1.5" fill="#ffffff" />
    </svg>
  )
}

export default BrandMark
