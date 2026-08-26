export const SITE_URL = 'https://anne-chataigner.vercel.app';

const configuredBookingUrl = import.meta.env.PUBLIC_BOOKING_URL;

/**
 * Replace PUBLIC_BOOKING_URL with the real scheduling URL before launch.
 * The fallback keeps the CTA actionable by taking visitors to the contact
 * section on the home page without exposing an invented booking provider.
 */
export const BOOKING_URL = configuredBookingUrl?.trim() || '/#contact';
export const BOOKING_IS_CONFIGURED = Boolean(configuredBookingUrl?.trim());

export const SECONDARY_ROUTES = [
  '/a-propos',
  '/coaching',
  '/therapies-breves',
  '/hypnose-ericksonienne',
  '/consultation-couple',
  '/tarifs',
  '/mentions-legales',
  '/politique-confidentialite'
] as const;

export const PAGE_THEMES: Record<string, string> = {
  '/a-propos': 'about',
  '/coaching': 'coaching',
  '/therapies-breves': 'therapies',
  '/hypnose-ericksonienne': 'hypnose',
  '/consultation-couple': 'couple',
  '/tarifs': 'pricing',
  '/mentions-legales': 'neutral',
  '/politique-confidentialite': 'neutral'
};

export function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

export function isSecondaryRoute(pathname: string) {
  return SECONDARY_ROUTES.includes(normalizePathname(pathname) as (typeof SECONDARY_ROUTES)[number]);
}
