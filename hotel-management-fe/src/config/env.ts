export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: import.meta.env.VITE_API_PREFIX ?? '/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'Hotel Management',
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.1.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
