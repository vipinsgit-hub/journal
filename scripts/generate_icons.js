import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Master SVG Emblem for PipLedger
const pipLedgerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <!-- Background Surface -->
  <rect width="512" height="512" rx="100" fill="#08090B"/>
  <rect x="8" y="8" width="496" height="496" rx="92" stroke="#272C35" stroke-width="8" stroke-opacity="0.8"/>
  
  <!-- Outer Glow Circle -->
  <circle cx="256" cy="256" r="210" fill="#12151A" stroke="#272C35" stroke-width="6"/>

  <!-- Financial Candlesticks / Trend Graphics -->
  <!-- Bullish Green Candlestick 1 -->
  <line x1="160" y1="210" x2="160" y2="350" stroke="#20C997" stroke-width="6" stroke-linecap="round"/>
  <rect x="148" y="240" width="24" height="80" rx="6" fill="#20C997"/>

  <!-- Bullish Green Candlestick 2 (Taller) -->
  <line x1="220" y1="160" x2="220" y2="340" stroke="#20C997" stroke-width="6" stroke-linecap="round"/>
  <rect x="208" y="190" width="24" height="110" rx="6" fill="#20C997"/>

  <!-- Sleek White Trend Upward Arrow Accent -->
  <path d="M140 330 L220 250 L290 280 L370 170" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M320 170 H370 V220" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Glowing Pip Dot -->
  <circle cx="370" cy="170" r="16" fill="#FFFFFF"/>
  <circle cx="370" cy="170" r="26" fill="#FFFFFF" fill-opacity="0.2"/>

  <!-- Letter P & Ledger Text Mark (Subtle Base) -->
  <text x="256" y="420" text-anchor="middle" fill="#969EAB" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="800" letter-spacing="6">PIPLEDGER</text>
</svg>
`;

// Maskable SVG with Extra Bleed Padding
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <!-- Full Background Safe Bleed Area -->
  <rect width="512" height="512" fill="#08090B"/>
  <circle cx="256" cy="256" r="230" fill="#12151A" stroke="#272C35" stroke-width="6"/>

  <!-- Candlesticks -->
  <line x1="160" y1="210" x2="160" y2="350" stroke="#20C997" stroke-width="6" stroke-linecap="round"/>
  <rect x="148" y="240" width="24" height="80" rx="6" fill="#20C997"/>

  <line x1="220" y1="160" x2="220" y2="340" stroke="#20C997" stroke-width="6" stroke-linecap="round"/>
  <rect x="208" y="190" width="24" height="110" rx="6" fill="#20C997"/>

  <path d="M140 330 L220 250 L290 280 L370 170" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M320 170 H370 V220" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>

  <circle cx="370" cy="170" r="16" fill="#FFFFFF"/>
  <circle cx="370" cy="170" r="26" fill="#FFFFFF" fill-opacity="0.2"/>

  <text x="256" y="420" text-anchor="middle" fill="#969EAB" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" letter-spacing="6">PIPLEDGER</text>
</svg>
`;

const publicDir = path.resolve('public');

async function main() {
  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), pipLedgerSvg.trim());

  // Generate PNGs
  const buffer = Buffer.from(pipLedgerSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  await sharp(buffer).resize(192, 192).toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(buffer).resize(512, 512).toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(buffer).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(buffer).resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(maskableBuffer).resize(192, 192).toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));
  await sharp(maskableBuffer).resize(512, 512).toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('✅ All PipLedger PWA icons generated successfully!');
}

main().catch(console.error);
