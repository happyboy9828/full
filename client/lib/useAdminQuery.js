"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fetch helper for admin API collections.
 *
 * `fetcher` must be a stable reference (a module-level function such as
 * `adminApi.listUsers`) — the query re-runs whenever the serialised params
 * change.
 */
export function useAdminQuery(fetcher, params = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const paramsKey = JSON.stringify(params);

  const request = useCallback(
    async (key) => {
      try {
        const data = await fetcher(JSON.parse(key));
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    [fetcher]
  );

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await request(paramsKey);
      if (!active) return;
      setState({ ...result, loading: false });
    })();

    return () => {
      active = false;
    };
  }, [paramsKey, request]);

  const refetch = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    const result = await request(paramsKey);
    setState({ ...result, loading: false });
  }, [paramsKey, request]);

  return {
    ...state,
    refetch,
    setData: (data) => setState((previous) => ({ ...previous, data })),
  };
}

export default useAdminQuery;
