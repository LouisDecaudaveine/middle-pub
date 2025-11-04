/**
 * Pub Data Types
 * TypeScript interfaces for pub data from London GIS API
 */

/**
 * Raw pub data from London GIS ArcGIS REST API
 * Represents a single pub feature from the Cultural Infrastructure MapServer Layer 29
 */
export interface Pub {
  /** Unique identifier from the database */
  objectid: number;
  
  /** Name of the pub */
  name: string;
  
  /** Primary address line */
  address1: string;
  
  /** Secondary address line (optional) */
  address2?: string;
  
  /** Tertiary address line (optional) */
  address3?: string;
  
  /** London borough name */
  borough_name: string;
  
  /** UK postcode */
  postcode: string;
  
  /** Pub website URL (optional) */
  website?: string;
  
  /** OS AddressBase UPRN (Unique Property Reference Number) */
  os_addressbase_uprn?: string;
  
  /** Borough code */
  borough_code?: string;
  
  /** X coordinate in British National Grid (EPSG:27700) */
  x: number;
  
  /** Y coordinate in British National Grid (EPSG:27700) */
  y: number;
  
  /** Operating status (1 = open, 0 = closed) */
  open_status: number;
  
  /** Verification status */
  verified?: number;
  
  /** Edit identifier */
  edit_id?: number;
  
  /** SDE state identifier */
  sde_state_id?: number;
  
  /** Ward name (2022 boundaries) */
  ward_2022_name?: string;
  
  /** Ward code (2022 boundaries) */
  ward_2022_code?: string;
  
  /** Object ID from 2018 dataset */
  objectid2018?: number;
  
  /** WGS84 longitude (computed or from API with outSR=4326) */
  longitude?: number;
  
  /** WGS84 latitude (computed or from API with outSR=4326) */
  latitude?: number;
}

/**
 * GeoJSON Feature representing a pub
 * Standard GeoJSON format with pub properties
 */
export interface PubFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: Pub;
  id?: number | string;
}

/**
 * GeoJSON FeatureCollection of pubs
 * Used for Mapbox GL JS data sources
 */
export interface PubFeatureCollection {
  type: 'FeatureCollection';
  features: PubFeature[];
}

/**
 * API response structure from London GIS ArcGIS REST API
 */
export interface LondonGISApiResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id?: number;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: Partial<Pub>;
  }>;
  exceededTransferLimit?: boolean;
}

/**
 * Filter criteria for pub search
 */
export interface PubFilters {
  /** Filter by borough names */
  boroughs?: string[];
  
  /** Filter by open status (true = open only, false = closed only, undefined = all) */
  openOnly?: boolean;
  
  /** Search query for name or address */
  searchQuery?: string;
  
  /** Filter by postcode (partial match) */
  postcode?: string;
  
  /** Filter by ward name */
  ward?: string;
}

/**
 * Pub search result with relevance score
 */
export interface PubSearchResult {
  pub: Pub;
  score: number;
  matchedFields: string[];
}

/**
 * Statistics about the pub dataset
 */
export interface PubStats {
  total: number;
  open: number;
  closed: number;
  byBorough: Record<string, number>;
  verified: number;
}
