export interface GPSTag {
    lat: number;
    lng: number;
    accuracy: number;
    capturedAt: Date;
    distanceFromStation?: number;
    isWithinRange?: boolean;
}

export const gpsService = {
    /**
     * Requests the device's current GPS location.
     * Times out after 10 seconds.
     */
    requestGPSLocation: (): Promise<GPSTag> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        capturedAt: new Date(),
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    },

    /**
     * Calculates the distance between the captured GPS location and the expected station coordinates.
     * Uses the Haversine formula.
     * 
     * @param captured The captured GPS tag
     * @param stationCoords The expected station coordinates { lat, lng }
     * @param maxDistanceMeters The maximum allowed distance in meters (default 30m)
     */
    validateGPSProximity: (
        captured: { lat: number; lng: number },
        stationCoords: { lat: number; lng: number },
        maxDistanceMeters: number = 30
    ): { isValid: boolean; distanceMeters: number } => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (captured.lat * Math.PI) / 180;
        const φ2 = (stationCoords.lat * Math.PI) / 180;
        const Δφ = ((stationCoords.lat - captured.lat) * Math.PI) / 180;
        const Δλ = ((stationCoords.lng - captured.lng) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distanceMeters = Math.round(R * c);
        const isValid = distanceMeters <= maxDistanceMeters;

        return { isValid, distanceMeters };
    },
};
