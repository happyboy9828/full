"use client";

import { Globe } from "lucide-react";

import { daysAgoStamp, todayStamp } from "@/lib/reportParams";

import "./AdminReports.css";

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

/**
 * Shared filter bar for the analytics modules.
 *
 * Renders the date window, the optional domain filter and any extra
 * controls a module wants to add (search boxes, selects, …).
 */
export default function ReportToolbar({
  range,
  onRangeChange,
  domain = "",
  onDomainChange,
  showDomain = true,
  showRange = true,
  children,
}) {
  const applyPreset = (days) => {
    onRangeChange({ startDate: daysAgoStamp(days), endDate: todayStamp() });
  };

  const isPresetActive = (days) =>
    range?.endDate === todayStamp() && range?.startDate === daysAgoStamp(days);

  return (
    <div className="admin-toolbar">
      {showRange ? (
        <>
          <div className="admin-field">
            <label htmlFor="report-start">From</label>
            <input
              id="report-start"
              type="date"
              className="admin-input"
              value={range?.startDate || ""}
              max={range?.endDate || todayStamp()}
              onChange={(event) =>
                onRangeChange({ ...range, startDate: event.target.value })
              }
            />
          </div>

          <div className="admin-field">
            <label htmlFor="report-end">To</label>
            <input
              id="report-end"
              type="date"
              className="admin-input"
              value={range?.endDate || ""}
              min={range?.startDate || undefined}
              max={todayStamp()}
              onChange={(event) =>
                onRangeChange({ ...range, endDate: event.target.value })
              }
            />
          </div>

          <div className="admin-field">
            <label>Quick range</label>
            <div className="report-segment" role="group" aria-label="Quick range">
              {PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  className="admin-button admin-button--ghost admin-button--sm"
                  aria-pressed={isPresetActive(preset.days)}
                  onClick={() => applyPreset(preset.days)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {showDomain ? (
        <div className="admin-field">
          <label htmlFor="report-domain">Domain</label>
          <div className="admin-search-field">
            <Globe size={14} aria-hidden="true" />
            <input
              id="report-domain"
              type="text"
              className="admin-input"
              placeholder="All domains"
              value={domain}
              onChange={(event) => onDomainChange(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}
