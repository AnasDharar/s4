import crypto from 'crypto';

export const MASTER_TARGET_IMAGE_URL = 'https://yrzpapmgpqpjofbhycbw.supabase.co/storage/v1/object/public/ctf-assets/MLSC%20LOGO.jpeg';
export const MASTER_TARGET_IMAGE_HASH = 'a74a8604f4f8ef07dcd1d4a10030fda7c1d84724668fac8fd59a753abc91a04c';
export const MASTER_TARGET_BYTE_SIZE = 57598;

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

// In-memory cache for master target hash
let cachedMasterHash: string = MASTER_TARGET_IMAGE_HASH;

async function getMasterImageHash(): Promise<string> {
  if (cachedMasterHash) return cachedMasterHash;
  try {
    const res = await fetch(MASTER_TARGET_IMAGE_URL, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      cachedMasterHash = crypto.createHash('sha256').update(buffer).digest('hex');
      return cachedMasterHash;
    }
  } catch (err) {
    console.warn('Could not refresh master target image hash:', err);
  }
  return MASTER_TARGET_IMAGE_HASH;
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
      masterHash: MASTER_TARGET_IMAGE_HASH,
      hashMatched: false,
      error: 'Invalid Image URL format. Please provide a valid HTTP or HTTPS link.'
    };
  }

  try {
    // 1. Fetch Master Target Hash
    const expectedHash = await getMasterImageHash();

    // 2. Fetch User's Deployed Azure Image
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
        masterHash: expectedHash,
        hashMatched: false,
        statusCode: res.status,
        error: `HTTP request failed with status code ${res.status} (${res.statusText})`
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

    let error = undefined;
    if (!success) {
      const failures: string[] = [];
      if (!isImageMime) {
        failures.push(`Invalid Content-Type "${contentType}". Expected an image format.`);
      }
      if (!hashMatched) {
        failures.push(
          `Image SHA-256 hash mismatch! Uploaded image hash (${userSha256Hash.substring(0, 16)}...) does not match master MLSC LOGO image (${expectedHash.substring(0, 16)}...).`
        );
      }
      error = failures.join(' | ');
    }

    return {
      success,
      isImageMime,
      contentType,
      byteSize,
      sha256Hash: userSha256Hash,
      masterHash: expectedHash,
      hashMatched,
      error,
      statusCode: res.status
    };

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      isImageMime: false,
      contentType: null,
      byteSize: 0,
      sha256Hash: '',
      masterHash: MASTER_TARGET_IMAGE_HASH,
      hashMatched: false,
      error: `Failed to fetch target image link: ${errorMsg}`
    };
  }
}
