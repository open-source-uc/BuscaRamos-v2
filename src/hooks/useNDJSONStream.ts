import { useEffect, useState } from "react";

export function useNDJSONStream<T = unknown>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let abort = false;

    async function fetchStream() {
      setLoading(true);
      setError(null);
      setData([]);

      try {
        const res = await fetch(url);
        if (!res.body) throw new Error("La respuesta no tiene body.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line) as T;
              if (!abort) setData(prev => [...prev, json]);
            } catch {
              console.warn("Línea inválida NDJSON:", line);
            }
          }
        }

        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer) as T;
            if (!abort) setData(prev => [...prev, json]);
          } catch {
            console.warn("Última línea inválida:", buffer);
          }
        }
      } catch (err) {
        if (!abort) setError(err as Error);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    fetchStream();

    return () => {
      abort = true;
    };
  }, [url]);

  return { data, loading, error };
}
