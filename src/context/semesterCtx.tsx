"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { computeCurrentSemester } from "@/lib/currentSemester";

interface SemesterContextValue {
  currentSemester: string;
  setCurrentSemester: (semester: string) => void;
}

const SemesterContext = createContext<SemesterContextValue>({
  currentSemester: computeCurrentSemester(),
  setCurrentSemester: () => {},
});

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [currentSemester, setCurrentSemester] = useState(computeCurrentSemester);
  return (
    <SemesterContext.Provider value={{ currentSemester, setCurrentSemester }}>
      {children}
    </SemesterContext.Provider>
  );
}

/** Devuelve el semestre actual. Se inicializa por fecha y se actualiza con datos NDJSON. */
export function useCurrentSemester(): string {
  return useContext(SemesterContext).currentSemester;
}

/** Permite a componentes con datos NDJSON actualizar el semestre global. */
export function useSetCurrentSemester(): (semester: string) => void {
  return useContext(SemesterContext).setCurrentSemester;
}
