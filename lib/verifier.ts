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
      error: 'Invalid URL format. Please provide a valid HTTP or HTTPS website link.'
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
        error: `HTTP request failed with status code ${res.status} (${res.statusText})`
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
      sectionFoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'section#hero found';
    });

    if (!sectionMatched) {
      $('#hero').each((_, el) => {
        const tagName = el.type === 'tag' ? el.name.toLowerCase() : '';
        if (tagName === 'section') {
          sectionMatched = true;
          const text = $(el).text().trim();
          sectionFoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'section#hero found';
        } else {
          sectionFoundContent = `<${tagName} id="hero"> found (expected <section id="hero">)`;
        }
      });
    }

    // Target Criteria 2: h3 tag with id="enterprise-security"
    let h3Matched = false;
    let h3FoundContent: string | null = null;

    $('h3#enterprise-security, h3[id="enterprise-security"]').each((_, el) => {
      h3Matched = true;
      const text = $(el).text().trim();
      h3FoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'h3#enterprise-security found';
    });

    if (!h3Matched) {
      $('#enterprise-security').each((_, el) => {
        const tagName = el.type === 'tag' ? el.name.toLowerCase() : '';
        if (tagName === 'h3') {
          h3Matched = true;
          const text = $(el).text().trim();
          h3FoundContent = text ? (text.length > 60 ? text.substring(0, 60) + '...' : text) : 'h3#enterprise-security found';
        } else {
          h3FoundContent = `<${tagName} id="enterprise-security"> found (expected <h3 id="enterprise-security">)`;
        }
      });
    }

    const success = sectionMatched && h3Matched;

    let error = undefined;
    if (!success) {
      const failures: string[] = [];
      if (!sectionMatched) {
        failures.push(
          sectionFoundContent
            ? `Found element with id="hero" but it is not a <section> tag (${sectionFoundContent})`
            : `Missing <section id="hero"> element anywhere in HTML`
        );
      }
      if (!h3Matched) {
        failures.push(
          h3FoundContent
            ? `Found element with id="enterprise-security" but it is not an <h3> tag (${h3FoundContent})`
            : `Missing <h3 id="enterprise-security"> element anywhere in HTML`
        );
      }
      error = failures.join(' | ');
    }

    return {
      success,
      sectionMatched,
      h3Matched,
      sectionFoundContent,
      h3FoundContent,
      error,
      statusCode: res.status
    };

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      sectionMatched: false,
      h3Matched: false,
      sectionFoundContent: null,
      h3FoundContent: null,
      error: `Failed to fetch target website: ${errorMsg}`
    };
  }
}
