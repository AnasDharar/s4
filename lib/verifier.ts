import * as cheerio from 'cheerio';

export interface VerificationResult {
  success: boolean;
  sectionMatched: boolean;
  h3Matched: boolean;
  sectionFoundContent: string | null;
  h3FoundContent: string | null;
  error?: string;
  statusCode?: number;
}

const GENERIC_FAILURE_MESSAGE = 'Verification failed. Please read the challenge instructions carefully and ensure your deployment meets all requirements.';

export async function verifyWebsite(targetUrl: string): Promise<VerificationResult> {
  // Normalize URL
  let parsedUrl: URL;
  try {
    let raw = targetUrl.trim();
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = 'http://' + raw;
    }
    parsedUrl = new URL(raw);
  } catch {
    return {
      success: false,
      sectionMatched: false,
      h3Matched: false,
      sectionFoundContent: null,
      h3FoundContent: null,
      error: GENERIC_FAILURE_MESSAGE
    };
  }

  // Domain check: Must be on azurewebsites.net (or localhost for local testing)
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAzure = hostname.endsWith('.azurewebsites.net') || hostname === 'azurewebsites.net';
  const isLocalTest = hostname === 'localhost' || hostname === '127.0.0.1';

  if (!isAzure && !isLocalTest) {
    return {
      success: false,
      sectionMatched: false,
      h3Matched: false,
      sectionFoundContent: null,
      h3FoundContent: null,
      error: GENERIC_FAILURE_MESSAGE
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CTF-Level1-Scanner/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        sectionMatched: false,
        h3Matched: false,
        sectionFoundContent: null,
        h3FoundContent: null,
        statusCode: res.status,
        error: GENERIC_FAILURE_MESSAGE
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Target Criteria 1: section tag with id="hero"
    let sectionMatched = false;
    let sectionFoundContent: string | null = null;

    $('section#hero, section[id="hero"]').each((_, el) => {
      sectionMatched = true;
      const text = $(el).text().trim();
      sectionFoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'present';
    });

    if (!sectionMatched) {
      $('#hero').each((_, el) => {
        const tagName = el.type === 'tag' ? el.name.toLowerCase() : '';
        if (tagName === 'section') {
          sectionMatched = true;
          const text = $(el).text().trim();
          sectionFoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'present';
        }
      });
    }

    // Target Criteria 2: h3 tag with id="enterprise-security"
    let h3Matched = false;
    let h3FoundContent: string | null = null;

    $('h3#enterprise-security, h3[id="enterprise-security"]').each((_, el) => {
      h3Matched = true;
      const text = $(el).text().trim();
      h3FoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'present';
    });

    if (!h3Matched) {
      $('#enterprise-security').each((_, el) => {
        const tagName = el.type === 'tag' ? el.name.toLowerCase() : '';
        if (tagName === 'h3') {
          h3Matched = true;
          const text = $(el).text().trim();
          h3FoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'present';
        }
      });
    }

    const success = sectionMatched && h3Matched;

    return {
      success,
      sectionMatched,
      h3Matched,
      sectionFoundContent,
      h3FoundContent,
      error: success ? undefined : GENERIC_FAILURE_MESSAGE,
      statusCode: res.status
    };

  } catch {
    return {
      success: false,
      sectionMatched: false,
      h3Matched: false,
      sectionFoundContent: null,
      h3FoundContent: null,
      error: GENERIC_FAILURE_MESSAGE
    };
  }
}
