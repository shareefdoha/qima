import { useCallback, useEffect, useState } from 'react';

/**
 * useFetch(fn) — runs an api.* call on mount, exposes { data, loading, error, reload }.
 * Aborts in-flight requests on unmount so React 18 StrictMode double-invokes are safe.
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    setLoading(true);
    setError(null);

    Promise.resolve(fetcher(controller.signal))
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err) => {
        if (alive && err.name !== 'AbortError') setError(err.message || 'Something went wrong.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, reload, setData };
}

export default useFetch;
