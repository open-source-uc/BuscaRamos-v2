import { NextResponse } from 'next/server';
import { generateRobotsTxt } from '@/lib/sitemap';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscaramos.com';
  const robotsTxt = generateRobotsTxt(baseUrl);

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    },
  });
}