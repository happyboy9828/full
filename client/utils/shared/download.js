/** Result of downloadBlob:
 *   { ok: true  }           – download initiated
 *   { ok: false, reason }   – blocked; reason is "error"
 */
export function downloadBlob(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `Download failed: ${err.message}` };
  }
}
