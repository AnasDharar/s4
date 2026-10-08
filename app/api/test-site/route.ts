import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'valid';

  if (mode === 'invalid') {
    const invalidHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invalid Test Site</title>
  <style>
    body { font-family: sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; }
    .box { border: 1px red solid; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Sample Webpage (Non-Compliant)</h1>
    <p>This page is missing the required section id="hero" and h3 id="enterprise-security" tags.</p>
    <div id="hero-wrong">Wrong section tag</div>
    <h2 id="enterprise-security-wrong">Wrong h3 tag</h2>
  </div>
</body>
</html>`;
    return new Response(invalidHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const validHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enterprise Security Portal - Test Node</title>
  <style>
    body {
      margin: 0;
      background: #090d16;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .hero-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 16px;
      padding: 40px 60px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    h3 {
      color: #38bdf8;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px 0;
    }
  </style>
</head>
<body>
  <section id="hero" class="hero-card">
    <h3 id="enterprise-security">Enterprise Security Portal</h3>
    <p>Target web node containing compliant CTF Level 1 HTML tags.</p>
  </section>
</body>
</html>`;

  return new Response(validHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
