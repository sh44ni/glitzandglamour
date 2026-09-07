import fs from 'fs';

const FALLBACK_CHROME_PATHS = [
    // Linux
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function resolveChromeExecutable(): string | null {
    const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
    if (fromEnv && fs.existsSync(fromEnv)) {
        return fromEnv;
    }
    for (const p of FALLBACK_CHROME_PATHS) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return fromEnv || null;
}

/**
 * Renders full HTML to PDF using headless Chrome.
 * Resolves executablePath from env or automatically discovers Chrome/Chromium binaries on the host.
 * Falls back to null so callers can surface a clear configuration error.
 */
export async function renderHtmlToPdfLetter(html: string): Promise<Uint8Array | null> {
    const executablePath = resolveChromeExecutable();
    if (!executablePath) {
        console.error('[htmlToPdf] No Chrome/Chromium executable found on host. Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH.');
        return null;
    }
    try {
        const puppeteer = await import('puppeteer-core');
        const browser = await puppeteer.default.launch({
            executablePath,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--font-render-hinting=none',
            ],
        });
        try {
            const page = await browser.newPage();
            // networkidle0 often never resolves when the document pulls Google Fonts or other long-lived requests.
            await page.setContent(html, { waitUntil: 'load', timeout: 120_000 });
            try {
                await Promise.race([
                    page.evaluate(() => document.fonts.ready),
                    new Promise<void>((resolve) => setTimeout(resolve, 12_000)),
                ]);
            } catch {
                /* still print with fallback fonts */
            }
            const buf = await page.pdf({
                format: 'Letter',
                printBackground: true,
                preferCSSPageSize: true,
                margin: { top: '0.35in', right: '0.35in', bottom: '0.45in', left: '0.35in' },
            });
            return new Uint8Array(buf);
        } finally {
            await browser.close();
        }
    } catch (e) {
        console.error(`[htmlToPdf] Failed to generate PDF (executable: ${executablePath}):`, e);
        return null;
    }
}
