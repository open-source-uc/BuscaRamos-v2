export interface EquivalentCourse {
  sigle: string
  name?: string
}

export interface EquivalentGroup {
  type: 'AND' | 'OR'
  courses: EquivalentCourse[]
  groups?: EquivalentGroup[]
}

export interface ParsedEquivalents {
  hasEquivalents: boolean
  structure?: EquivalentGroup
}

/**
 * Analiza una cadena de cursos equivalentes en un formato estructurado
 * @param equiv La cadena de equivalencias (ej: "(MAT1124 o MAT1126) y (MAT0004 o MAT0006 o MAT0007) o (IMT2220 o IMT2230)")
 * @returns Estructura de equivalencias analizada
 */

export function parseEquivalents(equiv: string): ParsedEquivalents {
  console.log(">>> equiv recibido:", equiv);
  if (!equiv || equiv.trim() === '' || equiv.trim() === 'No tiene') {
    console.log(">>> Equivalente vacío o sin valor relevante");
    return { hasEquivalents: false };
  }

  const cleanEquiv = equiv.trim();

  try {
    const structure = parseEquivalentExpression(cleanEquiv);
    return {
      hasEquivalents: true,
      structure,
    };
  } catch (error) {
    console.error("Error parsing equivalents:", error);
    return { hasEquivalents: false };
  }
}

function parseEquivalentExpression(expression: string): EquivalentGroup {
  let trimmed = expression.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(1, -1).trim();
    if (isBalancedParentheses(inner)) {
      trimmed = inner;
    }
  }

  if (!trimmed.includes(' y ') && !trimmed.includes(' o ') && !trimmed.includes('(')) {
    const courses = extractCourses(trimmed);
    return { type: 'AND', courses };
  }

  const orParts = splitByOperator(trimmed, 'o');
  if (orParts.length > 1) {
    const groups = orParts.map((part) => parseEquivalentExpression(part.trim()));
    return { type: 'OR', courses: [], groups };
  }

  const andParts = splitByOperator(trimmed, 'y');
  if (andParts.length > 1) {
    const groups = andParts.map((part) => parseEquivalentExpression(part.trim()));
    return { type: 'AND', courses: [], groups };
  }

  const courses = extractCourses(trimmed);
  return { type: 'AND', courses };
}

function splitByOperator(expression: string, operator: 'y' | 'o'): string[] {
  const parts: string[] = [];
  let current = '';
  let parens = 0;

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (char === '(') parens++;
    else if (char === ')') parens--;

    if (parens === 0 && expression.slice(i).startsWith(` ${operator} `)) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      i += operator.length + 1;
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());

  return parts;
}

function extractCourses(text: string): EquivalentCourse[] {
  const courses: EquivalentCourse[] = [];

  const matches = text.match(/[A-Z]{2,4}\d{1,4}[A-Z]?/g) || [];

  for (const match of matches) {
    if (match) {
      const sigle = match;
      if (/^[A-Z]{2,4}\d{1,4}[A-Z]?$/.test(sigle)) {
        courses.push({ sigle });
      }
    }
  }

  return courses;
}

function isBalancedParentheses(text: string): boolean {
  let count = 0;
  for (const char of text) {
    if (char === '(') count++;
    else if (char === ')') count--;
    if (count < 0) return false;
  }
  return count === 0;
}
