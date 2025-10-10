importScripts("https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js");

let fuse = null;

function handleInit(msg) {
  const { data, keys, options } = msg;
  fuse = new self.Fuse(data, Object.assign({ keys }, options || {}));
}

function handleSearch(msg) {
  const { requestId, query } = msg;
  if (!fuse || !query || query.trim() === "") {
    self.postMessage({ type: "RESULT", requestId, items: [] });
    return;
  }
  const results = fuse.search(query).map((r) => r.item);
  self.postMessage({ type: "RESULT", requestId, items: results });
}

self.addEventListener("message", (event) => {
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


