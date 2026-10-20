/**
 * Layout for the admin area (/kingdome/*).
 *
 * It renders a hidden marker element. The root layout's marketing navbar and
 * footer are hidden with a pure-CSS `body:has(#admin-route-marker)` rule, so
 * the admin area is full-bleed from the very first paint — no flash of site
 * chrome and no client-side script mutating React-managed attributes.
 */
export default function KingdomeLayout({ children }) {
  return (
    <>
      {children}
      <div id="admin-route-marker" hidden aria-hidden="true" />
    </>
  );
}
