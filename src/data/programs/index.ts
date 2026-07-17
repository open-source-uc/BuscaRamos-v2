import ACT from "./actuacion";
import ADP from "./administracion_publica";
import AGR from "./agronomia";
import ANT from "./antropologia";
import ARQUE from "./arqueologia";
import ARQUI from "./arquitectura";
import LICD from "./licd";
import LICC from "./licc";
import { parseProgram } from "@/lib/programParser";

export const programs = [
  parseProgram(ACT),
  parseProgram(ADP),
  parseProgram(AGR),
  parseProgram(ANT),
  parseProgram(ARQUE),
  parseProgram(ARQUI),
  parseProgram(LICC),
  parseProgram(LICD),
].sort((a, b) => a.name.localeCompare(b.name));
