MIT License

Copyright (c) 2021 Nicolás Mc Intyre
Copyright (c) 2023 kovaxis
Copyright (c) 2025 Vicente Muñoz

# 📓 Process Data Notebook

Jupyter Notebook para procesar los datos de cursos scrapeados y generar archivos JSON simplificados y optimizados.

## 🎯 Objetivo

Este notebook toma los archivos JSON crudos de varios semestres (2024-2, 2024-3, 2025-1, 2025-2) y los procesa para generar:

1. **`courses-simplified.json`** - Información completa de todos los cursos con metadata parseada
2. **`courses-descriptions.json`** - Descripciones extraídas de los programas de curso
3. **`courses-sections.ndjson`** - Secciones del semestre actual en formato NDJSON
4. **`sql_output/*.sql`** - Archivos SQL para poblar la base de datos

## 📥 Archivos de Entrada

El notebook procesa estos archivos JSON en orden de precedencia:

```
2024-2.json  (base)
├─ 2024-3.json  (TAV - sobrescribe duplicados)
├─ 2025-1.json  (sobrescribe duplicados)
└─ 2025-2.json  (última versión - sobrescribe duplicados)
```

**Estructura de entrada** (ejemplo de `2025-2.json`):

```json
{
  "IIC2233": {
    "sigle": "IIC2233",
    "name": "Programación Avanzada",
    "credits": 10,
    "req": "IIC1103 o IIC1102",
    "conn": "No tiene",
    "restr": "No tiene",
    "equiv": "(IIC1222)",
    "school": "Ingeniería",
    "program": "<html>...</html>",
    "sections": {
      "1": {
        "nrc": "12345",
        "format": "Presencial",
        "campus": "San Joaquín",
        "teachers": ["Juan Pérez"],
        "schedule": {...},
        "quota": {...},
        ...
      }
    }
  }
}
```

## 📤 Archivos de Salida

### 1. `courses-simplified.json`

Archivo principal con información completa de todos los cursos.

#### Estructura Completa

```json
{
  "IIC2233": {
    "sigle": "IIC2233",
    "name": "Programación Avanzada",
    "credits": 10,

    // Metadata parseada (estructura jerárquica de requisitos)
    "parsed_meta_data": {
      "has_prerequisites": true,
      "has_restrictions": false,
      "has_equivalences": true,
      "unlocks_courses": true,

      // Árbol de requisitos con operadores lógicos
      "prerequisites": {
        "type": "OR",
        "courses": [],
        "groups": [
          {
            "type": "AND",
            "courses": [
              {
                "sigle": "IIC1103",
                "is_coreq": false
              }
            ],
            "groups": []
          },
          {
            "type": "AND",
            "courses": [
              {
                "sigle": "IIC1102",
                "is_coreq": false
              }
            ],
            "groups": []
          }
        ]
      },

      // Cursos equivalentes (array de strings)
      "equivalences": ["IIC1222"],

      // Qué cursos desbloquea este curso
      "unlocks": {
        "as_prerequisite": [
          "ETI195",
          "ICT3115",
          "IIC2133",
          "IIC2413",
          "IIC2613"
        ],
        "as_corequisite": ["ICT2233", "IIC2343"]
      }
    },

    // Metadata del curso
    "school": "Ingeniería",
    "area": ["Ciencias de la Computación"],
    "categories": ["Programación", "Software"],
    "format": ["Presencial"],
    "campus": ["San Joaquín"],
    "is_removable": [true],
    "is_special": [false],
    "is_english": [false],
    "last_semester": "2025-2"
  }
}
```

#### Ejemplo con Restricciones (OR simple)

