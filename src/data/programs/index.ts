import LICC from "./licc";
import ADP from "./administracion_publica";
import ACT from "./actuacion";
import AGR from "./agronomia";
import CDD from "./cdd";
import { parseProgram } from "@/lib/programParser";

export const programs = [
  parseProgram(LICC),
  parseProgram(ADP),
  parseProgram(ACT),
  parseProgram(AGR),
  parseProgram(CDD),
].sort((a, b) => a.name.localeCompare(b.name));
