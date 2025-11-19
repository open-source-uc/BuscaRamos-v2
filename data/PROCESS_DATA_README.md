## MIT License

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

#### Ejemplo con Restricciones

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

      // Restricciones parseadas
      "restrictions": [
        {
          "type": "nivel",
          "value": "Doctorado",
          "raw": "((Nivel = Doctorado)"
        },
        {
          "type": "nivel",
          "value": "Magister",
          "raw": "(Nivel = Magister)"
        }
      ]
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

      // Restricciones de programa
      "restrictions": [
        {
          "type": "programa",
          "value": "Ing Civil Ind-Comput",
          "raw": "(Programa=Ing Civil Ind-Comput)"
        }
      ],

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

- **`parsed_meta_data.prerequisites.type`**: Puede ser `"AND"` o `"OR"`
- **`parsed_meta_data.prerequisites.courses`**: Array de cursos directos en este nivel
- **`parsed_meta_data.prerequisites.groups`**: Array de subgrupos (recursivo)
- **`parsed_meta_data.unlocks.as_prerequisite`**: Cursos que requieren este curso como requisito normal
- **`parsed_meta_data.unlocks.as_corequisite`**: Cursos que requieren este curso como correquisito (pueden tomarse simultáneamente)
- **`is_coreq`**: `true` si el curso tiene `(c)` al final (puede tomarse simultáneamente con el curso que lo requiere)

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

    "restrictions": [...],          # Lista de restricciones (opcional)
    "connector": "y" | "o" | None,  # Conector req-restr (opcional)
    "equivalences": [...],          # Array de siglas (opcional)

    "unlocks": {                    # Qué cursos abre (opcional)
        "as_prerequisite": [...],   # Como requisito normal
        "as_corequisite": [...]     # Como correquisito (c)
    }
}
```

### Operadores Lógicos

- **`AND`**: Todos los requisitos/grupos deben cumplirse

  - Ejemplo: `"MAT1000 y FIS1000"`

- **`OR`**: Al menos uno debe cumplirse
  - Ejemplo: `"(MAT1000 o MAT1001)"`

### Correquisitos

Los correquisitos se marcan con `(c)` y tienen `is_coreq: true`:

```json
{
  "sigle": "IIC1103",
  "is_coreq": true // Puede tomarse simultáneamente
}
```