import { useState, useCallback } from "react";

export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
}

export interface ReverseGeocodeResult {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
}

export function useGoongGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/goong/geocode?address=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0];
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to geocode address";
      setError(errorMessage);
      console.error("Geocoding error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/goong/reverse-geocode?lat=${lat}&lng=${lng}`
        );

        if (!response.ok) {
          throw new Error(`Reverse geocoding failed: ${response.statusText}`);
        }

        const data: ReverseGeocodeResult = await response.json();

        if (data.results && data.results.length > 0) {
          return data.results[0].formatted_address;
        }

        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reverse geocode coordinates";
        setError(errorMessage);
        console.error("Reverse geocoding error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    geocode,
    reverseGeocode,
    loading,
    error,
  };
}
