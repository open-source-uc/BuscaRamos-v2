import { NextResponse } from 'next/server';
import { generateSitemap } from '@/lib/sitemap';
// Import your course data source here
// import coursesData from '@/data/cursos-simplificado.json';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscaramos.com';
    
    // For now, generate sitemap without course data 
    // In a real implementation, you would fetch this from your database
    const courses: any[] = []; // Replace with actual course data
    
    const sitemap = generateSitemap(baseUrl, courses);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}