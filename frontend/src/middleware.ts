import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames, ignore /admin, /api, /_next, etc.
  matcher: ['/((?!api|_next|_vercel|admin|uploads|.*\\..*).*)'],
};
