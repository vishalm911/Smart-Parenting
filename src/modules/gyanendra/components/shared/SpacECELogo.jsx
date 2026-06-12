/**
 * SpacECELogo — Official SpacECE brand logo component.
 *
 * SOURCE: src/assets/spaceece-logo.png  ← single source of truth.
 *         The image is NEVER cropped, stretched, rotated, or altered.
 *         All effects live in wrapper elements AROUND the image.
 *
 * ── Variants ──────────────────────────────────────────────────────────────
 *   "glass"    Frosted glassmorphism card + 3-D stars + sparkles + float
 *              → Use on: Landing / Login / Register pages
 *
 *   "sidebar"  Clean logo + subtle gold glow, gentle float, no card
 *              → Use on: Sidebar navigation
 *
 *   "header"   Bare logo + hairline glow filter, no animation
 *              → Use on: Mobile top-navbar
 *
 *   "bare"     Raw image only (backward-compatible default)
 *              → Use when full manual control is needed
 *
 * ── Other props ───────────────────────────────────────────────────────────
 *   width      number   Override pixel width (height scales automatically)
 *   style      object   Extra styles on the <img> element
 *   wrapStyle  object   Extra styles on the outermost wrapper
 *   className  string
 *   alt        string
 */

import logoSrc from '../../assets/spaceece-logo.png';

/* ── Glassmorphism card decoration data ─────────────────────────────────── */

/* 3-D golden stars + orange sparkle shapes orbiting the card */
const GLASS_DECOS = [
  /* corner stars */
  { ch: '⭐', top: -22, right: -18, size: '1.9rem', delay: '0s',   dur: '2.8s', anim: 'starPulse' },
  { ch: '⭐', bottom: -16, left: -20, size: '1.3rem', delay: '1.2s', dur: '3.5s', anim: 'starPulse' },
  { ch: '⭐', top: -12, left: -14,  size: '1rem',   delay: '0.6s', dur: '4.0s', anim: 'starPulse' },
  /* orange sparkle cross shapes */
  { ch: '✦',  left: -26, top: '38%', size: '1.5rem', color: '#FF8A3D', delay: '0.3s', dur: '3.1s', anim: 'twinkle' },
  { ch: '✦',  right: -24, top: '28%', size: '1.1rem', color: '#F5A623', delay: '1.0s', dur: '2.9s', anim: 'twinkle' },
  { ch: '✦',  right: -18, bottom: '18%', size: '0.8rem', color: '#FFB347', delay: '1.8s', dur: '3.7s', anim: 'twinkle' },
];

/* Auth-size (smaller card) decorations */
const AUTH_DECOS = [
  { ch: '⭐', top: -16, right: -14, size: '1.5rem', delay: '0s',   dur: '2.6s', anim: 'starPulse' },
  { ch: '⭐', bottom: -12, left: -16, size: '1.1rem', delay: '1.1s', dur: '3.4s', anim: 'starPulse' },
  { ch: '✦',  left: -20, top: '42%', size: '1.2rem', color: '#FF8A3D', delay: '0.4s', dur: '3.0s', anim: 'twinkle' },
  { ch: '✦',  right: -18, top: '30%', size: '0.9rem', color: '#F5A623', delay: '1.3s', dur: '2.8s', anim: 'twinkle' },
];

/* ── Bare sparkles (used for non-card contexts) ──────────────────────────── */
const BARE_SPARKLES = [
  { ch: '⭐', top: '-14px', right: '-10px', size: '1.1rem', delay: '0s',   dur: '2.5s' },
  { ch: '✨', top: '-8px',  left:  '-8px',  size: '0.9rem', delay: '0.8s', dur: '3.2s' },
  { ch: '💛', bottom: '-10px', right: '-6px', size: '0.8rem', delay: '1.4s', dur: '2.8s' },
  { ch: '🌟', bottom: '-6px',  left: '-12px', size: '0.75rem', delay: '0.4s', dur: '3.5s' },
];

