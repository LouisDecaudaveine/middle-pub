# London Cultural Infrastructure Webapp - Project Plan

## Project Overview
Build a web application to visualize London's cultural infrastructure (specifically Pubs) using data from the London Datastore's ArcGIS MapServer, displayed on an interactive Mapbox map with navigation capabilities.

---

## Data Source Information

### Primary API Endpoint
- **Service**: London GIS Cultural Infrastructure 2023
- **Base URL**: `https://gis2.london.gov.uk/server/rest/services/apps/Cultural_infrastructure_2023_for_webapp_verified/MapServer`
- **Layer**: Pubs (ID: 29)
- **Query Endpoint**: `https://gis2.london.gov.uk/server/rest/services/apps/Cultural_infrastructure_2023_for_webapp_verified/MapServer/29/query`

### Data Fields Available
- `objectid`: Unique identifier
- `name`: Pub name
- `address1`, `address2`, `address3`: Address components
- `borough_name`: London borough
- `postcode`: UK postcode
- `website`: Pub website URL
- `x`, `y`: Coordinates (British National Grid - EPSG:27700)
- `geom`: Geometry data
- `ward_2022_name`, `ward_2022_code`: Ward information
- `open_status`: Operating status

### Key Technical Details
- **Geometry Type**: Point (esriGeometryPoint)
- **Spatial Reference**: 27700 (British National Grid - needs conversion to WGS84 for Mapbox)
- **Max Records**: 2000 per request
- **Supported Formats**: JSON, geoJSON, PBF
- **Coordinate Conversion**: Data is in EPSG:27700, must convert to EPSG:4326 (WGS84) for Mapbox

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **UI**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS 4
- **Maps**: Mapbox GL JS v3.x
- **State Management**: React Context/Hooks

### Mapbox Services
- **Mapbox GL JS**: Core mapping library
- **Directions API**: Navigation and routing
- **Geocoding API**: Address search (optional enhancement)

### APIs & Data
- **London GIS ArcGIS REST API**: Cultural infrastructure data

---

## Project Tickets

## Phase 1: Project Setup & Configuration

### 📦 Ticket 1.1: Install Mapbox Dependencies
**Priority**: High  
**Estimated Time**: 15 minutes

**Tasks:**
- Install `mapbox-gl` npm package
- Install `@types/mapbox-gl` for TypeScript support
- Install `@mapbox/mapbox-sdk` for API integrations

**Dependencies**: None

**Acceptance Criteria:**
- [ ] Packages installed and added to package.json
- [ ] No installation errors
- [ ] TypeScript types available

---

### 🔑 Ticket 1.2: Environment Configuration
**Priority**: High  
**Estimated Time**: 10 minutes

**Tasks:**
- Create `.env.local` file
- Add Mapbox access token variable
- Add `.env.local` to `.gitignore` (if not already)
- Create `.env.example` with placeholder values
- Document how to obtain Mapbox token in README

**Dependencies**: None

**Acceptance Criteria:**
- [ ] `.env.local` file created with `NEXT_PUBLIC_MAPBOX_TOKEN`
- [ ] `.env.example` created for team reference
- [ ] Environment variables accessible in Next.js

**Environment Variables:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

---

### 📁 Ticket 1.3: Project Structure Setup
**Priority**: High  
**Estimated Time**: 20 minutes

**Tasks:**
- Create folder structure for components
- Create folder structure for utilities
- Create folder structure for types
- Create folder structure for API services

**Dependencies**: None

**Folder Structure:**
```
app/
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx
│   │   ├── PubMarker.tsx
│   │   └── NavigationControls.tsx
│   └── ui/
│       ├── PubCard.tsx
│       ├── SearchBar.tsx
│       └── FilterPanel.tsx
├── lib/
│   ├── services/
│   │   ├── londonGIS.ts
│   │   └── mapbox.ts
│   ├── utils/
│   │   ├── coordinates.ts
│   │   └── formatters.ts
│   └── constants.ts
├── types/
│   ├── pub.ts
│   └── map.ts
└── hooks/
    ├── useMapbox.ts
    └── usePubData.ts
```

