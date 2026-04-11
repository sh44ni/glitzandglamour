/**
 * Renders full HTML to PDF using headless Chrome when CHROME_PATH or PUPPETEER_EXECUTABLE_PATH is set.
 * Falls back to null so callers can surface a clear configuration error for production.
 */
export async function renderHtmlToPdfLetter(html: string): Promise<Uint8Array | null> {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
    if (!executablePath) {
        console.error('[htmlToPdf] Missing CHROME_PATH or PUPPETEER_EXECUTABLE_PATH — PDF generation is disabled.');
        return null;
    }
    try {
        const puppeteer = await import('puppeteer-core');
        const browser = await puppeteer.default.launch({
            executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
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
        console.error('[htmlToPdf]', e);
        return null;
    }
}
