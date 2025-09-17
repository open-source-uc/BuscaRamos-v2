import { CourseScore } from "@/types/types";

interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemap(baseUrl: string, courses: CourseScore[] = []): string {
  const urls: SitemapUrl[] = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/review`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Add course pages
  courses.forEach(course => {
    urls.push({
      url: `${baseUrl}/${course.sigle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    ${url.lastModified ? `<lastmod>${url.lastModified.toISOString()}</lastmod>` : ''}
    ${url.changeFrequency ? `<changefreq>${url.changeFrequency}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('')}
</urlset>`;

  return sitemap;
}

export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /

# Important pages
Allow: /
Allow: /*.css
Allow: /*.js
Allow: /favicon.ico
Allow: /sitemap.xml

# Disallow admin areas (if any)
Disallow: /api/
Disallow: /admin/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1`;
}