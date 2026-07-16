import licc from "./licc.json";
import adp from "./administracion_publica.json";
import { parseProgram } from "@/lib/programParser";

export const programs = [parseProgram(licc), parseProgram(adp)].sort((a, b) =>
  a.name.localeCompare(b.name)
);
