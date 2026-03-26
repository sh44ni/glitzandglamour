/**
 * Rewrites old raw MinIO URLs to use the internal image proxy.
 * 
 * Old: http://31.97.236.172:9000/glitz-images/uploads/xxx.webp
 * New: /api/images/uploads/xxx.webp
 *
 * New uploads already use the proxy URL format, so this is only needed
 * for images saved before the proxy was introduced.
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    // Already a proxy URL or relative path — leave as-is
    if (url.startsWith('/api/images/') || url.startsWith('/')) return url;
    
    try {
        const parsed = new URL(url);
        // Match any MinIO host pattern: raw IP:9000, localhost:9000, etc.
        if (parsed.port === '9000' || parsed.hostname === '31.97.236.172') {
            // Strip the bucket prefix from the path: /glitz-images/uploads/... → uploads/...
            const bucket = process.env.MINIO_BUCKET || 'glitz-images';
            const pathWithoutBucket = parsed.pathname.replace(`/${bucket}/`, '');
            return `/api/images/${pathWithoutBucket}`;
        }
    } catch {
        // Not a valid URL, return as-is
    }
    return url;
}
