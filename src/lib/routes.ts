export const BASE_URL = "https://buscaramos.osuc.dev";

export const ROUTES = {
  HOME: "/",
  CATALOG: "/catalog",
  REVIEWS: "/reviews",
  CURRICULUM: "/curriculum",
  SCHEDULE: "/schedule",
  CONTRIBUTORS: "/contributors",
  ABOUT: "https://osuc.dev/about/",
  CONDUCT: "https://osuc.dev/conduct/",
  CONTACT: "mailto:coord@osuc.dev",
  HELP: "mailto:help@osuc.dev",
  PROFILE: "/profile",
  OSUC: "https://osuc.dev/",
} as const;

export const HEADER_LINKS = [
  { label: "Catálogo", href: ROUTES.CATALOG },
  { label: "Reseñas", href: ROUTES.REVIEWS },
  { label: "Reseñas", href: ROUTES.REVIEWS },
  { label: "Horario", href: ROUTES.SCHEDULE },
  { label: "Contribuidores", href: ROUTES.CONTRIBUTORS },
];

export const FOOTER_SECTIONS = [
  {
    title: "Plataforma",
    links: [
      { label: "Inicio", href: ROUTES.HOME },
      { label: "Catálogo", href: ROUTES.CATALOG },
      { label: "Reseñas", href: ROUTES.REVIEWS },
      { label: "Contribuidores", href: ROUTES.CONTRIBUTORS },
    ],
  },
  {
    title: "Información OSUC",
    links: [
      { label: "Acerca de", href: ROUTES.ABOUT },
      { label: "Código de conducta", href: ROUTES.CONDUCT },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Contacto", href: ROUTES.CONTACT },
      { label: "Ayuda", href: ROUTES.HELP },
    ],
  },
];

export const FAQ_SECTIONS = [
  {
    title: "Sobre las Áreas de Formación General",
    href: "https://formaciongeneral.uc.cl/sobre-la-formacion-general/#conoce-las-%c3%a1reas-formativas",
    description: "Conoce las áreas de formación general y cómo se relacionan con los cursos.",
  },
  {
    title: "Preguntas Frecuentes",
    href: "https://registrosacademicos.uc.cl/informacion-para-estudiantes/inscripcion-y-retiro-de-cursos/preguntas-frecuentes/",
    description: "Resuelve tus dudas sobre los cursos: inscripciones, retiros y más.",
  },
  {
    title: "Inscripción de Cursos",
    href: "https://registration9.uc.cl/StudentRegistrationSsb/ssb/registration",
    description: "Añade o elimina clases según tu horario asignado por banner.",
  },
  {
    title: "Buscacursos UC",
    href: "https://buscacursos.uc.cl/",
    description: "La fuente oficial de la universidad para revisar la programación académica.",
  },
];
