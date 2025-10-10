"use client";

import { useEffect, useMemo } from "react";
import { useFuseWorker } from "@/hooks/useFuseWorker";
import type { IFuseOptions } from "fuse.js";

export interface UseCourseSearchWorkerParams<T> {
  data: T[];
  query: string;
  keys?: string[];
  options?: IFuseOptions<T>;
  debounceMs?: number;
}

export function useCourseSearchWorker<T>({
  data,
  query,
  keys,
  options,
  debounceMs = 300,
}: UseCourseSearchWorkerParams<T>) {
  const effectiveKeys = useMemo(() => keys ?? ["name", "nombre", "sigle", "id"], [keys]);
  const effectiveOptions = useMemo(
    () => ({
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 1,
      ...(options ?? {}),
    }),
    [options]
  );

  const worker = useFuseWorker<T>({ data, keys: effectiveKeys, options: effectiveOptions, debounceMs });

  useEffect(() => {
    worker.setQuery(query);
  }, [query, worker]);

  return worker;
}


