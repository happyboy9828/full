"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fetch helper for the analytics report endpoints.
 *
 * Differences from `useAdminQuery`:
 *  - optional polling (the live module refreshes on a timer)
 *  - `updatedAt` timestamp so a panel can show when it was last refreshed
 *
 * `fetcher` must be a stable reference (a module-level function such as
 * `reportsApi.pages`) — the query re-runs whenever the serialised params
 * change.
 */
export function useReportQuery(fetcher, params = {}, { pollMs = 0 } = {}) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true,
    updatedAt: null,
  });

  const paramsKey = JSON.stringify(params);

  const load = useCallback(
    async (key) => {
      try {
        const payload = await fetcher(JSON.parse(key));
        return { data: payload, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    [fetcher]
  );

  // Initial load / reload whenever the parameters change.
  useEffect(() => {
    let active = true;

    (async () => {
      const result = await load(paramsKey);
      if (!active) return;
      setState({ ...result, loading: false, updatedAt: Date.now() });
    })();

    return () => {
      active = false;
    };
  }, [paramsKey, load]);

  // Optional polling. A failed poll keeps the last good data on screen and
  // only surfaces the error, so the panel never blanks out mid-refresh.
  useEffect(() => {
    if (!pollMs) return undefined;

    const timer = setInterval(() => {
      load(paramsKey).then((result) => {
        setState((previous) => ({
          data: result.data ?? previous.data,
          error: result.error,
          loading: false,
          updatedAt: Date.now(),
        }));
      });
    }, pollMs);

    return () => clearInterval(timer);
  }, [pollMs, paramsKey, load]);

  const refetch = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    const result = await load(paramsKey);
    setState({ ...result, loading: false, updatedAt: Date.now() });
  }, [paramsKey, load]);

  return { ...state, refetch };
}

export default useReportQuery;
