import { programs } from "@/data/programs";

export function getPrograms() {
  return programs;
}

const customCodeMap: Record<string, string> = {
  ARTS: "Formación General: Artes",
  CSOC: "Formación General: Ciencias Sociales",
  "FG-EISU": "Formación General: Ecología Integral y Sust.",
  HUMS: "Formación General: Humanidades",
  SBIE: "Formación General: Salud y Bienestar",
  FTEO: "Formación Teológica",
  LIB: "Formación General: Área Libre",
};

export function customCodeParser(customCode: string) {
  if (customCode.startsWith("FG-")) {
    for (const [suffix, name] of Object.entries(customCodeMap)) {
      if (customCode.endsWith(suffix)) {
        return name;
      }
    }

    return "Formación general";
  }

  if (customCode == "OPR") return "Optativo de Profundización";

  return customCode.toUpperCase();
}
