"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { fetchReport } from "@/lib/analyticsApi";

export default function useReport(reportName, params = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const paramsRef = useRef(params);
  const refetchRef = useRef(null);

  useEffect(() => {
    paramsRef.current = params;
  });

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReport(reportName, paramsRef.current);
        if (cancelled) return;
        if (r.status >= 400 || !r.json?.success) {
          setError(r.json?.error || `Failed to load ${reportName} report`);
          setData(null);
        } else {
          setData(r.json.data);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Network error");
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    refetchRef.current = fetchData;
    fetchData();

    return () => {
      cancelled = true;
    };
  }, [paramsKey, reportName]);

  const refetch = useCallback(() => {
    if (refetchRef.current) {
      refetchRef.current();
    }
  }, []);

  return { data, error, loading, refetch };
}

export function useIntervalReport(reportName, params = {}, intervalMs = 30000) {
  const report = useReport(reportName, params);
  const { refetch } = report;

  useEffect(() => {
    if (reportName !== "live" && reportName !== "time-series") return;
    const timer = setInterval(() => {
      refetch();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [reportName, refetch, intervalMs]);

  return report;
}
