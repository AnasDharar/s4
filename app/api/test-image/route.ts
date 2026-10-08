import { NextResponse } from 'next/server';
import { MASTER_TARGET_IMAGE_URL } from '@/lib/imageVerifier';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'valid';

  if (mode === 'invalid') {
    const invalidSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="red"/><text x="20" y="100" fill="white">INVALID IMAGE</text></svg>`;
    return new Response(invalidSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      }
    });
  }

  try {
    const res = await fetch(MASTER_TARGET_IMAGE_URL);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  } catch (err) {
    console.warn('Could not proxy master target image:', err);
  }

  return NextResponse.json({ error: 'Failed to load master test image' }, { status: 500 });
}
