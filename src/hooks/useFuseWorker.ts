"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IFuseOptions } from "fuse.js";
import { createFuseWorkerClient } from "@/lib/fuseWorkerClient";

export interface UseFuseWorkerParams<T> {
  data: T[];
  keys: string[];
  options?: IFuseOptions<T>;
  debounceMs?: number;
}

export interface UseFuseWorkerResult<T> {
  results: T[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  abort: () => void;
  query: string;
}

export function useFuseWorker<T>({
  data,
  keys,
  options,
  debounceMs = 300,
}: UseFuseWorkerParams<T>): UseFuseWorkerResult<T> {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>(data);
  const [isSearching, setIsSearching] = useState(false);

  const clientRef = useRef<ReturnType<typeof createFuseWorkerClient<T>> | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const searchInFlightRef = useRef(false);

  const startClient = useCallback(() => {
    if (typeof window === "undefined") return;
    clientRef.current = createFuseWorkerClient<T>({ data, keys, options });
  }, [data, keys, options]);

  const stopClient = useCallback(() => {
    try {
      clientRef.current?.terminate();
    } catch {}
    clientRef.current = null;
  }, []);

  // (Re)initialize worker when dataset/keys/options change
  useEffect(() => {
    startClient();
    setResults(data);
    return () => {
      stopClient();
    };
  }, [startClient, stopClient, data]);

  // Debounced search when query changes
  useEffect(() => {
    // Cancel pending debounce
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.trim() === "") {
      setIsSearching(false);
      setResults(data);
      return;
    }

    setIsSearching(true);

    debounceRef.current = window.setTimeout(async () => {
      // Mark in-flight and perform search
      searchInFlightRef.current = true;
      try {
        const items = await clientRef.current?.search(query);
        if (items) setResults(items);
      } finally {
        searchInFlightRef.current = false;
        setIsSearching(false);
      }
    }, debounceMs);

    // Cleanup: cancel debounce and hard-cancel running search by restarting worker
    return () => {
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current);
      }
      if (searchInFlightRef.current) {
        // hard cancel synchronous worker search
        stopClient();
        startClient();
      }
    };
  }, [query, data, debounceMs, startClient, stopClient]);

  const abort = useCallback(() => {
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
    }
    if (searchInFlightRef.current) {
      stopClient();
      startClient();
    }
    setIsSearching(false);
  }, [startClient, stopClient]);

  return useMemo(
    () => ({ results, isSearching, setQuery, abort, query }),
    [results, isSearching, abort, query]
  );
}


