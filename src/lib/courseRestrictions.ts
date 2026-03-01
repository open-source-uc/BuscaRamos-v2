export interface RestrictionRule {
  type: string; // "programa", etc.
  operator: string; // "=", etc.
  value: string;
  raw: string; // Representación en texto como "(Programa = Lic Ing Cs Datos)"
}

export interface RestrictionGroup {
  type: "AND" | "OR";
  restrictions: RestrictionRule[];
  groups?: RestrictionGroup[];
}

export interface ParsedRestrictions {
  hasRestrictions: boolean;
  structure?: RestrictionGroup;
}
