import licc from "./licc.json";
import adp from "./administracion_publica.json";
import act from "./actuacion.json";
import agr from "./agronomia.json";
import { parseProgram } from "@/lib/programParser";

export const programs = [
  parseProgram(licc),
  parseProgram(adp),
  parseProgram(act),
  parseProgram(agr),
].sort((a, b) => a.name.localeCompare(b.name));
