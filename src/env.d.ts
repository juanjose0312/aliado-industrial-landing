interface ImportMetaEnv {
  /** URL /exec de la aplicación web de Google Apps Script */
  readonly SHEETS_WEBHOOK_URL?: string;
  /** Secreto compartido con la propiedad SECRET del script */
  readonly SHEETS_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
  __aliadoTracking?: boolean;
}