```json
{
  "ACO3024": {
    "sigle": "ACO3024",
    "name": "Taller de Escritura Teatral",
    "credits": 10,
    "parsed_meta_data": {
      "has_prerequisites": false,
      "has_restrictions": true,
      "has_equivalences": false,
      "unlocks_courses": false,

      // Restricciones con estructura jerárquica
      "restrictions": {
        "type": "OR",
        "restrictions": [],
        "groups": [
          {
            "type": "AND",
            "restrictions": [
              {
                "type": "nivel",
                "operator": "=",
                "value": "Doctorado",
                "raw": "(Nivel = Doctorado)"
              }
            ],
            "groups": []
          },
          {
            "type": "AND",
            "restrictions": [
              {
                "type": "nivel",
                "operator": "=",
                "value": "Magister",
                "raw": "(Nivel = Magister)"
              }
            ],
            "groups": []
          }
        ]
      }
    },
    "school": "Actuación",
    "area": [],
    "categories": [],
    "format": ["Presencial"],
    "campus": ["Oriente"],
    "is_removable": [true],
    "is_special": [false],
    "is_english": [false],
    "last_semester": "2025-2"
  }
}
```

#### Ejemplo con Restricciones (AND entre restricciones)

```json
{
  "BIO187C": {
    "sigle": "BIO187C",
    "name": "Aspectos Biológicos y Bioéticos de la Fertilidad en Humanos",
    "credits": 10,
    "parsed_meta_data": {
      "has_prerequisites": false,
      "has_restrictions": true,
      "has_equivalences": false,
      "unlocks_courses": false,

      // AND entre dos restricciones
      "restrictions": {
        "type": "AND",
        "restrictions": [],
        "groups": [
          {
            "type": "AND",
            "restrictions": [
              {
                "type": "nivel",
                "operator": "=",
                "value": "Pregrado",
                "raw": "(Nivel = Pregrado)"
              }
            ],
            "groups": []
          },
          {
            "type": "AND",
            "restrictions": [
              {
                "type": "escuela",
                "operator": "<>",
                "value": "Ciencias Biologicas",
                "raw": "(Escuela <> Ciencias Biologicas)"
              }
            ],
            "groups": []
          }
        ]
      }
    },
    "school": "Ciencias Biológicas",
    "area": [],
    "categories": [],
    "format": ["Presencial"],
    "campus": ["San Joaquín"],
    "is_removable": [true],
    "is_special": [false],
    "is_english": [false],
    "last_semester": "2025-2"
  }
}
```

#### Ejemplo con Restricciones Complejas (AND entre grupos OR)

```json
{
  "FIM3406": {
    "sigle": "FIM3406",
    "name": "Teoría Cuántica de Campos I",
    "credits": 10,
    "parsed_meta_data": {
      "has_prerequisites": false,
      "has_restrictions": true,
      "has_equivalences": false,
      "unlocks_courses": false,

      // Estructura jerárquica compleja: (Doctorado OR Magister) AND (Astrofisica OR Fisica)
      "restrictions": {
        "type": "AND",
        "restrictions": [],
        "groups": [
          {
            "type": "OR",
            "restrictions": [],
            "groups": [
              {
                "type": "AND",
                "restrictions": [
                  {
                    "type": "nivel",
                    "operator": "=",
                    "value": "Doctorado",
                    "raw": "(Nivel = Doctorado)"
                  }
                ],
                "groups": []
              },
              {
                "type": "AND",
                "restrictions": [
                  {
                    "type": "nivel",
                    "operator": "=",
                    "value": "Magister",
                    "raw": "(Nivel = Magister)"
                  }
                ],
                "groups": []
              }
            ]
          },
          {
            "type": "OR",
            "restrictions": [],
            "groups": [
              {
                "type": "AND",
                "restrictions": [
                  {
                    "type": "escuela",
                    "operator": "=",
                    "value": "Astrofisica",
                    "raw": "(Escuela = Astrofisica)"
                  }
                ],
                "groups": []
              },
              {
                "type": "AND",
                "restrictions": [
                  {
                    "type": "escuela",
                    "operator": "=",
                    "value": "Fisica",
                    "raw": "(Escuela = Fisica)"
                  }
                ],
                "groups": []
              }
            ]
          }
        ]
      }
    },
    "school": "Física",
    "area": [],
    "categories": [],
    "format": ["Presencial"],
    "campus": ["San Joaquín"],
    "is_removable": [true],
    "is_special": [false],
    "is_english": [false],
    "last_semester": "2025-2"
  }
}
```

#### Ejemplo con Correquisitos