**Acceptance Criteria:**
- [ ] All folders created
- [ ] Each folder has proper index files if needed
- [ ] Structure follows Next.js App Router conventions

---

## Phase 2: Type Definitions & Constants

### 📝 Ticket 2.1: Define TypeScript Interfaces
**Priority**: High  
**Estimated Time**: 30 minutes

**Tasks:**
- Create Pub data interface matching API response
- Create GeoJSON feature type for pubs
- Create Map configuration types
- Create filter and search types

**Dependencies**: 1.3

**Files to Create:**
- `types/pub.ts`
- `types/map.ts`

**Acceptance Criteria:**
- [ ] All API response fields typed
- [ ] GeoJSON types properly defined
- [ ] No TypeScript errors
- [ ] Proper documentation comments

**Sample Type Definition:**
```typescript
interface Pub {
  objectid: number;
  name: string;
  address1: string;
  address2?: string;
  address3?: string;
  borough_name: string;
  postcode: string;
  website?: string;
  x: number; // British National Grid
  y: number; // British National Grid
  longitude?: number; // WGS84
  latitude?: number; // WGS84
  open_status: number;
  ward_2022_name?: string;
  ward_2022_code?: string;
}
```

---

### 🔧 Ticket 2.2: Create Constants & Configuration
**Priority**: Medium  
**Estimated Time**: 15 minutes

**Tasks:**
- Define API endpoints as constants
- Define default map settings (center, zoom, bounds)
- Define London boroughs list
- Define map styles and theme colors

**Dependencies**: 2.1

**Files to Create:**
- `lib/constants.ts`

**Acceptance Criteria:**
- [ ] All API URLs centralized
- [ ] Map defaults set (centered on London)
- [ ] Constants properly exported and typed

**Constants to Define:**
- London center coordinates: `[-0.1276, 51.5074]`
- Default zoom level: `10`
- API base URL
- Max results per query

---

## Phase 3: Data Fetching & Processing

### 🌐 Ticket 3.1: Create London GIS API Service
**Priority**: High  
**Estimated Time**: 1.5 hours

**Tasks:**
- Create service class/functions for London GIS API
- Implement query builder for ArcGIS REST API
- Handle pagination (max 2000 records per request)
- Implement error handling and retries
- Add request caching strategy

**Dependencies**: 2.1, 2.2

**Files to Create:**
- `lib/services/londonGIS.ts`

**Acceptance Criteria:**
- [ ] Can fetch all pubs from Layer 29
- [ ] Handles pagination automatically
- [ ] Proper error handling
- [ ] Returns typed data
- [ ] Includes retry logic for failed requests

**API Query Parameters:**
```
where: 1=1 (get all records)
outFields: * (all fields)
f: geojson (GeoJSON format)
outSR: 4326 (WGS84 spatial reference)
```

---

### 🗺️ Ticket 3.2: Coordinate Transformation Utility
**Priority**: Not Required - handled by API  
**Estimated Time**: 45 minutes

**Tasks:**
- Research coordinate transformation (EPSG:27700 → EPSG:4326)
- Implement transformation function (consider using proj4js)
- Create utility to convert bulk coordinates
- Add validation for coordinate bounds

**Dependencies**: 2.1

**Files to Create:**
- `lib/utils/coordinates.ts`

**Acceptance Criteria:**
- [ ] Accurate coordinate conversion
- [ ] Handles edge cases (null, invalid coordinates)
- [ ] Performance optimized for bulk operations
- [ ] Unit tests for sample coordinates

**Note**: The API supports `outSR: 4326` parameter which should return WGS84 coordinates directly, avoiding manual transformation. Test this first!

---

### 🔄 Ticket 3.3: Create Custom Data Hooks
**Priority**: Medium  
**Estimated Time**: 1 hour

**Tasks:**
- Create `usePubData` hook for fetching and managing pub data
- Implement loading, error, and success states
- Add filtering capabilities (by borough, status, etc.)
- Implement client-side search functionality

**Dependencies**: 3.1, 3.2

**Files to Create:**
- `hooks/usePubData.ts`

**Acceptance Criteria:**
- [ ] Hook returns loading, error, and data states
- [ ] Supports filtering by multiple criteria
- [ ] Efficient re-rendering
- [ ] Search functionality works

