export function validOrigin(
  origin: string | null,
  requestUrl: string,
  host: string | null,
) {
  if (!origin) return true;
  try {
    return (
      new URL(origin).host.toLowerCase() ===
      (host || new URL(requestUrl).host).toLowerCase()
    );
  } catch {
    return false;
  }
}