```json
{
  "IIC2343": {
    "sigle": "IIC2343",
    "name": "Arquitectura de Computadores",
    "credits": 10,
    "parsed_meta_data": {
      "has_prerequisites": true,
      "has_restrictions": false,
      "has_equivalences": true,
      "unlocks_courses": true,

      "prerequisites": {
        "type": "AND",
        "courses": [],
        "groups": [
          {
            "type": "AND",
            "courses": [
              {
                "sigle": "IIC1103",
                "is_coreq": true // Puede tomarse simultáneamente
              }
            ],
            "groups": []
          },
          {
            "type": "AND",
            "courses": [
              {
                "sigle": "IIC2233",
                "is_coreq": true // Puede tomarse simultáneamente
              }
            ],
            "groups": []
          }
        ]
      },

      "equivalences": ["IIC2342"],

      "unlocks": {
        "as_prerequisite": ["IIC2333", "IIC2560"],
        "as_corequisite": []
      }
    },
    "school": "Ingeniería",
    "area": [],
    "categories": [],
    "format": ["Presencial"],
    "campus": ["San Joaquín"],
    "is_removable": [false],
    "is_special": [false],
    "is_english": [false],
    "last_semester": "2025-2"
  }
}
```

#### Ejemplo Completo (con todos los campos)

```json
{
  "IIC2413": {
    "sigle": "IIC2413",
    "name": "Bases de Datos",
    "credits": 10,
    "parsed_meta_data": {
      "has_prerequisites": true,
      "has_restrictions": true,
      "has_equivalences": true,
      "unlocks_courses": true,

      // Requisitos complejos con múltiples opciones
      "prerequisites": {
        "type": "OR",
        "courses": [],
        "groups": [
          {
            "type": "AND",
            "courses": [{ "sigle": "IIC2233", "is_coreq": false }],
            "groups": []
          },
          {
            "type": "AND",
            "courses": [],
            "groups": [
              {
                "type": "AND",
                "courses": [
                  { "sigle": "IIC1222", "is_coreq": false },
                  { "sigle": "IIC2252", "is_coreq": false }
                ],
                "groups": []
              }
            ]
          },
          {
            "type": "AND",
            "courses": [{ "sigle": "ICS2122", "is_coreq": false }],
            "groups": []
          },
          {
            "type": "AND",
            "courses": [{ "sigle": "IRB2002", "is_coreq": false }],
            "groups": []
          },
          {
            "type": "AND",
            "courses": [{ "sigle": "IDI2025", "is_coreq": false }],
            "groups": []
          },
          {
            "type": "AND",
            "courses": [{ "sigle": "IBM2123", "is_coreq": false }],
            "groups": []
          }
        ]
      },

      // Restricciones de programa (estructura jerárquica)
      "restrictions": {
        "type": "AND",
        "restrictions": [
          {
            "type": "programa",
            "operator": "=",
            "value": "Ing Civil Ind-Comput",
            "raw": "(Programa=Ing Civil Ind-Comput)"
          }
        ],
        "groups": []
      },

      // Conector entre requisitos y restricciones
      "connector": "o",

      "equivalences": ["IIC2412"],

      "unlocks": {
        "as_prerequisite": ["IIC3413", "IIC3685"],
        "as_corequisite": []
      }
    },
    "school": "Ingeniería",
    "area": [],
    "categories": [],
    "format": ["Presencial"],
    "campus": ["San Joaquín"],
    "is_removable": [true],
    "is_special": [false],
    "is_english": [false],
    "last_semester": "2025-2"
  }
}
```

#### Campos Especiales

**Estructura de Prerequisites (requisitos):**

- **`parsed_meta_data.prerequisites.type`**: Puede ser `"AND"` o `"OR"`
- **`parsed_meta_data.prerequisites.courses`**: Array de cursos directos en este nivel
- **`parsed_meta_data.prerequisites.groups`**: Array de subgrupos (recursivo)
- **`is_coreq`**: `true` si el curso tiene `(c)` al final (puede tomarse simultáneamente con el curso que lo requiere)

**Estructura de Restrictions (restricciones):**