---

## Phase 4: Map Implementation

### 🗾 Ticket 4.1: Create Base Map Component
**Priority**: High  
**Estimated Time**: 2 hours

**Tasks:**
- Create MapContainer component with Mapbox GL JS
- Initialize map with London centered view
- Add zoom and rotation controls
- Handle map loading states
- Implement responsive design
- Add proper cleanup on unmount

**Dependencies**: 1.1, 1.2, 2.2

**Files to Create:**
- `app/components/map/MapContainer.tsx`

**Acceptance Criteria:**
- [ ] Map renders without errors
- [ ] Centered on London with appropriate zoom
- [ ] Controls visible and functional
- [ ] Responsive to window resize
- [ ] No memory leaks
- [ ] Dark/light mode support (optional)

**Mapbox Style Options:**
- `mapbox://styles/mapbox/streets-v12`
- `mapbox://styles/mapbox/light-v11`
- `mapbox://styles/mapbox/dark-v11`

---

### 📍 Ticket 4.2: Add Pub Markers to Map
**Priority**: High  
**Estimated Time**: 2 hours

**Tasks:**
- Create GeoJSON source from pub data
- Add point layer to map
- Style markers (custom icon or circle)
- Implement clustering for dense areas
- Add hover effects
- Optimize rendering performance

**Dependencies**: 4.1, 3.3

**Files to Update:**
- `app/components/map/MapContainer.tsx`

**Acceptance Criteria:**
- [ ] All pubs displayed on map
- [ ] Markers clustered when zoomed out
- [ ] Hover shows pub name
- [ ] Performance remains smooth (2000+ points)
- [ ] Custom pub icon used

**Performance Considerations:**
- Use Mapbox GL JS clustering
- Limit initial render to visible bounds
- Lazy load markers on zoom/pan

---

### 🎯 Ticket 4.3: Implement Marker Click & Popups
**Priority**: High  
**Estimated Time**: 1.5 hours

**Tasks:**
- Add click event listeners to markers
- Create popup component with pub details
- Display name, address, borough, website
- Add "Get Directions" button
- Style popup with Tailwind CSS

**Dependencies**: 4.2

**Files to Create:**
- `app/components/map/PubPopup.tsx`

**Files to Update:**
- `app/components/map/MapContainer.tsx`

**Acceptance Criteria:**
- [ ] Popup shows on marker click
- [ ] All relevant pub info displayed
- [ ] Website link opens in new tab
- [ ] Popup closes properly
- [ ] Responsive design

**Popup Content:**
- Pub name (bold, larger font)
- Full address
- Borough
- Postcode
- Website link (if available)
- "Get Directions" button

---

### 🎨 Ticket 4.4: Custom Map Styling
**Priority**: Low  
**Estimated Time**: 1 hour

**Tasks:**
- Create custom Mapbox style or modify existing
- Match brand colors
- Enhance readability for cultural sites
- Add custom pub icon/marker design

**Dependencies**: 4.1

**Acceptance Criteria:**
- [ ] Map style matches app design
- [ ] Good contrast and readability
- [ ] Custom pub marker icon
- [ ] Consistent with overall UI theme

---

## Phase 5: Navigation Features

### 🧭 Ticket 5.1: Integrate Mapbox Directions API
**Priority**: Medium  
**Estimated Time**: 2 hours

**Tasks:**
- Create Mapbox service wrapper
- Implement directions request function
- Support multiple travel modes (walking, cycling, driving)
- Parse and format direction responses
- Handle API errors

**Dependencies**: 1.1, 1.2

**Files to Create:**
- `lib/services/mapbox.ts`

**Acceptance Criteria:**
- [ ] Can request directions between two points
- [ ] Supports walking, cycling, driving modes
- [ ] Returns route geometry and instructions
- [ ] Error handling implemented
- [ ] API rate limiting considered

**Mapbox Directions API:**
- Endpoint: `https://api.mapbox.com/directions/v5/mapbox/{profile}/{coordinates}`
- Profiles: `walking`, `cycling`, `driving`

---

### 🚶 Ticket 5.2: Display Route on Map
**Priority**: Medium  
**Estimated Time**: 2 hours

