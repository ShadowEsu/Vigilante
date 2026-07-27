/**
 * Thrown by the filesystem store when the host filesystem is not writable
 * (e.g. Vercel's read-only serverless FS). The API routes catch this and return
 * a 503 + { readOnly: true } so the terminal can show a clear message.
 *
 * With VIGILANTE_STORAGE=supabase this is never thrown — persistence goes to
 * Postgres, which is writable everywhere.
 */
export class ReadOnlyStoreError extends Error {
  constructor() {
    super(
      "This deployment is read-only — it serves a saved scan. Run Vigilante locally to add targets and trigger live scans."
    );
    this.name = "ReadOnlyStoreError";
  }
}
