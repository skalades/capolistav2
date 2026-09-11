import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3005';

export async function ANY(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = req.nextUrl.search;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('cookie');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${BACKEND_URL}/${path}${searchParams}`, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
    });

    const data = await res.blob();
    
    const resHeaders = new Headers(res.headers);
    resHeaders.delete('content-encoding');

    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse('Internal Server Error (Proxy)', { status: 500 });
  }
}

export const GET = ANY;
export const POST = ANY;
export const PUT = ANY;
export const PATCH = ANY;
export const DELETE = ANY;
