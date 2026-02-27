// Image storage using webdistt bucket
// POST https://storage.webdistt.com/api/buckets/lava/upload
// Form field: file

const STORAGE_BASE = 'https://storage.webdistt.com';
const BUCKET = 'lava';
const UPLOAD_URL = `${STORAGE_BASE}/api/buckets/${BUCKET}/upload`;

export type UploadResult = {
    url: string;
    filename: string;
    size: number;
};

/**
 * Upload a file to webdistt storage
 * @param file - File object from an <input type="file"> or FormData
 * @returns Public URL of the uploaded file
 */
export async function uploadImage(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const data = await res.json();

    // Normalize the response — webdistt returns URL in various formats
    const rawUrl: string = data.url || data.path || data.file || '';
    const url = rawUrl.startsWith('http') ? rawUrl : `${STORAGE_BASE}/${rawUrl.replace(/^\//, '')}`;

    return {
        url,
        filename: data.filename || file.name,
        size: data.size || file.size,
    };
}

/**
 * Upload from server-side using a Blob/Buffer
 * (for API routes that receive file via FormData)
 */
export async function uploadImageServer(file: Blob, filename: string): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file, filename);

    const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    const rawUrl: string = data.url || data.path || data.file || '';
    const url = rawUrl.startsWith('http') ? rawUrl : `${STORAGE_BASE}/${rawUrl.replace(/^\//, '')}`;

    return {
        url,
        filename: data.filename || filename,
        size: data.size || 0,
    };
}

export { UPLOAD_URL, BUCKET };
