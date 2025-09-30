# BuscaRamos v2

BuscaRamos es una plataforma para explorar cursos y recursos universitarios, permitiendo a los estudiantes buscar, revisar y compartir opiniones sobre ramos académicos.

Construido con **Next.js 15**, **Tailwind CSS v4**, y desplegado en **Cloudflare Pages** con integración a **Cloudflare D1 y R2** para la base de datos.

## 🚀 Características

- ✨ **Catálogo completo de cursos** con información detallada
- 📝 **Sistema de reseñas** para compartir experiencias de estudiantes
- 🔍 **Búsqueda avanzada** con filtros y ordenamiento
- 📱 **Diseño responsive** optimizado mobile-first
- ⚡ **Rendimiento optimizado** con Next.js 15 y Turbopack
- 🌐 **SEO optimizado** con meta tags dinámicos y structured data
- 🔒 **Autenticación** integrada
- ♿ **Accesibilidad** siguiendo estándares web

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15 con App Router
- **Estilos:** Tailwind CSS v4 con breakpoints personalizados (`tablet:`, `desktop:`)
- **Base de datos:** Cloudflare D1 (SQLite)
- **Deployment:** Cloudflare Pages
- **TypeScript:** Tipado estático completo
- **UI Components:** Radix UI + shadcn/ui
- **Búsqueda:** Fuse.js para búsqueda fuzzy
- **Validación:** Zod

## 📋 Prerrequisitos

- **Node.js** 22+
- **npm**, **yarn**, **pnpm** o **bun**
- **Cuenta de Cloudflare** (para deployment y base de datos)
- **Wrangler CLI** instalado globalmente: `npm install -g wrangler`

## ⚙️ Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/open-source-uc/BuscaRamos-v2.git
cd BuscaRamos-v2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Cloudflare

#### Configurar base de datos D1

```bash
npm run dev
```

```bash
# Los datos deben ser solicitados
bash ./migration/load-backup.sh
```

### 4. Variables de entorno

Crear archivo `.env.local`:

```env
# Configuración local para desarrollo
API_SECRET=ALGO_MUY_SECRETO
```

### 5. Desarrollo local

```bash
# Modo desarrollo con Turbopack
npm run dev

# Desarrollo con preview de Cloudflare Pages
npm run preview
```

Abrir [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📦 Scripts Disponibles

| Script                | Descripción                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Servidor de desarrollo con Turbopack |
| `npm run build`       | Build de producción                  |
| `npm run start`       | Servidor de producción local         |
| `npm run lint`        | Ejecutar ESLint                      |
| `npm run lint:fix`    | Ejecutar ESLint con auto-fix         |
| `npm run pages:build` | Build para Cloudflare Pages          |
| `npm run preview`     | Preview local con Wrangler           |
| `npm run deploy`      | Deploy a Cloudflare Pages            |
| `npm run cf-typegen`  | Generar tipos de Cloudflare          |

## 🎨 Desarrollo Frontend

### Estructura de carpetas

```
src/
├── app/                 # App Router de Next.js
│   ├── page.tsx        # Página principal (catálogo)
│   ├── [sigle]/        # Páginas de cursos individuales
│   └── review/         # Páginas de reseñas
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes base (shadcn/ui)
│   ├── courses/       # Componentes específicos de cursos
│   └── reviews/       # Componentes de reseñas
├── lib/               # Utilidades y funciones helper
├── hooks/             # Custom React hooks
├── styles/            # Estilos globales de Tailwind
└── types/             # Definiciones de TypeScript
```

### Tailwind CSS v4

El proyecto usa Tailwind CSS v4 con breakpoints personalizados:

- `tablet:` - Para tablets y arriba
- `desktop:` - Para desktop y arriba

Ejemplo:

```tsx
<div className="text-sm tablet:text-base desktop:text-lg">Texto responsive</div>
```

### Componentes UI

Basados en **Radix UI** y **shadcn/ui** para máxima accesibilidad:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### Optimizaciones

- **Turbopack** para desarrollo rápido
- **Edge Runtime** para respuestas instantáneas
- **Lazy loading** de componentes
- **Optimización de imágenes** automática de Next.js

## 🚀 Deployment

### Cloudflare Pages

1. **Build y deploy:**

```bash
npm run deploy
```

2. **Configurar variables de entorno** en Cloudflare Dashboard
3. **Configurar base de datos D1** en production
4. **Configurar dominios personalizados** (opcional)

### Variables de entorno en producción

En Cloudflare Pages > Settings > Environment variables:

```
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🧪 Testing y Calidad

### Linting

```bash
# Verificar código
npm run lint

# Auto-fix problemas
npm run lint:fix
```

### Configuración ESLint

- **Next.js recommended**
- **Prettier integration**
- **TypeScript support**
- **Accessibility rules**

## 📁 Archivos de Configuración

| Archivo              | Propósito                     |
| -------------------- | ----------------------------- |
| `next.config.ts`     | Configuración de Next.js      |
| `tailwind.config.js` | Configuración de Tailwind CSS |
| `wrangler.jsonc`     | Configuración de Cloudflare   |
| `tsconfig.json`      | Configuración de TypeScript   |
| `eslint.config.mjs`  | Configuración de ESLint       |

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### Convenciones de código

- **Usar TypeScript** para todo el código
- **Seguir convenciones de ESLint/Prettier**
- **Componentes funcionales** con hooks
- **Mobile-first** para diseño responsive
- **Accesibilidad** como prioridad

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE.md` para más detalles.

## 🆘 Soporte

Habla a @osuc.dev en instagram.

---

**Desarrollado con ❤️ para la comunidad estudiantil**
