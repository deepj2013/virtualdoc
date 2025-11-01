/**
 * Typography System for SaaS Dashboard
 * Consistent typography across all components
 */

export const typography = {
  // Headings
  h1: 'text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white',
  h2: 'text-3xl sm:text-4xl font-bold leading-tight text-gray-900 dark:text-white',
  h3: 'text-2xl sm:text-3xl font-bold leading-snug text-gray-900 dark:text-white',
  h4: 'text-xl sm:text-2xl font-semibold leading-snug text-gray-900 dark:text-white',
  h5: 'text-lg sm:text-xl font-semibold leading-snug text-gray-900 dark:text-white',
  h6: 'text-base sm:text-lg font-semibold leading-normal text-gray-900 dark:text-white',

  // Body Text
  body: 'text-base leading-relaxed text-gray-700 dark:text-gray-300',
  bodyLarge: 'text-lg leading-relaxed text-gray-700 dark:text-gray-300',
  bodySmall: 'text-sm leading-normal text-gray-600 dark:text-gray-400',

  // Labels
  label: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
  labelSmall: 'text-xs font-medium text-gray-600 dark:text-gray-400',

  // Links
  link: 'text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors',
  linkSmall: 'text-sm text-primary hover:text-primary-600 dark:text-primary-400 font-medium transition-colors',

  // Utility Classes
  muted: 'text-gray-500 dark:text-gray-400',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export default typography;

