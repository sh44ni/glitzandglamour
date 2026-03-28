import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('casestudy', 'glitz-glamour-case-study-remastered (4).html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');

// Extract styles
const styleStart = rawHtml.indexOf('<style>');
const styleEnd = rawHtml.indexOf('</style>');
let css = rawHtml.substring(styleStart + 7, styleEnd);

css += `
/* ===================== RESPONSIVE OVERRIDES ===================== */
html, body { min-width: 0 !important; width: 100% !important; overflow-x: hidden; }
.page { width: 100% !important; max-width: 1920px; overflow-x: hidden; }
.hero { display: flex; flex-direction: column; min-height: auto; }
.hero-left { padding: 40px 24px; border-right: none; }
h1 { font-size: clamp(48px, 8vw, 96px); line-height: 1; }
.hero-bottom { grid-template-columns: 1fr; gap: 24px; padding-top: 24px; border-top: none; }
.hero-stat + .hero-stat { border-left: none; padding-left: 0; }
.hero-right { padding: 40px 24px; }
.section-inner { padding: 0 24px; width: 100%; box-sizing: border-box; }
.section-with-sidebar { display: flex; flex-direction: column; }
.section-sidebar { padding: 40px 0 20px 0; border-right: none; }
.section-body { padding: 20px 0 40px 0; }
.section-head-full { display: flex; flex-direction: column; gap: 24px; padding: 40px 0 32px; }
.grid-4, .grid-3, .two-col-even, .grid-2 { display: flex; flex-direction: column; gap: 24px; }
.timeline { display: flex; flex-direction: column; gap: 0; border-radius: 8px; }
.timeline-step { border-right: none; border-bottom: 1px solid var(--border); }
.timeline-step:last-child { border-bottom: none; }
.phone-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px; }
.accent-strip { padding: 40px 24px; text-align: center; }
.footer { flex-direction: column; gap: 24px; padding: 32px 24px; text-align: center; justify-content: center; }
.footer-left { justify-content: center; }

@media (min-width: 1024px) {
  .hero { display: grid; grid-template-columns: 1fr minmax(360px, 440px); }
  .hero-left { padding: 80px 72px; border-right: 1px solid var(--border); border-bottom: none; }
  .hero-bottom { grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border); padding-top: 36px; }
  .hero-stat + .hero-stat { border-left: 1px solid var(--border); padding-left: 32px; }
  .hero-right { padding: 56px 44px; }
  .section-inner { padding: 0 64px; }
  .section-with-sidebar { display: grid; grid-template-columns: 280px 1fr; }
  .section-sidebar { padding: 56px 40px 56px 0; border-right: 1px solid var(--border); }
  .section-body { padding: 56px 0 56px 56px; }
  .section-head-full { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .two-col-even { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .timeline { display: grid; grid-template-columns: repeat(4, 1fr); }
  .timeline-step { border-bottom: none; border-right: 1px solid var(--border); }
  .phone-row { display: grid; grid-template-columns: repeat(8, 1fr); }
  .accent-strip { padding: 56px 64px; text-align: left; }
  .footer { flex-direction: row; justify-content: space-between; }
  .footer-left { justify-content: flex-start; }
}

header, nav, footer#global-footer, .orb-container, #chatbot-widget, .chatbot-button, .bottom-nav-spacer, .cta-label {
  display: none !important;
}

body { background: #fafaf8 !important; }
`;

fs.writeFileSync(path.resolve('src', 'app', 'casestudy', 'user-styles.css'), css);

// Extract Main content
const mainStart = rawHtml.indexOf('<main class="page">');
const mainEnd = rawHtml.indexOf('</main>') + 7;
let mainHtml = rawHtml.substring(mainStart, mainEnd);

// Fix paths
mainHtml = mainHtml.replace(/data-src="screenshots\//g, 'data-src="/casestudy/');

const tsxContent = \`'use client';

import React, { useEffect } from 'react';
import './user-styles.css';

export default function CaseStudyPage() {
  useEffect(() => {
    document.querySelectorAll('[data-src]').forEach((el) => {
      const element = el as HTMLElement;
      const src = element.dataset.src;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        element.innerHTML = '';
        element.appendChild(img);
        element.classList.add('has-image');
        const body = element.closest('.screen-body') as HTMLElement;
        if (body) body.style.aspectRatio = 'unset';
      };
      img.src = src;
      img.alt = element.querySelector('strong')?.textContent || '';
    });
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: \`\${mainHtml}\` }} />
  );
}
\`;

fs.writeFileSync(path.resolve('src', 'app', 'casestudy', 'page.tsx'), tsxContent);

console.log('Migration complete.');
