# Schema: courses-score.ndjson

Este documento describe la estructura de datos que llega del archivo `courses-score.ndjson` desde `https://public.osuc.dev/courses-score.ndjson`.

## Tipo: CourseScore

```typescript
type CourseScore = {
  // Identificación y básicos
  sigle: string;
  name: string;
  credits: number;
  school: string;
  last_semester: string;

  // Estadísticas de reseñas
  likes: number;
  dislikes: number;
  superlikes: number;
  votes_low_workload: number;
  votes_medium_workload: number;
  votes_high_workload: number;
  votes_mandatory_attendance: number;
  votes_optional_attendance: number;
  avg_weekly_hours: number;

  // Arrays de características
  format: string[];
  campus: string[];
  is_removable: boolean[];
  is_special: boolean[];
  is_english: boolean[];
  area: string[];
  categories: string[];
};
```

## Descripción de Campos

### Campos de Identificación y Básicos

| Campo           | Tipo     | Descripción                                                   |
| --------------- | -------- | ------------------------------------------------------------- |
| `sigle`         | `string` | Sigla del curso (ej: "IIC1103", "MUC701")                     |
| `name`          | `string` | Nombre completo del curso                                     |
| `credits`       | `number` | Número de créditos del curso                                  |
| `school`        | `string` | Escuela/Facultad del curso                                    |
| `last_semester` | `string` | Último semestre ofrecido (formato: "YYYY-S" donde S es 1 o 2) |

### Campos de Estadísticas de Reseñas

| Campo                        | Tipo     | Descripción                         |
| ---------------------------- | -------- | ----------------------------------- |
| `likes`                      | `number` | Número de likes en las reseñas      |
| `dislikes`                   | `number` | Número de dislikes en las reseñas   |
| `superlikes`                 | `number` | Número de superlikes en las reseñas |
| `votes_low_workload`         | `number` | Votos de carga baja                 |
| `votes_medium_workload`      | `number` | Votos de carga media                |
| `votes_high_workload`        | `number` | Votos de carga alta                 |
| `votes_mandatory_attendance` | `number` | Votos de asistencia obligatoria     |
| `votes_optional_attendance`  | `number` | Votos de asistencia opcional        |
| `avg_weekly_hours`           | `number` | Promedio de horas semanales         |

### Campos de Arrays de Características

| Campo          | Tipo        | Descripción                                                           |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `format`       | `string[]`  | Formatos disponibles (ej: ["Presencial", "Online"])                   |
| `campus`       | `string[]`  | Lista de campus donde se ofrece (ej: ["Casa Central", "San Joaquín"]) |
| `is_removable` | `boolean[]` | Array indicando si cada sección es retirable                          |
| `is_special`   | `boolean[]` | Array indicando si cada sección es especial                           |
| `is_english`   | `boolean[]` | Array indicando si cada sección se dicta en inglés                    |
| `area`         | `string[]`  | Áreas de formación general (puede estar vacío)                        |
| `categories`   | `string[]`  | Categorías del curso                                                  |

## Ejemplo de Objeto

```json
{
  "sigle": "IIC1103",
  "name": "Introducción a la Programación",
  "credits": 10,
  "school": "Escuela de Ingeniería",
  "last_semester": "2024-1",
  "likes": 15,
  "dislikes": 2,
  "superlikes": 4,
  "votes_low_workload": 8,
  "votes_medium_workload": 10,
  "votes_high_workload": 3,
  "votes_mandatory_attendance": 5,
  "votes_optional_attendance": 16,
  "avg_weekly_hours": 6.5,
  "format": ["Presencial"],
  "campus": ["San Joaquín"],
  "is_removable": [true],
  "is_special": [false],
  "is_english": [false],
  "area": [],
  "categories": ["Programación"]
}
```

## Notas Importantes

1. **Arrays**: Los campos `format`, `campus`, `is_removable`, `is_special`, `is_english`, `area`, y `categories` son siempre arrays, incluso si tienen un solo elemento o están vacíos.

2. **Valores vacíos**:
   - `area` puede ser un array vacío `[]` o contener strings vacíos `[""]`
   - `categories` puede ser un array vacío `[]` o contener strings vacíos `[""]`

3. **Validación**: Antes de mostrar estos campos en la UI, se debe validar que:
   - El array tenga elementos
   - Los elementos no sean strings vacíos o solo espacios en blanco

4. **Formato de semestre**: `last_semester` sigue el formato `"YYYY-S"` donde:
   - `YYYY` es el año (ej: "2024")
   - `S` es el semestre (1 o 2)

5. **Estadísticas de reseñas**: Los campos `likes`, `dislikes`, y `superlikes` se usan para calcular:
   - Total de reseñas: `likes + superlikes + dislikes`
   - Porcentaje positivo: `((likes + superlikes) / total) * 100`
