/// <reference lib="webworker" />

import Fuse, { IFuseOptions } from "fuse.js";

type SearchableItem = Record<string, unknown>;

type InitMsg<T> = {
  type: "INIT";
  data: T[];
  keys: string[];
  options?: IFuseOptions<T>;
};

type SearchMsg = {
  type: "SEARCH";
  requestId: number;
  query: string;
};

type InboundMessage<T> = InitMsg<T> | SearchMsg;

type ResultMsg<T> = {
  type: "RESULT";
  requestId: number;
  items: T[];
};

let fuse: Fuse<unknown> | null = null;

function handleInit<T>(msg: InitMsg<T>) {
  const { data, keys, options } = msg;
  fuse = new Fuse(data, {
    keys,
    ...options,
  }) as Fuse<unknown>;
}

function handleSearch<T>(msg: SearchMsg) {
  const { requestId, query } = msg;
  if (!fuse || !query || query.trim() === "") {
    const result: ResultMsg<T> = { type: "RESULT", requestId, items: [] as T[] };
    (self as unknown as Worker).postMessage(result);
    return;
  }

  const results = fuse.search(query).map((r) => r.item) as T[];
  const result: ResultMsg<T> = { type: "RESULT", requestId, items: results };
  (self as unknown as Worker).postMessage(result);
}

self.addEventListener("message", (event: MessageEvent<InboundMessage<SearchableItem>>) => {
  const msg = event.data;
  if (!msg) return;

  switch (msg.type) {
    case "INIT":
      handleInit(msg);
      break;
    case "SEARCH":
      handleSearch(msg);
      break;
  }
});

export {};
