import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

const GlobalStyles = () => (
  <MuiGlobalStyles
    styles={{
      '*': { margin: 0, padding: 0, boxSizing: 'border-box' },
      'html, body': {
        fontFamily: '"Nunito", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        scrollBehavior: 'smooth',
      },
      '#root': { minHeight: '100vh' },

      /* ── Custom Scrollbar ── */
      '::-webkit-scrollbar': { width: '6px', height: '6px' },
      '::-webkit-scrollbar-track': { background: '#F4F6FA', borderRadius: '10px' },
      '::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(180deg, #F5A623 0%, #FFC107 100%)',
        borderRadius: '10px',
        '&:hover': { background: '#D4891A' },
      },

      /* ── Base interactions ── */
      'a, button, input, select, textarea': { transition: 'all 0.2s ease-in-out' },
      a: { textDecoration: 'none', color: 'inherit' },

      /* ═══════════════════════════════════
         ANIMATION KEYFRAMES
         ═══════════════════════════════════ */
      '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      '@keyframes fadeInFast': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      '@keyframes slideInLeft': {
        from: { opacity: 0, transform: 'translateX(-24px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      '@keyframes slideInRight': {
        from: { opacity: 0, transform: 'translateX(24px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      '@keyframes slideInUp': {
        from: { opacity: 0, transform: 'translateY(24px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      '@keyframes scaleIn': {
        from: { opacity: 0, transform: 'scale(0.85)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
      '@keyframes pulse': {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.06)' },
      },
      '@keyframes spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      '@keyframes shimmer': {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      '@keyframes bounce': {
        '0%, 100%': { transform: 'translateY(0)' },
        '40%': { transform: 'translateY(-8px)' },
        '60%': { transform: 'translateY(-4px)' },
      },
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-12px)' },
      },
      '@keyframes floatSlow': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-18px) rotate(4deg)' },
      },
      '@keyframes twinkle': {
        '0%, 100%': { opacity: 0.2, transform: 'scale(0.75)' },
        '50%': { opacity: 1, transform: 'scale(1.25)' },
      },
      '@keyframes wobble': {
        '0%': { transform: 'rotate(0deg)' },
        '15%': { transform: 'rotate(-8deg)' },
        '30%': { transform: 'rotate(7deg)' },
        '45%': { transform: 'rotate(-5deg)' },
        '60%': { transform: 'rotate(3deg)' },
        '75%': { transform: 'rotate(-2deg)' },
        '100%': { transform: 'rotate(0deg)' },
      },
      '@keyframes cloudDrift': {
        '0%': { transform: 'translateX(0px)' },
        '50%': { transform: 'translateX(20px)' },
        '100%': { transform: 'translateX(0px)' },
      },
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      '@keyframes starPop': {
        '0%': { transform: 'scale(0) rotate(-30deg)', opacity: 0 },
        '60%': { transform: 'scale(1.3) rotate(10deg)', opacity: 1 },
        '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      },
      '@keyframes progressFill': {
        from: { width: '0%' },
        to: { width: '100%' },
      },

      /* ══ Utility classes ══ */
      '.animate-fadeIn':     { animation: 'fadeIn 0.5s ease-out' },
      '.animate-scaleIn':    { animation: 'scaleIn 0.4s ease-out' },
      '.animate-slideInLeft':{ animation: 'slideInLeft 0.5s ease-out' },
      '.animate-slideInRight':{ animation: 'slideInRight 0.5s ease-out' },
      '.animate-slideInUp':  { animation: 'slideInUp 0.5s ease-out' },
      '.animate-pulse':      { animation: 'pulse 2s infinite' },
      '.animate-bounce':     { animation: 'bounce 1.2s infinite' },
      '.animate-float':      { animation: 'float 3s ease-in-out infinite' },
      '.animate-wobble':     { animation: 'wobble 0.8s ease-in-out' },
      '.animate-spin':       { animation: 'spin 2s linear infinite' },
    }}
  />
);

export default GlobalStyles;
