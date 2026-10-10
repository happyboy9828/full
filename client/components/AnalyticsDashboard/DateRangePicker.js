"use client";

import { useState, useEffect, useRef } from "react";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Custom", value: "custom" },
];

export default function DateRangePicker({ value, onChange }) {
  const [customOpen, setCustomOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setCustomOpen(false);
      }
    }
    if (customOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [customOpen]);

  const startDate = value.startDate || "";
  const endDate = value.endDate || "";
  const preset = value.preset || "30d";

  const handlePreset = (p) => {
    if (p === "custom") {
      setCustomOpen(true);
    } else {
      const range = computePresetRange(p);
      onChange({ ...range, preset: p });
    }
  };

  const handleCustomChange = () => {
    const range = computeCustomRange(startDate, endDate);
    if (range) onChange({ ...range, preset: "custom" });
  };

  return (
    <div className="tool-card" style={{ marginBottom: 0 }}>
      <div className="tool-pills" role="group">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            className="tool-pill"
            onClick={() => handlePreset(p.value)}
          >
            <input type="radio" name="preset" checked={preset === p.value} readOnly />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {customOpen && (
        <div
          ref={popoverRef}
          className="tool-choice"
          style={{ marginTop: 12, padding: 14, cursor: "default" }}
        >
          <div className="tool-col" style={{ gap: 10, width: "100%" }}>
            <label className="tool-field" style={{ padding: 0, border: "none", display: "block" }}>
              <span className="tool-label" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                Start date
              </span>
              <input
                type="date"
                className="tool-input"
                style={{ width: "100%" }}
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => onChange({ startDate: e.target.value, endDate, preset: "custom" })}
              />
            </label>
            <label className="tool-field" style={{ padding: 0, border: "none", display: "block" }}>
              <span className="tool-label" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                End date
              </span>
              <input
                type="date"
                className="tool-input"
                style={{ width: "100%" }}
                value={endDate}
                onChange={(e) => onChange({ startDate, endDate: e.target.value, preset: "custom" })}
              />
            </label>
            <button
              type="button"
              className="tool-btn tool-btn-ghost tool-btn-small"
              style={{ alignSelf: "flex-start" }}
              onClick={() => {
                handleCustomChange();
                setCustomOpen(false);
              }}
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function computePresetRange(preset) {
  const end = new Date();
  let start;
  switch (preset) {
    case "today":
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "7d":
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59, 999);
      break;
    case "30d":
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59, 999);
      break;
    case "90d":
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function computeCustomRange(startDate, endDate) {
  if (!startDate || !endDate) return null;
  return { startDate, endDate };
}