**Tasks:**
- Add route layer to map
- Draw route polyline
- Add start/end markers
- Show travel time and distance
- Allow route clearing
- Add turn-by-turn instructions panel

**Dependencies**: 5.1, 4.3

**Files to Create:**
- `app/components/map/RouteLayer.tsx`
- `app/components/map/DirectionsPanel.tsx`

**Acceptance Criteria:**
- [ ] Route drawn on map
- [ ] Clear visual distinction from other layers
- [ ] Instructions panel shows steps
- [ ] Can clear/reset route
- [ ] Travel mode selector works

---

### 📍 Ticket 5.3: "Get Directions" Feature
**Priority**: Medium  
**Estimated Time**: 1.5 hours

**Tasks:**
- Implement user location detection
- Add "Get Directions" button to pub popups
- Request directions from user location to pub
- Handle location permission denied
- Add manual start location input option

**Dependencies**: 5.2

**Files to Update:**
- `app/components/map/PubPopup.tsx`
- `app/components/map/MapContainer.tsx`

**Acceptance Criteria:**
- [ ] Button triggers directions request
- [ ] Uses user's current location as start
- [ ] Fallback for location unavailable
- [ ] Loading state during route calculation
- [ ] Error messages for failures

---

## Phase 6: UI/UX Enhancements

### 🔍 Ticket 6.1: Search Bar Component
**Priority**: Medium  
**Estimated Time**: 2 hours

**Tasks:**
- Create search input component
- Implement autocomplete for pub names
- Search by address/postcode
- Display search results
- Zoom to selected pub on map
- Clear search functionality

**Dependencies**: 3.3

**Files to Create:**
- `app/components/ui/SearchBar.tsx`

**Acceptance Criteria:**
- [ ] Real-time search as user types
- [ ] Autocomplete suggestions
- [ ] Keyboard navigation (arrows, enter)
- [ ] Click result to view on map
- [ ] Responsive design
- [ ] Clear button works

---

### 🎛️ Ticket 6.2: Filter Panel
**Priority**: Medium  
**Estimated Time**: 2.5 hours

**Tasks:**
- Create filter panel component
- Add borough filter (multi-select)
- Add open status filter
- Implement "Apply Filters" logic
- Show filtered results count
- Add "Clear Filters" button
- Make panel collapsible/expandable

**Dependencies**: 3.3

**Files to Create:**
- `app/components/ui/FilterPanel.tsx`

**Acceptance Criteria:**
- [ ] Multiple filter types work
- [ ] Filters combine correctly (AND logic)
- [ ] Results update on map
- [ ] Count displays accurately
- [ ] Collapsible on mobile
- [ ] Accessible keyboard navigation

**Filter Options:**
- Boroughs (33 London boroughs - multi-select)
- Open Status (checkbox)
- Search radius (slider - optional)

---

### 📱 Ticket 6.3: Sidebar/Panel Layout
**Priority**: Medium  
**Estimated Time**: 2 hours

**Tasks:**
- Create responsive sidebar layout
- Show list of filtered pubs
- Add pub cards with preview info
- Implement scroll sync with map
- Highlight selected pub
- Mobile drawer/modal view

**Dependencies**: 6.1, 6.2

**Files to Create:**
- `app/components/ui/PubList.tsx`
- `app/components/ui/PubCard.tsx`

**Acceptance Criteria:**
- [ ] Sidebar shows filtered pubs
- [ ] Click card to highlight on map
- [ ] Scrollable list
- [ ] Works on mobile (drawer)
- [ ] Loading states
- [ ] Empty states

---

### 🎨 Ticket 6.4: Loading & Error States
**Priority**: Medium  
**Estimated Time**: 1 hour

**Tasks:**
- Create loading spinner component
- Create error message component
- Add skeleton loaders for map and list
- Implement retry buttons
- Add empty state illustrations

**Dependencies**: None

**Files to Create:**
- `app/components/ui/LoadingSpinner.tsx`
- `app/components/ui/ErrorMessage.tsx`
- `app/components/ui/EmptyState.tsx`

