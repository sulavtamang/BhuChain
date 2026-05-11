/**
 * Shared utility for resolving backend media URLs.
 * Ensures consistent image rendering across components.
 */

const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

/**
 * Resolves a partial backend path into a full absolute URL.
 * @param {string|null} path - The relative path from the database
 * @returns {string|null} The absolute URL or null if no path provided
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
