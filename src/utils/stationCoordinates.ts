/**
 * GPS coordinates for each processing station used for proximity validation.
 * These are placeholder coordinates (Los Angeles area) for demo purposes.
 * Update with the actual factory coordinates after the March 8th site visit.
 * Used by `gpsService.validateGPSProximity` to verify that a field worker is at the correct station.
 */

export const STATIONS_GPS: Record<string, { lat: number; lng: number }> = {
    'INTAKE-01': { lat: 34.0522, lng: -118.2437 },
    'MIXING-01': { lat: 34.0523, lng: -118.2438 },
    'EXTRUSION-01': { lat: 34.0524, lng: -118.2439 },
    // Add additional stations as needed...
};
