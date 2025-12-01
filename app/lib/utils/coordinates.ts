/**
 * Coordinate Utilities
 * Functions for coordinate transformation and validation
 * EPSG:27700 (British National Grid) -> EPSG:4326 (WGS84)
 */

// Implementation - Ticket 3.2

/**
 * Decode a Google Encoded Polyline into an array of [lng, lat] coordinates
 * Based on the Google Polyline Algorithm
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 *
 * @param encoded - The encoded polyline string
 * @param precision - Coordinate precision (default: 5 for Google, 6 for Mapbox)
 * @returns Array of [longitude, latitude] tuples for use with Mapbox
 */
export function decodePolyline(
  encoded: string,
  precision: number = 5
): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    // Decode latitude
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    // Convert to decimal and add to coordinates
    // Note: Mapbox uses [lng, lat] order, Google uses [lat, lng]
    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}
