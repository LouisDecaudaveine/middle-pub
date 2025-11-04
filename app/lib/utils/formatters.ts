/**
 * Data Formatting Utilities
 * Helper functions for formatting addresses, dates, distances, etc.
 */

export function formatAddress(
  address1?: string,
  address2?: string,
  address3?: string,
  postcode?: string
): string {
  const parts = [address1, address2, address3, postcode].filter(Boolean);
  return parts.join(', ');
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
