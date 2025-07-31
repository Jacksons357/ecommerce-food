/**
 * Helper function to generate correct asset URLs
 * This ensures assets are properly served in both development and production
 */
export function asset(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get the current URL to determine the base URL
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // In development, assets are served from the public directory
  // In production, they might be served from a CDN or different path
  if (import.meta.env.DEV) {
    return `${currentUrl}/${cleanPath}`;
  }
  
  // For production, you might want to use a CDN or different base path
  return `${currentUrl}/${cleanPath}`;
}

/**
 * Helper function specifically for banner images
 */
export function bannerImage(filename: string): string {
  return asset(`images/banners/${filename}`);
} 