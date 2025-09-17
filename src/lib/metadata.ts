import { Metadata } from "next";

interface MetadataConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  course?: {
    sigle: string;
    name: string;
    school: string;
    campus: string[];
  };
}

const DEFAULT_METADATA = {
  title: "BuscaRamos - Encuentra y evalúa ramos UC",
  description: "Plataforma para buscar, evaluar y revisar ramos de la Universidad Católica. Encuentra información detallada sobre cursos, profesores y reseñas de estudiantes.",
  keywords: ["Universidad Católica", "UC", "ramos", "cursos", "reseñas", "estudiantes", "evaluaciones", "Chile"],
  image: "/og-image.png",
  url: "https://buscaramos.com"
};

export function generateMetadata(config: MetadataConfig = {}): Metadata {
  const title = config.title 
    ? `${config.title} | BuscaRamos` 
    : DEFAULT_METADATA.title;

  const description = config.description || DEFAULT_METADATA.description;
  const keywords = [...DEFAULT_METADATA.keywords, ...(config.keywords || [])];
  const canonical = config.canonical || DEFAULT_METADATA.url;
  const image = config.image || DEFAULT_METADATA.image;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "Open Source UC" }],
    creator: "Open Source UC",
    publisher: "Open Source UC",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(DEFAULT_METADATA.url),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "BuscaRamos",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "es_CL",
      type: config.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@opensourceuc",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateCourseMetadata(course: MetadataConfig['course']): Metadata {
  if (!course) return generateMetadata();

  const title = `${course.sigle} - ${course.name}`;
  const description = `Información y reseñas del curso ${course.sigle} - ${course.name} de ${course.school}. Campus: ${course.campus.join(", ")}. Encuentra evaluaciones de estudiantes y detalles del ramo.`;
  
  return generateMetadata({
    title,
    description,
    keywords: [course.sigle, course.name, course.school, ...course.campus],
    type: 'article',
  });
}

export function generateStructuredData(course?: MetadataConfig['course']) {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BuscaRamos",
    "description": DEFAULT_METADATA.description,
    "url": DEFAULT_METADATA.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${DEFAULT_METADATA.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  if (course) {
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": `${course.sigle} - ${course.name}`,
      "description": `Curso ${course.name} de la Universidad Católica`,
      "provider": {
        "@type": "Organization",
        "name": "Pontificia Universidad Católica de Chile",
        "url": "https://www.uc.cl"
      },
      "teaches": course.name,
      "courseCode": course.sigle,
      "educationalLevel": "UniversityLevel",
      "inLanguage": "es-CL"
    };
  }

  return baseData;
}