- **`parsed_meta_data.restrictions.type`**: Puede ser `"AND"` o `"OR"`
- **`parsed_meta_data.restrictions.restrictions`**: Array de restricciones individuales en este nivel
- **`parsed_meta_data.restrictions.groups`**: Array de subgrupos de restricciones (recursivo)
- **Cada restricción tiene:**
  - `type`: Tipo de restricción (`"nivel"`, `"escuela"`, `"programa"`, `"creditos"`, `"other"`)
  - `operator`: Operador de comparación (`"="`, `"<>"`, `">="`, `"<="`)
  - `value`: Valor de la restricción
  - `raw`: Texto original

**Unlocks (desbloqueos):**

- **`parsed_meta_data.unlocks.as_prerequisite`**: Cursos que requieren este curso como requisito normal
- **`parsed_meta_data.unlocks.as_corequisite`**: Cursos que requieren este curso como correquisito (pueden tomarse simultáneamente)

### 2. `courses-descriptions.json`

Diccionario simple de siglas → descripciones extraídas del programa HTML.

#### Estructura

```json
{
  "IIC2233": "Este curso introduce a los estudiantes en la programación orientada a objetos...",
  "MAT1000": "Curso introductorio de cálculo diferencial e integral...",
  "FIS1000": "Introducción a los conceptos fundamentales de mecánica..."
}
```

#### Ejemplo Real

```json
{
  "ACO250E": "Curso taller destinado a adquirir la tecnica del maquillaje para el teatro. Se realizan ejercicios que son\n     evaluados clase a clase. Se estudia el maquillaje neutro, el correctivo y de caracterizacion.",
  "ACO264E": "El desempe?o profesional exitoso no depende solo de la adquisicion de los conocimientos especificos de una carrera, sino tambien de una serie de habilidades o competencias ligadas al ambito de la comunicacion y el trabajo en equipo...",
  "ADP001E": "En este curso los estudiantes aprenderan los aspectos basicos de la macroeconomia y las interrelaciones de las principales variables macro..."
}
```

### 3. `courses-sections.ndjson`

Archivo NDJSON (una línea JSON por curso) con las secciones del semestre configurado.

#### Estructura

```json
{"sigle":"IIC2233","sections":{...},"name":"Programación Avanzada"}
{"sigle":"MAT1000","sections":{...},"name":"Cálculo I"}
{"sigle":"FIS1000","sections":{...},"name":"Mecánica"}
```

### 4. `sql_output/*.sql`

Archivos SQL divididos en chunks de 100 sentencias para poblar la tabla `course_summary`.

#### Ejemplo

```sql
INSERT INTO course_summary (sigle, likes, superlikes, dislikes, votes_low_workload, votes_medium_workload, votes_high_workload, votes_mandatory_attendance, votes_optional_attendance, avg_weekly_hours, sort_index)
VALUES ('IIC2233', 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0)
ON CONFLICT (sigle) DO NOTHING;
```

## 🚀 Cómo Usar

### 1. Configurar Semestre

Edita la primera celda del notebook:

```python
archivo_json = "2025-2"
```

### 2. Ejecutar Todo

Opción A - Desde Jupyter:

```bash
# Abrir Jupyter
jupyter notebook process_data.ipynb

# En Jupyter: Kernel → Restart & Run All
```

Opción B - Desde línea de comandos:

```bash
# Activar venv
source venv/bin/activate

# Ejecutar notebook
jupyter nbconvert --to notebook --execute process_data.ipynb
```

### 3. Verificar Salida

El notebook mostrará:

```
🔨 Construyendo índice de desbloqueo...
✅ Índice construido para 7324 cursos
✅ 74 archivos SQL generados en carpeta 'sql_output/' para 'course_summary'
```

## 🔧 Dependencias

```python
# Librerías estándar
import json
import re
from html import unescape
import importlib
import sys

# Del proyecto
from bc_scraper.parser import (
    parse_requirements,
    parsed_requirements_to_dict,
    build_unlocks_index
)
```

## 📊 Estadísticas

- **~7,324 cursos** procesados (combinando todos los semestres)
- **~4,403 cursos** con secciones en el semestre actual
- **~5,889 cursos** con descripciones extraídas
- **74 archivos SQL** generados (100 cursos por archivo)

## 🧩 Proceso Interno

El notebook realiza estos pasos:

