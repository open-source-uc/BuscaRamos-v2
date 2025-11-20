"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IFuseOptions } from "fuse.js";
import Fuse from "fuse.js";
import { createFuseWorkerClient } from "@/lib/fuseWorkerClient";

export type UseFuseMode = "worker" | "sync";

export interface UseFuseParams<T> {
  data: T[];
  keys?: string[];
  options?: IFuseOptions<T>;
  query?: string;
  debounceMs?: number;
  mode?: UseFuseMode;
}

export interface UseFuseResult<T> {
  results: T[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  abort: () => void;
  query: string;
}

export function useFuse<T>({
  data,
  keys,
  options,
  query,
  debounceMs = 300,
  mode = "worker",
}: UseFuseParams<T>): UseFuseResult<T> {
  const [internalQuery, setInternalQuery] = useState("");
  const [results, setResults] = useState<T[]>(data);
  const [isSearching, setIsSearching] = useState(false);

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

  const effectiveQuery = query ?? internalQuery;

  const debounceRef = useRef<number | undefined>(undefined);
  const searchInFlightRef = useRef(false);

  const clientRef = useRef<ReturnType<typeof createFuseWorkerClient<T>> | null>(null);
  const startClient = useCallback(() => {
    if (typeof window === "undefined") return;
    clientRef.current = createFuseWorkerClient<T>({
      data,
      keys: effectiveKeys,
      options: effectiveOptions,
    });
  }, [data, effectiveKeys, effectiveOptions]);
  const stopClient = useCallback(() => {
    try {
      clientRef.current?.terminate();
    } catch {}
    clientRef.current = null;
  }, []);

  const fuseRef = useRef<Fuse<T> | null>(null);

  useEffect(() => {
    setResults(data);
  }, [data]);

  useEffect(() => {
    if (mode === "worker") {
      startClient();
      return () => {
        stopClient();
      };
    } else {
      fuseRef.current = new Fuse<T>(data, {
        keys: effectiveKeys as any,
        ...(effectiveOptions as any),
      });
      return () => {
        fuseRef.current = null;
      };
    }
  }, [mode, data, effectiveKeys, effectiveOptions, startClient, stopClient]);

  useEffect(() => {
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
    }

    if (!effectiveQuery || effectiveQuery.trim() === "") {
      setIsSearching(false);
      setResults(data);
      return;
    }

    setIsSearching(true);

    debounceRef.current = window.setTimeout(async () => {
      searchInFlightRef.current = true;
      try {
        if (mode === "worker") {
          const items = await clientRef.current?.search(effectiveQuery);
          if (items) setResults(items);
        } else {
          const fr = fuseRef.current?.search(effectiveQuery).map((r) => r.item) ?? [];
          setResults(fr);
        }
      } finally {
        searchInFlightRef.current = false;
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current);
      }
      if (mode === "worker" && searchInFlightRef.current) {
        stopClient();
        startClient();
      }
    };
  }, [effectiveQuery, data, debounceMs, mode, startClient, stopClient]);

  const abort = useCallback(() => {
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
    }
    if (mode === "worker" && searchInFlightRef.current) {
      stopClient();
      startClient();
    }
    setIsSearching(false);
  }, [mode, startClient, stopClient]);

  const setQuery = useCallback((q: string) => {
    setInternalQuery(q);
  }, []);

  return useMemo(
    () => ({ results, isSearching, setQuery, abort, query: effectiveQuery }),
    [results, isSearching, abort, effectiveQuery]
  );
}