/* ── Component ─────────────────────────────────────────────────────────── */
const SpacECELogo = ({
  variant   = 'bare',      // 'glass' | 'sidebar' | 'header' | 'bare'
  width     = 120,
  style     = {},
  wrapStyle = {},
  className,
  alt = 'SpacECE India Foundation',
  /* legacy props — honoured for backward compat */
  animated,
  glowing,
  showStars,
}) => {

  /* ── GLASS variant ─────────────────────────────────────────────────── */
  if (variant === 'glass') {
    /* Choose decoration density based on size */
    const decos    = width >= 140 ? GLASS_DECOS : AUTH_DECOS;
    /* Card padding scales with logo */
    const pad      = width >= 140 ? '22px 26px' : '16px 20px';
    const radius   = width >= 140 ? 28 : 22;

    return (
      <span
        className={className}
        style={{
          display: 'inline-block',
          position: 'relative',
          lineHeight: 0,
          /* The whole card floats */
          animation: 'logoFloat 4s ease-in-out infinite',
          ...wrapStyle,
        }}
      >
        {/* Outer ambient glow halo */}
        <span aria-hidden="true" style={{
          position: 'absolute',
          inset: '-30px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(245,166,35,0.18) 0%, transparent 65%)',
          animation: 'logoPulse 3.5s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Decoration: 3-D stars + sparkle crosses */}
        {decos.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top:    d.top    !== undefined ? d.top    : undefined,
              bottom: d.bottom !== undefined ? d.bottom : undefined,
              left:   d.left   !== undefined ? d.left   : undefined,
              right:  d.right  !== undefined ? d.right  : undefined,
              fontSize: d.size,
              color: d.color ?? undefined,
              animation: `${d.anim} ${d.dur} ease-in-out infinite`,
              animationDelay: d.delay,
              pointerEvents: 'none',
              zIndex: 3,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >{d.ch}</span>
        ))}

        {/* Glassmorphism card */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          padding: pad,
          borderRadius: `${radius}px`,
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1.5px solid rgba(255,255,255,0.88)',
          boxShadow: [
            '0 16px 48px rgba(31,58,104,0.12)',
            '0 4px 16px rgba(245,166,35,0.10)',
            'inset 0 1px 0 rgba(255,255,255,0.95)',
            'inset 0 -1px 0 rgba(255,255,255,0.40)',
          ].join(', '),
          lineHeight: 0,
          transition: 'box-shadow 0.35s ease, transform 0.35s ease',
        }}>
          {/* ══ THE OFFICIAL LOGO IMAGE — PIXELS NEVER MODIFIED ══ */}
          <img
            src={logoSrc}
            alt={alt}
            width={width}
            height="auto"
            draggable={false}
            style={{
              display: 'block',
              objectFit: 'contain',
              maxWidth: '100%',
              filter: 'drop-shadow(0 6px 16px rgba(245,166,35,0.22)) drop-shadow(0 2px 5px rgba(0,0,0,0.06))',
              ...style,
            }}
          />
        </span>
      </span>
    );
  }

  /* ── SIDEBAR variant ───────────────────────────────────────────────── */
  if (variant === 'sidebar') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-block',
          position: 'relative',
          lineHeight: 0,
          flexShrink: 0,
          animation: 'logoFloat 5s ease-in-out infinite',
          ...wrapStyle,
        }}
      >
        <img
          src={logoSrc}
          alt={alt}
          width={width}
          height="auto"
          draggable={false}
          style={{
            display: 'block',
            objectFit: 'contain',
            maxWidth: '100%',
            filter: 'drop-shadow(0 4px 12px rgba(245,166,35,0.24)) drop-shadow(0 1px 4px rgba(0,0,0,0.06))',
            ...style,
          }}
        />
      </span>
    );
  }

  /* ── HEADER variant ────────────────────────────────────────────────── */
  if (variant === 'header') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-block',
          lineHeight: 0,
          flexShrink: 0,
          ...wrapStyle,
        }}
      >
        <img
          src={logoSrc}
          alt={alt}
          width={width}
          height="auto"
          draggable={false}
          style={{
            display: 'block',
            objectFit: 'contain',
            maxWidth: '100%',
            filter: 'drop-shadow(0 2px 6px rgba(245,166,35,0.18))',
            ...style,
          }}
        />
      </span>
    );
  }

  /* ── BARE variant (default / legacy) ───────────────────────────────── */
  const doAnim   = animated  !== undefined ? animated  : true;
  const doGlow   = glowing   !== undefined ? glowing   : true;
  const doStars  = showStars !== undefined ? showStars : width >= 80;

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        position: 'relative',
        flexShrink: 0,
        lineHeight: 0,
        animation: doAnim ? 'logoFloat 4s ease-in-out infinite' : undefined,
        ...wrapStyle,
      }}
    >
      {doGlow && (
        <span aria-hidden="true" style={{
          position: 'absolute',
          inset: '-22px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(245,166,35,0.20) 0%, rgba(245,166,35,0) 68%)',
          animation: doAnim ? 'logoPulse 3s ease-in-out infinite' : undefined,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}
      <img
        src={logoSrc}
        alt={alt}
        width={width}
        height="auto"
        draggable={false}
        style={{
          display: 'block',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          maxWidth: '100%',
          filter: doGlow
            ? 'drop-shadow(0 8px 20px rgba(245,166,35,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.07))'
            : undefined,
          ...style,
        }}
      />
      {doStars && BARE_SPARKLES.map((s, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute',
          top: s.top, left: s.left, right: s.right, bottom: s.bottom,
          fontSize: s.size,
          animation: `starPulse ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
          pointerEvents: 'none',
          zIndex: 2,
          lineHeight: 1,
        }}>{s.ch}</span>
      ))}
    </span>
  );
};

export default SpacECELogo;
