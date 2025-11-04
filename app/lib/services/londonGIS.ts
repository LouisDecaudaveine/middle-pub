/**
 * London GIS API Service
 * Handles fetching data from London Datastore ArcGIS MapServer
 * 
 * This service provides pure data-fetching functions.
 * Caching is handled by TanStack Query in the React layer.
 * 
 * API Documentation:
 * https://gis2.london.gov.uk/server/rest/services/apps/Cultural_infrastructure_2023_for_webapp_verified/MapServer
 */

import type { 
  Pub, 
  PubFeature, 
  PubFeatureCollection, 
  LondonGISApiResponse 
} from '../../types/pub';
import { 
  LONDON_GIS_API, 
  API_CONFIG 
} from '../constants';

/**
 * Query parameters for the London GIS API
 */
export interface QueryParams {
  where?: string;
  outFields?: string;
  f?: 'json' | 'geojson' | 'pbf';
  outSR?: number;
  resultOffset?: number;
  resultRecordCount?: number;
  returnGeometry?: boolean;
  orderByFields?: string;
}

/**
 * Error class for London GIS API errors
 */
export class LondonGISError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'LondonGISError';
  }
}

/**
 * Build query URL with parameters
 */
function buildQueryUrl(params: QueryParams = {}): string {
  const url = new URL(LONDON_GIS_API.PUBS_QUERY_URL);
  
  // Add default params
  Object.entries(LONDON_GIS_API.DEFAULT_PARAMS).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  
  // Override with custom params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Fetch with timeout
 * Note: TanStack Query handles retries, but we add timeout protection here
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new LondonGISError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new LondonGISError('Request timed out', 408);
    }
    
    throw error;
  }
}

/**
 * Transform API response to standardized format
 */
function transformResponse(response: LondonGISApiResponse): PubFeatureCollection {
  const features: PubFeature[] = response.features.map((feature) => {
    // Extract coordinates from geometry
    const [longitude, latitude] = feature.geometry.coordinates;

    // Create standardized pub object
    const pub: Pub = {
      objectid: feature.properties.objectid || 0,
      name: feature.properties.name || 'Unknown',
      address1: feature.properties.address1 || '',
      address2: feature.properties.address2,
      address3: feature.properties.address3,
      borough_name: feature.properties.borough_name || '',
      postcode: feature.properties.postcode || '',
      website: feature.properties.website,
      os_addressbase_uprn: feature.properties.os_addressbase_uprn,
      borough_code: feature.properties.borough_code,
      x: feature.properties.x || 0,
      y: feature.properties.y || 0,
      open_status: feature.properties.open_status || 0,
      verified: feature.properties.verified,
      edit_id: feature.properties.edit_id,
      sde_state_id: feature.properties.sde_state_id,
      ward_2022_name: feature.properties.ward_2022_name,
      ward_2022_code: feature.properties.ward_2022_code,
      objectid2018: feature.properties.objectid2018,
      longitude,
      latitude,
    };

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [longitude, latitude],
      },
      properties: pub,
      id: feature.id || pub.objectid,
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Fetch all pubs from the London GIS API
 * Handles pagination automatically if needed
 * 
 * Note: This is a pure data-fetching function.
 * Caching is handled by TanStack Query.
 */
export async function fetchAllPubs(): Promise<PubFeatureCollection> {
  try {
    const allFeatures: PubFeature[] = [];
    let offset = 0;
    let hasMore = true;

    // Fetch data with pagination
    while (hasMore) {
      const params: QueryParams = {
        resultOffset: offset,
        resultRecordCount: LONDON_GIS_API.MAX_RECORDS,
      };

      const url = buildQueryUrl(params);
      console.log(`Fetching pubs: offset=${offset}`);

      const response = await fetchWithTimeout(url);
      const data: LondonGISApiResponse = await response.json();

      if (!data.features || data.features.length === 0) {
        hasMore = false;
        break;
      }

      const transformed = transformResponse(data);
      allFeatures.push(...transformed.features);

      // Check if we've reached the end
      if (data.features.length < LONDON_GIS_API.MAX_RECORDS) {
        hasMore = false;
      } else {
        offset += LONDON_GIS_API.MAX_RECORDS;
      }

      // Safety check: if API indicates transfer limit exceeded, we may need pagination
      if (data.exceededTransferLimit) {
        console.warn('Transfer limit exceeded, pagination may be required');
      }
    }

    const result: PubFeatureCollection = {
      type: 'FeatureCollection',
      features: allFeatures,
    };

    console.log(`Fetched ${allFeatures.length} pubs total`);

    return result;
  } catch (error) {
    if (error instanceof LondonGISError) {
      throw error;
    }
    throw new LondonGISError(
      `Failed to fetch pubs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

/**
 * Fetch pubs with custom query parameters
 */
export async function fetchPubsWithQuery(
  params: QueryParams
): Promise<PubFeatureCollection> {
  try {
    const url = buildQueryUrl(params);
    const response = await fetchWithTimeout(url);
    const data: LondonGISApiResponse = await response.json();

    return transformResponse(data);
  } catch (error) {
    if (error instanceof LondonGISError) {
      throw error;
    }
    throw new LondonGISError(
      `Failed to fetch pubs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

/**
 * Fetch a single pub by object ID
 */
export async function fetchPubById(objectId: number): Promise<PubFeature | null> {
  try {
    const params: QueryParams = {
      where: `objectid=${objectId}`,
      resultRecordCount: 1,
    };

    const result = await fetchPubsWithQuery(params);
    return result.features[0] || null;
  } catch (error) {
    console.error(`Failed to fetch pub ${objectId}:`, error);
    return null;
  }
}

/**
 * Fetch pubs by borough
 */
export async function fetchPubsByBorough(
  borough: string
): Promise<PubFeatureCollection> {
  try {
    const params: QueryParams = {
      where: `borough_name='${borough.replace(/'/g, "''")}'`, // Escape single quotes
    };

    return await fetchPubsWithQuery(params);
  } catch (error) {
    throw new LondonGISError(
      `Failed to fetch pubs for borough ${borough}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
