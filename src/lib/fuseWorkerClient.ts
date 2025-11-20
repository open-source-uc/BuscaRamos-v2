"use client";

import type { IFuseOptions } from "fuse.js";

export interface FuseWorkerInit<T> {
  data: T[];
  keys: string[];
  options?: IFuseOptions<T>;
}

export interface FuseWorkerClient<T> {
  search: (query: string) => Promise<T[]>;
  terminate: () => void;
}

export function createFuseWorkerClient<T>(init: FuseWorkerInit<T>): FuseWorkerClient<T> {
  if (typeof window === "undefined") {
    throw new Error("createFuseWorkerClient must be called in a browser environment");
  }

  const worker = new Worker("/workers/fuse.worker.js", { type: "module", name: "fuse-worker" });
  let nextRequestId = 1;
  const pending = new Map<number, (value: T[] | PromiseLike<T[]>) => void>();

  const startWorker = () => {
    worker.postMessage({
      type: "INIT",
      data: init.data,
      keys: init.keys,
      options: init.options,
    });
  };

  worker.onmessage = (event: MessageEvent) => {
    const { type, requestId, items } = event.data || {};
    if (type === "RESULT" && typeof requestId === "number") {
      const resolve = pending.get(requestId);
      if (resolve) {
        pending.delete(requestId);
        resolve(items as T[]);
      }
    }
  };

  startWorker();

  const search = (query: string): Promise<T[]> => {
    const requestId = nextRequestId++;
    return new Promise<T[]>((resolve) => {
      pending.set(requestId, resolve);
      worker.postMessage({ type: "SEARCH", requestId, query });
    });
  };

  const terminate = () => {
    try {
      worker.terminate();
    } catch {}
  };

  return { search, terminate };
}
