# Goong Map Integration

This module provides Goong Map integration for the Flood Rescue application.

## Components

### GoongMap (Base Component)
Base map component that provides core Goong Map functionality.

**Props:**
- `center?: [number, number]` - Map center coordinates [lng, lat]
- `zoom?: number` - Initial zoom level
- `style?: string` - Map style URL
- `className?: string` - CSS class name
- `onLoad?: (map: Map) => void` - Callback when map loads
- `children?: (map: Map | null) => React.ReactNode` - Render prop for custom content

### GoongMissionMap
Dashboard map for Mission Detail Page showing all requests and warehouses.

**Props:**
- `requests: CoordinatorRequest[]` - Array of requests to display
- `warehouses?: Warehouse[]` - Array of warehouses to display
- `onRequestClick?: (request: CoordinatorRequest) => void` - Callback when request marker is clicked
- `className?: string` - CSS class name
- `height?: string` - Map height (default: "500px")

**Features:**
- Priority-based marker colors (Critical: Red, High: Orange, Normal: Blue)
- Warehouse markers with custom icons
- Filter by priority
- Auto-fit bounds to show all markers
- Click on markers to view details

### GoongRequestMap
Map for Request Detail Page with search and location update capabilities.

**Props:**
- `request: CoordinatorRequest` - Request to display
- `warehouses?: Warehouse[]` - Array of warehouses
- `onLocationUpdate?: (lat: number, lng: number, address: string) => void` - Callback when location is updated
- `className?: string` - CSS class name
- `height?: string` - Map height (default: "400px")
- `allowLocationUpdate?: boolean` - Enable draggable marker and search

**Features:**
- Display request with priority-based marker color
- Show 5 nearest warehouses
- Search box with Goong Places API autocomplete
- Draggable marker to update location
- Reverse geocoding to get address

### SearchBox
Autocomplete search box using Goong Places API.

**Props:**
- `onPlaceSelect: (place: { lat: number; lng: number; address: string; placeId: string }) => void` - Callback when place is selected
- `placeholder?: string` - Input placeholder
- `className?: string` - CSS class name

**Features:**
- Debounced search (300ms)
- Autocomplete dropdown
- Click outside to close
- Loading state

## Hooks

### useGoongGeocoding
Hook for geocoding and reverse geocoding.

**Returns:**
- `geocode: (address: string) => Promise<GeocodeResult | null>` - Convert address to coordinates
- `reverseGeocode: (lat: number, lng: number) => Promise<string | null>` - Convert coordinates to address
- `loading: boolean` - Loading state
- `error: string | null` - Error message

### useGoongPlaces
Hook for searching places using Goong Places API.

**Returns:**
- `predictions: PlacePrediction[]` - Search results
- `searchPlaces: (input: string, options?) => Promise<PlacePrediction[]>` - Search function
- `getPlaceDetail: (placeId: string) => Promise<PlaceDetail | null>` - Get place details
- `clearPredictions: () => void` - Clear search results
- `loading: boolean` - Loading state
- `error: string | null` - Error message

## API Routes

### /api/goong/geocode
Convert address to coordinates.

**Query Parameters:**
- `address: string` - Address to geocode

**Response:**
```json
{
  "results": [{
    "formatted_address": "string",
    "geometry": {
      "location": { "lat": number, "lng": number }
    },
    "place_id": "string"
  }]
}
```

### /api/goong/reverse-geocode
Convert coordinates to address.

**Query Parameters:**
- `lat: number` - Latitude
- `lng: number` - Longitude

**Response:**
```json
{
  "results": [{
    "formatted_address": "string",
    "geometry": {
      "location": { "lat": number, "lng": number }
    }
  }]
}
```

### /api/goong/places
Search for places with autocomplete.

**Query Parameters:**
- `input: string` - Search query
- `location?: string` - Bias location (lat,lng)
- `radius?: number` - Search radius in meters

**Response:**
```json
{
  "predictions": [{
    "description": "string",
    "place_id": "string",
    "structured_formatting": {
      "main_text": "string",
      "secondary_text": "string"
    }
  }]
}
```

### /api/goong/place-detail
Get detailed information about a place.

**Query Parameters:**
- `place_id: string` - Place ID from search results

**Response:**
```json
{
  "result": {
    "formatted_address": "string",
    "geometry": {
      "location": { "lat": number, "lng": number }
    },
    "name": "string",
    "place_id": "string"
  }
}
```

## Utilities

### goongMapHelpers.ts

**Constants:**
- `PRIORITY_COLORS` - Color mapping for request priorities
- `PRIORITY_LABELS` - Label mapping for request priorities

**Functions:**
- `createRequestMarker(priority: Priority): HTMLDivElement` - Create request marker element
- `createWarehouseMarker(): HTMLDivElement` - Create warehouse marker element
- `calculateDistance(lat1, lon1, lat2, lon2): number` - Calculate distance in km
- `formatDistance(km: number): string` - Format distance for display
- `createRequestPopupHTML(request): string` - Create popup HTML for request
- `createWarehousePopupHTML(warehouse): string` - Create popup HTML for warehouse
- `getNearestWarehouses(warehouses, lat, lng, limit): Warehouse[]` - Get nearest warehouses

## Environment Variables

Required environment variable:
```
NEXT_PUBLIC_GOONGMAP_API_KEY=your_goong_api_key_here
```

## Usage Examples

### Mission Detail Page
```tsx
import GoongMissionMap from "@/modules/map/presentation/components/GoongMissionMap";

<GoongMissionMap
  requests={requestsWithLocation}
  warehouses={warehouses}
  onRequestClick={(request) => router.push(`/requests/${request._id}`)}
  height="600px"
/>
```

### Request Detail Page
```tsx
import GoongRequestMap from "@/modules/map/presentation/components/GoongRequestMap";

<GoongRequestMap
  request={request}
  warehouses={warehouses}
  onLocationUpdate={async (lat, lng, address) => {
    // Update request location
  }}
  allowLocationUpdate={true}
  height="500px"
/>
```

## Migration Notes

### Replaced Components
- `OpenMap.tsx` - Still available for other pages (citizen, team member pages)
- `LocationMap.tsx` - Still available for other pages

### Pages Migrated
1. **Mission Detail Page** - Now uses `GoongMissionMap` with dashboard view
2. **Request Detail Page** - Now uses `GoongRequestMap` with search and update
3. **Team Detail Page** - Map removed completely

### Breaking Changes
- Team Detail Page no longer shows location map
- Mission Detail Page now shows all requests and warehouses instead of coordinator location
- Request Detail Page now allows location updates via drag or search

## Performance Considerations

- Maps are lazy-loaded using `dynamic` import with `ssr: false`
- Search is debounced (300ms) to reduce API calls
- Markers are cleaned up on component unmount
- Bounds are auto-fitted with animation for better UX

## Error Handling

All components handle errors gracefully:
- Missing API key logs error to console
- Failed geocoding falls back to coordinates
- Failed searches show "No results" message
- Network errors are caught and logged