**Acceptance Criteria:**
- [ ] Loading states feel responsive
- [ ] Error messages are helpful
- [ ] Retry functionality works
- [ ] Empty states have clear calls-to-action
- [ ] Accessible (ARIA labels)

---

## Phase 7: Optimization & Polish

### ⚡ Ticket 7.1: Performance Optimization
**Priority**: High  
**Estimated Time**: 2 hours

**Tasks:**
- Implement React.memo for expensive components
- Add virtualization for long pub lists
- Optimize map re-renders
- Lazy load components
- Add service worker for caching (optional)
- Optimize image assets

**Dependencies**: All previous tickets

**Acceptance Criteria:**
- [ ] Lighthouse performance score > 80
- [ ] No unnecessary re-renders
- [ ] Fast initial load time
- [ ] Smooth map interactions
- [ ] Efficient memory usage

---

### 📱 Ticket 7.2: Responsive Design & Mobile Optimization
**Priority**: High  
**Estimated Time**: 2 hours

**Tasks:**
- Test on various screen sizes
- Adjust touch targets for mobile
- Implement mobile-specific navigation
- Optimize map controls for touch
- Test on real devices

**Dependencies**: All UI tickets

**Acceptance Criteria:**
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Touch gestures work correctly
- [ ] No horizontal scroll

---

### ♿ Ticket 7.3: Accessibility Improvements
**Priority**: Medium  
**Estimated Time**: 1.5 hours

**Tasks:**
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation works
- Add focus indicators
- Test with screen readers
- Add skip navigation links
- Ensure color contrast meets WCAG AA

**Dependencies**: All UI tickets

**Acceptance Criteria:**
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Lighthouse accessibility score > 90

---

### 🧪 Ticket 7.4: Error Handling & Edge Cases
**Priority**: Medium  
**Estimated Time**: 1.5 hours

**Tasks:**
- Handle API failures gracefully
- Handle network offline scenarios
- Handle malformed data
- Handle geolocation errors
- Add proper error boundaries
- Log errors for debugging

**Dependencies**: All functionality tickets

**Acceptance Criteria:**
- [ ] No unhandled errors
- [ ] User-friendly error messages
- [ ] App doesn't crash on errors
- [ ] Errors logged appropriately
- [ ] Retry mechanisms work

---

## Phase 8: Testing & Documentation

### 🧪 Ticket 8.1: Unit Testing
**Priority**: Medium  
**Estimated Time**: 3 hours

**Tasks:**
- Set up testing framework (Jest + React Testing Library)
- Write tests for utility functions
- Write tests for hooks
- Write tests for API services
- Achieve >70% code coverage

**Dependencies**: All development tickets

**Files to Create:**
- `jest.config.js`
- `__tests__/` directory

**Acceptance Criteria:**
- [ ] Testing framework configured
- [ ] Critical paths tested
- [ ] Tests pass consistently
- [ ] Coverage report generated

---

### 🌐 Ticket 8.2: Integration Testing
**Priority**: Low  
**Estimated Time**: 2 hours

**Tasks:**
- Test complete user flows
- Test map interactions
- Test search and filter combinations
- Test navigation features
- Test on different browsers

**Dependencies**: 8.1

**Acceptance Criteria:**
- [ ] Key user flows tested
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile browsers tested

---

### 📚 Ticket 8.3: Documentation
**Priority**: Medium  
**Estimated Time**: 2 hours

**Tasks:**
- Update README with setup instructions
- Document API usage and rate limits
- Add code comments for complex logic
- Create user guide for features
- Document environment variables
- Add troubleshooting section

**Dependencies**: All tickets

**Files to Update:**
- `README.md`

**Files to Create:**
- `SETUP.md`
- `API_DOCUMENTATION.md`

**Acceptance Criteria:**
- [ ] Clear setup instructions
- [ ] API documentation complete
- [ ] User guide written
- [ ] Troubleshooting guide added
- [ ] Code comments helpful

---

## Phase 9: Deployment & Launch

### 🚀 Ticket 9.1: Deployment Setup
**Priority**: High  
**Estimated Time**: 1.5 hours

**Tasks:**
- Configure Vercel/Netlify deployment
- Set up environment variables in hosting platform
- Configure custom domain (if applicable)
- Set up CI/CD pipeline
- Add deployment status checks

