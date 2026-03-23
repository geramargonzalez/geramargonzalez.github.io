import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isAuthorizedAdmin } from '@/lib/auth';

function unauthorizedResponse(message = 'Authentication required') {
  return new NextResponse(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Analytics Dashboard"',
      'Cache-Control': 'no-store'
    }
  });
}

export function middleware(request: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    return new NextResponse('ADMIN_USER / ADMIN_PASSWORD are not configured.', {
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }

  if (!isAuthorizedAdmin(request.headers.get('authorization'))) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/analytics/:path*']
};