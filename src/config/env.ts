export const isDevelopment = import.meta.env.NODE_ENV === 'development';
export const baseUrl = import.meta.env.BASE_URL || '';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
export const isPrerender
  = navigator.userAgent.includes('Prerender (+https://github.com/prerender/prerender)');