**Dependencies**: All development tickets

**Acceptance Criteria:**
- [ ] App deployed successfully
- [ ] Environment variables configured
- [ ] Automatic deployments on push
- [ ] Preview deployments work
- [ ] Custom domain configured (if applicable)

---

### 🔒 Ticket 9.2: Security & API Key Management
**Priority**: High  
**Estimated Time**: 1 hour

**Tasks:**
- Review exposed API keys
- Implement API key restrictions (domain, IP)
- Set up rate limiting
- Review CORS configuration
- Add security headers

**Dependencies**: 9.1

**Acceptance Criteria:**
- [ ] API keys restricted appropriately
- [ ] No sensitive data exposed in client
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] HTTPS enforced

---

### 📊 Ticket 9.3: Analytics & Monitoring
**Priority**: Low  
**Estimated Time**: 1 hour

**Tasks:**
- Set up analytics (Google Analytics/Plausible)
- Add error tracking (Sentry)
- Monitor API usage
- Set up uptime monitoring
- Create dashboard for key metrics

**Dependencies**: 9.1

**Acceptance Criteria:**
- [ ] Analytics tracking pageviews
- [ ] Error tracking operational
- [ ] API usage monitored
- [ ] Uptime monitoring active
- [ ] Dashboard accessible

---

## Phase 10: Future Enhancements (Optional)

### 🌟 Ticket 10.1: Additional Data Layers
**Priority**: Low  
**Estimated Time**: 3 hours

**Tasks:**
- Explore other cultural infrastructure layers (0-28)
- Add layer toggle in UI
- Support multiple venue types (museums, theaters, etc.)
- Create legend for different venue types

**Dependencies**: Phase 4 complete

---

### 🗺️ Ticket 10.2: Advanced Mapping Features
**Priority**: Low  
**Estimated Time**: 4 hours

**Tasks:**
- Add 3D building layer
- Implement heatmap view
- Add draw/measure tools
- Export map as image
- Save favorite locations

**Dependencies**: Phase 4 complete

---

### 🤖 Ticket 10.3: AI-Powered Recommendations
**Priority**: Low  
**Estimated Time**: 5 hours

**Tasks:**
- Integrate recommendation engine
- Suggest pubs based on user preferences
- "Find similar pubs" feature
- Route optimization for pub crawls
- Save and share pub routes

**Dependencies**: Phase 5 complete

---

## Summary

### Total Estimated Time
- **Phase 1-3 (Foundation)**: ~8 hours
- **Phase 4-5 (Core Features)**: ~15 hours
- **Phase 6-7 (Enhancement)**: ~13 hours
- **Phase 8-9 (Testing & Deploy)**: ~11 hours
- **Total Core Development**: ~47 hours

### Critical Path
1. Setup (1.1, 1.2, 1.3)
2. Types & Constants (2.1, 2.2)
3. Data Fetching (3.1, 3.2, 3.3)
4. Base Map (4.1, 4.2, 4.3)
5. Navigation (5.1, 5.2, 5.3)
6. UI Polish (6.1, 6.2, 6.3)
7. Testing & Deploy (8.3, 9.1, 9.2)

### Prerequisites Before Starting
1. ✅ Obtain Mapbox API access token
2. ✅ Test London GIS API endpoint
3. ✅ Set up development environment
4. ✅ Review Next.js App Router documentation

### Key Technical Decisions
- **Coordinate System**: Use `outSR=4326` in API requests to get WGS84 directly
- **Data Volume**: ~2000 pubs total (within single request limit)
- **Mapping Library**: Mapbox GL JS (modern, performant, great documentation)
- **State Management**: React hooks (sufficient for this scale)
- **Deployment**: Vercel (optimized for Next.js)

---

## Getting Started

To begin development, execute tickets in order by phase. Start with Phase 1 to set up the foundation, then proceed through phases sequentially. Some tickets can be parallelized within a phase if multiple developers are working on the project.

**Next Steps:**
1. Review this plan with the team
2. Set up Mapbox account and get API token
3. Test data API endpoints
4. Begin with Ticket 1.1
