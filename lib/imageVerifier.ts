import crypto from 'crypto';

// The correct answer for Level 2 is GZRS
export const MASTER_TARGET_IMAGE_URL = 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/GZRS.png';

export interface ImageVerificationResult {
  success: boolean;
  isImageMime: boolean;
  contentType: string | null;
  byteSize: number;
  sha256Hash: string;
  masterHash: string;
  hashMatched: boolean;
  error?: string;
  statusCode?: number;
}

const GENERIC_FAILURE_MESSAGE = 'Verification failed. Please read the challenge instructions carefully and ensure your deployment meets all requirements.';

// Cache the master image hash at runtime (computed on first verification)
let cachedMasterHash: string = '';

async function getMasterImageHash(): Promise<string> {
  if (cachedMasterHash) return cachedMasterHash;
  try {
    const res = await fetch(MASTER_TARGET_IMAGE_URL, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      cachedMasterHash = crypto.createHash('sha256').update(buffer).digest('hex');
      console.log('[Level2] Master image hash computed:', cachedMasterHash);
      return cachedMasterHash;
    }
  } catch (err) {
    console.warn('Could not fetch master target image for hashing:', err);
  }
  return '';
}

export async function verifyTargetImage(userImageUrl: string): Promise<ImageVerificationResult> {
  let parsedUrl: URL;
  try {
    let raw = userImageUrl.trim();
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = 'http://' + raw;
    }
    parsedUrl = new URL(raw);
  } catch {
    return {
      success: false,
      isImageMime: false,
      contentType: null,
      byteSize: 0,
      sha256Hash: '',
      masterHash: '',
      hashMatched: false,
      error: GENERIC_FAILURE_MESSAGE
    };
  }

  // Domain check: Must be on blob.core.windows.net (or localhost for local testing)
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAzureBlob = hostname.endsWith('.blob.core.windows.net') || hostname === 'blob.core.windows.net';
  const isLocalTest = hostname === 'localhost' || hostname === '127.0.0.1';

  if (!isAzureBlob && !isLocalTest) {
    return {
      success: false,
      isImageMime: false,
      contentType: null,
      byteSize: 0,
      sha256Hash: '',
      masterHash: '',
      hashMatched: false,
      error: GENERIC_FAILURE_MESSAGE
    };
  }

  try {
    // Get master image hash (computed from GZRS.png on first call, then cached)
    const expectedHash = await getMasterImageHash();
    if (!expectedHash) {
      console.error('[Level2] Failed to compute master image hash — cannot verify.');
      return {
        success: false,
        isImageMime: false,
        contentType: null,
        byteSize: 0,
        sha256Hash: '',
        masterHash: '',
        hashMatched: false,
        error: GENERIC_FAILURE_MESSAGE
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CTF-Level2-ImageVerifier/1.0',
        'Accept': 'image/*, */*'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        isImageMime: false,
        contentType: null,
        byteSize: 0,
        sha256Hash: '',
        masterHash: '',
        hashMatched: false,
        statusCode: res.status,
        error: GENERIC_FAILURE_MESSAGE
      };
    }

    const contentType = res.headers.get('content-type') || '';
    const isImageMime = contentType.startsWith('image/') || contentType.includes('octet-stream');

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const byteSize = buffer.length;

    // Calculate SHA-256 fingerprint of participant's uploaded image
    const userSha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Compare with master image hash (case-insensitive)
    const hashMatched = userSha256Hash.toLowerCase() === expectedHash.toLowerCase();

    const success = isImageMime && hashMatched;

    return {
      success,
      isImageMime,
      contentType,
      byteSize,
      sha256Hash: userSha256Hash,
      masterHash: expectedHash,
      hashMatched,
      error: success ? undefined : GENERIC_FAILURE_MESSAGE,
      statusCode: res.status
    };

  } catch {
    return {
      success: false,
      isImageMime: false,
      contentType: null,
      byteSize: 0,
      sha256Hash: '',
      masterHash: '',
      hashMatched: false,
      error: GENERIC_FAILURE_MESSAGE
    };
  }
}
