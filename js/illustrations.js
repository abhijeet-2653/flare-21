/* FLARE — flat two-ink print illustrations. No gradients, no gloss. */
window.ILLUS = (function () {
  function mascot(size = 96) {
    return `
    <svg class="mascot" width="${size}" height="${size}" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <g class="mascot-body">
        <path d="M70 12c7 22 33 27 36 51 3 26-15 45-36 45S31 89 34 63c3-18 21-25 27-41 1 8 5 11 9 15-1-9-1-17 0-25Z" fill="#E8451F" stroke="#181510" stroke-width="4.5" stroke-linejoin="round"/>
        <ellipse cx="70" cy="84" rx="20" ry="16" fill="#F1E8D7" stroke="#181510" stroke-width="3"/>
        <circle cx="61" cy="63" r="3.2" fill="#181510"/>
        <circle cx="79" cy="63" r="3.2" fill="#181510"/>
        <path d="M64 73c3.5 4 8.5 4 12 0" stroke="#181510" stroke-width="3" stroke-linecap="round"/>
        <path d="M62 83v6M70 83v6M78 83v6" stroke="#181510" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M42 78c-6 4-9 9-9 15M98 78c6 4 9 9 9 15" stroke="#181510" stroke-width="4" stroke-linecap="round"/>
      </g>
      <path d="M115 22l2.6 6.8 6.8 2.6-6.8 2.6L115 41l-2.6-6.8-6.8-2.6 6.8-2.6L115 22Z" fill="#E3A11C" stroke="#181510" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M24 40l1.8 4.8 4.8 1.8-4.8 1.8L24 53.2l-1.8-4.8-4.8-1.8 4.8-1.8L24 40Z" fill="#2F49D1" stroke="#181510" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`;
  }

  function trophy(size = 160) {
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path d="M100 14l6.4 16.4L123 37l-13 12.4L114 66l-14-8.8L86 66l4-16.6L77 37l16.6-6.6L100 14Z" fill="#FBF5E8" stroke="#181510" stroke-width="4" stroke-linejoin="round"/>
      <path d="M64 44h72v40c0 24-16 40-36 40S64 108 64 84V44Z" fill="#E3A11C" stroke="#181510" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 54H46c0 24 6 38 22 44M136 54h18c0 24-6 38-22 44" stroke="#181510" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 68l4 10.4 10.4 4-10.4 4L100 97l-4-10.6-10.4-4 10.4-4L100 68Z" fill="#181510"/>
      <rect x="92" y="122" width="16" height="18" fill="#E3A11C" stroke="#181510" stroke-width="4"/>
      <rect x="72" y="140" width="56" height="14" fill="#E3A11C" stroke="#181510" stroke-width="4"/>
      <rect x="66" y="154" width="68" height="12" fill="#181510"/>
      <circle cx="158" cy="34" r="6" fill="#E8451F"/>
      <path d="M36 92l2.6 7 7 2.6-7 2.6L36 111l-2.6-7-7-2.6 7-2.6L36 92Z" fill="#2F49D1" stroke="#181510" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`;
  }

  function orb21(size = 200, label = '21') {
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="106" cy="106" r="82" fill="#2F49D1"/>
      <circle cx="96" cy="96" r="80" fill="#E3A11C" stroke="#181510" stroke-width="5"/>
      <circle cx="96" cy="96" r="66" fill="none" stroke="#181510" stroke-width="2" stroke-dasharray="3 8" opacity=".55"/>
      <text x="96" y="121" text-anchor="middle" font-family="Archivo, Arial Black, sans-serif" font-size="74" font-weight="900" letter-spacing="-5" fill="#181510">${label}</text>
      <path d="M168 36l3 7.6 7.6 3-7.6 3-3 7.6-3-7.6-7.6-3 7.6-3 3-7.6Z" fill="#FBF5E8" stroke="#181510" stroke-width="2.4" stroke-linejoin="round"/>
    </svg>`;
  }

  function squiggle(color = '#E8451F') {
    return `<svg viewBox="0 0 160 40" fill="none" aria-hidden="true"><path d="M4 24c14-22 26 20 40-2s26 20 40-2 26 20 40-2 18 8 32 4" stroke="${color}" stroke-width="5" stroke-linecap="round"/></svg>`;
  }

  return { mascot, trophy, orb21, squiggle };
})();