1. **Cargar JSONs** de múltiples semestres
2. **Combinar datos** (último semestre tiene precedencia)
3. **Para cada curso**:
   - Agregar valores únicos de secciones (formato, campus, etc.)
   - Extraer descripción del programa HTML
   - **Parsear requisitos** con `parse_requirements()`
   - Guardar como objeto `ParsedRequirements` en `parsed_meta_data`
4. **Construir índice inverso** con `build_unlocks_index()`
   - Determina qué cursos desbloquea cada curso
   - Diferencia entre requisitos y correquisitos
5. **Convertir a dict** con `parsed_requirements_to_dict()`
   - Convierte objetos `ParsedRequirements` a diccionarios JSON
6. **Agregar OSUC500** (curso especial para feedback)
7. **Guardar archivos**:
   - `courses-simplified.json` (con `indent=2`)
   - `courses-descriptions.json` (con `indent=2`)
   - `courses-sections.ndjson`
   - `sql_output/*.sql`

## 🔍 Campos Importantes

### `parsed_meta_data`

La estructura más importante del JSON de salida:

```python
{
    "has_prerequisites": bool,      # ¿Tiene requisitos?
    "has_restrictions": bool,       # ¿Tiene restricciones?
    "has_equivalences": bool,       # ¿Tiene equivalencias?
    "unlocks_courses": bool,        # ¿Abre otros cursos?

    "prerequisites": {              # Árbol de requisitos (opcional)
        "type": "AND" | "OR",       # Operador lógico
        "courses": [...],           # Cursos en este nivel
        "groups": [...]             # Subgrupos (recursivo)
    },

    "restrictions": {               # Árbol de restricciones (opcional)
        "type": "AND" | "OR",       # Operador lógico
        "restrictions": [...],      # Restricciones en este nivel
        "groups": [...]             # Subgrupos (recursivo)
    },

    "connector": "y" | "o" | None,  # Conector req-restr (opcional)
    "equivalences": [...],          # Array de siglas (opcional)

    "unlocks": {                    # Qué cursos abre (opcional)
        "as_prerequisite": [...],   # Como requisito normal
        "as_corequisite": [...]     # Como correquisito (c)
    }
}
```

### Operadores Lógicos

**En Prerequisites (requisitos):**

- **`AND`**: Todos los requisitos/grupos deben cumplirse

  - Ejemplo: `"MAT1000 y FIS1000"`

- **`OR`**: Al menos uno debe cumplirse
  - Ejemplo: `"(MAT1000 o MAT1001)"`

**En Restrictions (restricciones):**

- **`AND`**: Todas las restricciones/grupos deben cumplirse

  - Ejemplo: `"(Nivel = Pregrado) y (Escuela <> Ciencias Biologicas)"`
  - Significa: El estudiante DEBE ser de Pregrado Y NO debe ser de Ciencias Biológicas

- **`OR`**: Al menos una restricción/grupo debe cumplirse
  - Ejemplo: `"(Nivel = Doctorado) o (Nivel = Magister)"`
  - Significa: El estudiante puede ser de Doctorado O de Magister

**Operadores de Comparación en Restricciones:**

- `=`: Igual a
- `<>`: Diferente de (NOT EQUAL)
- `>=`: Mayor o igual que
- `<=`: Menor o igual que

### Correquisitos

Los correquisitos se marcan con `(c)` y tienen `is_coreq: true`:

```json
{
  "sigle": "IIC1103",
  "is_coreq": true // Puede tomarse simultáneamente
}
```

### Ejemplos de Restricciones Jerárquicas

**Caso 1: AND Simple (BIO310A)**

```
Input: ((Creditos >= 200) y (Nivel=Pregrado))
Resultado: Estructura AND con 2 restricciones
Significado: El estudiante debe tener >= 200 créditos Y ser de Pregrado
```

**Caso 2: AND con operador <> (BIO187C)**

```
Input: (Nivel = Pregrado) y (Escuela <> Ciencias Biologicas)
Resultado: Estructura AND con 2 restricciones
Significado: El estudiante debe ser de Pregrado Y NO ser de Ciencias Biológicas
```

**Caso 3: AND entre grupos OR (FIM3406)**

