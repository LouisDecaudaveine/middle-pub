/**
 * Coordinate Utilities
 * Functions for coordinate transformation and validation
 * EPSG:27700 (British National Grid) -> EPSG:4326 (WGS84)
 */

import type { GoogleRouteLegStep } from "@/types/routes";

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

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 - First coordinate [lng, lat]
 * @param coord2 - Second coordinate [lng, lat]
 * @returns Distance in meters
 */
function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371000; // Earth's radius in meters
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const deltaLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const deltaLng = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get the coordinate at a specific position along a polyline
 * @param polyline - Array of [lng, lat] coordinates
 * @param position - Position along the polyline (0 = start, 1 = end)
 * @returns The [lng, lat] coordinate at the specified position
 */
export function getPositionOnPolyline(
  polyline: [number, number][],
  position: number
): [number, number] {
  if (polyline.length === 0) {
    throw new Error("Polyline must have at least one coordinate");
  }

  if (polyline.length === 1) {
    return polyline[0];
  }

  // Clamp position to [0, 1]
  const clampedPosition = Math.max(0, Math.min(1, position));

  if (clampedPosition === 0) {
    return polyline[0];
  }

  if (clampedPosition === 1) {
    return polyline[polyline.length - 1];
  }

  // Calculate total length and segment lengths
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const length = haversineDistance(polyline[i], polyline[i + 1]);
    segmentLengths.push(length);
    totalLength += length;
  }

  // Find target distance
  const targetDistance = clampedPosition * totalLength;

  // Walk along segments to find the position
  let accumulatedDistance = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segmentLength = segmentLengths[i];

    if (accumulatedDistance + segmentLength >= targetDistance) {
      // Target is within this segment
      const remainingDistance = targetDistance - accumulatedDistance;
      const segmentRatio =
        segmentLength > 0 ? remainingDistance / segmentLength : 0;

      // Linear interpolation between segment start and end
      const startCoord = polyline[i];
      const endCoord = polyline[i + 1];

      const lng = startCoord[0] + (endCoord[0] - startCoord[0]) * segmentRatio;
      const lat = startCoord[1] + (endCoord[1] - startCoord[1]) * segmentRatio;

      return [lng, lat];
    }

    accumulatedDistance += segmentLength;
  }

  // Fallback to last coordinate (shouldn't reach here normally)
  return polyline[polyline.length - 1];
}

/**
 * Parse a Google duration string (e.g., "120s") to seconds
 * @param duration - Duration string in format "Xs" where X is seconds
 * @returns Duration in seconds
 */
function parseDurationToSeconds(duration: string | undefined): number {
  if (!duration) return 0;
  return parseFloat(duration.replace("s", ""));
}

/**
 * Find the midpoint coordinate of a route based on duration
 * Finds the step that contains the temporal middle of the route,
 * then returns the coordinate at the middle of that step's polyline
 *
 * @param steps - Array of GoogleRouteLegStep from the Routes API
 * @returns The [lng, lat] coordinate at the middle of the route, or null if invalid
 */
export function getRouteMidpointByDuration(
  steps: GoogleRouteLegStep[]
): [number, number] | null {
  if (!steps || steps.length === 0) {
    return null;
  }

  // Calculate total duration and step durations
  const stepDurations = steps.map((step) =>
    parseDurationToSeconds(step.staticDuration)
  );
  const totalDuration = stepDurations.reduce((sum, d) => sum + d, 0);

  if (totalDuration === 0) {
    return null;
  }

  const targetTime = totalDuration / 2;

  // Find the step that contains the midpoint
  let accumulatedTime = 0;

  for (let i = 0; i < steps.length; i++) {
    const stepDuration = stepDurations[i];

    if (accumulatedTime + stepDuration >= targetTime) {
      // The midpoint is within this step
      const step = steps[i];

      if (!step.polyline?.encodedPolyline) {
        return null;
      }

      // Decode the step's polyline
      const polyline = decodePolyline(step.polyline.encodedPolyline);

      if (polyline.length === 0) {
        return null;
      }

      // Calculate position within this step (0-1)
      const timeIntoStep = targetTime - accumulatedTime;
      const positionInStep =
        stepDuration > 0 ? timeIntoStep / stepDuration : 0.5;

      // Get the coordinate at that position
      return getPositionOnPolyline(polyline, positionInStep);
    }

    accumulatedTime += stepDuration;
  }

  // Fallback: return the midpoint of the last step
  const lastStep = steps[steps.length - 1];
  if (lastStep.polyline?.encodedPolyline) {
    const polyline = decodePolyline(lastStep.polyline.encodedPolyline);
    return getPositionOnPolyline(polyline, 0.5);
  }

  return null;
}

/**
 * Check which coordinates are within a threshold distance from a center point
 *
 * @param centerPoint - The reference coordinate [lng, lat] to measure distance from
 * @param positions - Array of [lng, lat] coordinates to check
 * @param thresholdMeters - Maximum distance in meters from the center point
 * @returns Array of booleans (true = within threshold, false = outside threshold)
 */
export function filterPositionsWithinThreshold(
  centerPoint: [number, number],
  positions: [number, number][],
  thresholdMeters: number
): boolean[] {
  return positions.map((position) => {
    const distance = haversineDistance(centerPoint, position);
    return distance <= thresholdMeters;
  });
}
