import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.API_INTERNAL_URL || 'http://127.0.0.1:8081';

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const path = segments ? segments.join('/') : '';
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_BASE}/api/${path}${url.search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      ...(hasBody ? { body: req.body, duplex: 'half' as const } : {}),
      signal: controller.signal,
    } as RequestInit & { duplex?: 'half' });

    const responseHeaders = new Headers(res.headers);
    // fetch may transparently decompress the body; do not forward stale framing headers.
    for (const name of ['content-encoding', 'content-length', 'transfer-encoding', 'connection']) {
      responseHeaders.delete(name);
    }

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 503,
        error: 'Backend Offline',
        message: 'Backend server yoniq emas',
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
