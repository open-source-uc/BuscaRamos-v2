import licc from "./licc.json";
import { parseProgram } from "@/lib/programParser";

export const programs = [parseProgram(licc)];
