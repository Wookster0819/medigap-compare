// App-level configuration — override via environment variables.
// Set VITE_APP_NAME in .env or your deployment environment.
export const config = {
  appName: import.meta.env.VITE_APP_NAME ?? 'GH2 Benefits',
  leadEmail: import.meta.env.VITE_LEAD_EMAIL ?? 'info@gh2benefits.com',
  leadSubject: import.meta.env.VITE_LEAD_SUBJECT ?? 'Medigap Lead',
} as const;