```
Input: ((Nivel = Doctorado) o (Nivel = Magister)) y ((Escuela = Astrofisica) o (Escuela = Fisica))
Resultado: Estructura AND con 2 grupos OR
Significado: El estudiante debe ser (Doctorado O Magister) Y (Astrofísica O Física)
```

## 📝 Notas

1. **Orden de precedencia**: Los semestres más recientes sobrescriben los anteriores
2. **Campos eliminados**: Los campos originales `req`, `conn`, `restr`, `equiv` ya NO están en el JSON simplificado - toda la información está en `parsed_meta_data`
3. **Estructura jerárquica**: Tanto `prerequisites` como `restrictions` usan estructura de árbol con operadores lógicos AND/OR
4. **Operadores de restricciones**: Se soportan `=`, `<>`, `>=`, `<=` para comparaciones en restricciones
5. **Descripciones**: Se extraen del HTML buscando la sección "I. DESCRIPCIÓN"
6. **Índice de unlocks**: Se construye DESPUÉS de parsear todos los cursos
7. **OSUC500**: Curso especial agregado manualmente para feedback de usuarios
8. **Formato JSON**: Se usa `indent=2` para legibilidad

## 🐛 Troubleshooting

### El parser no está actualizado

Si ves que los requisitos no se parsean correctamente:

```python
# La celda 2 recarga automáticamente el módulo
if 'bc_scraper.parser' in sys.modules:
    importlib.reload(sys.modules['bc_scraper.parser.course_requirements'])
    importlib.reload(sys.modules['bc_scraper.parser'])
```

O mejor aún, reinicia el kernel:

```
Kernel → Restart Kernel
```

### Falta algún semestre

Edita la celda 3 y agrega el nuevo archivo JSON:

```python
with open("2025-3.json", "r", encoding="utf-8") as f:
    data_2025_3 = json.load(f)
for i in data_2025_3:
    data_2025_3[i]["last_semester"] = "2025-3"

# Agregar al final
combined_data.update(data_2025_3)
```

## 🔗 Referencias

- Parser de requisitos: `/bc_scraper/parser/course_requirements.py`
- Tests del parser: `/tests/test_parser.py`
- Documentación del parser: `/bc_scraper/parser/README.md`
- Archivos de entrada: `/2025-2.json`, `/2025-1.json`, etc.

## 📈 Ejemplo de Uso Programático

```python
import json

# Cargar cursos simplificados
with open("courses-simplified.json", "r", encoding="utf-8") as f:
    courses = json.load(f)

# Obtener curso
curso = courses["IIC2233"]

# Verificar si tiene requisitos
if curso["parsed_meta_data"]["has_prerequisites"]:
    print("El curso tiene requisitos")
    print(f"Estructura: {curso['parsed_meta_data']['prerequisites']}")

# Ver qué cursos abre
if curso["parsed_meta_data"]["unlocks_courses"]:
    unlocks = curso["parsed_meta_data"]["unlocks"]
    print(f"Abre como requisito: {unlocks['as_prerequisite']}")
    print(f"Abre como correquisito: {unlocks['as_corequisite']}")

# Cargar descripciones
with open("courses-descriptions.json", "r", encoding="utf-8") as f:
    descriptions = json.load(f)

if curso["sigle"] in descriptions:
    print(f"Descripción: {descriptions[curso['sigle']]}")
```

## 🧪 Testing

El parser tiene una suite completa de tests con `pytest`:

```bash
# Activar venv
source venv/bin/activate

# Ejecutar todos los tests
pytest tests/test_parser.py -v

# Ver cobertura
pytest tests/test_parser.py --cov=bc_scraper.parser --cov-report=term-missing
```

**29 tests** cubren:

- Parseo básico de requisitos, restricciones y equivalencias
- Estructuras jerárquicas complejas con AND/OR
- Casos reales de restricciones (BIO310A, BIO187C, FIM3406)
- Operadores de comparación (`=`, `<>`, `>=`, `<=`)
- Índice de unlocks (requisitos y correquisitos)
- Serialización a JSON
- Casos edge (strings vacíos, paréntesis anidados, etc.)

---

**Última actualización**: Noviembre 2025  
**Versión actual**: Incluye sistema de unlocks, parseo jerárquico de restricciones y operadores de comparación
