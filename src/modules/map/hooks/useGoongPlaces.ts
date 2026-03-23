import { useState, useCallback, useEffect, useRef } from "react";

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetail {
  result: {
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    name: string;
    place_id: string;
  };
}

export function useGoongPlaces() {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchPlaces = useCallback(
    async (
      input: string,
      options?: {
        location?: string; // "lat,lng"
        radius?: number;
      }
    ): Promise<PlacePrediction[]> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!input || input.trim().length < 2) {
        setPredictions([]);
        return [];
      }

      setLoading(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        let url = `/api/goong/places?input=${encodeURIComponent(input)}`;
        
        if (options?.location) {
          url += `&location=${options.location}`;
        }
        if (options?.radius) {
          url += `&radius=${options.radius}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Places search failed: ${response.statusText}`);
        }

        const data = await response.json();

        const results = data.predictions || [];
        setPredictions(results);
        return results;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, ignore
          return [];
        }

        const errorMessage =
          err instanceof Error ? err.message : "Failed to search places";
        setError(errorMessage);
        console.error("Places search error:", err);
        setPredictions([]);
        return [];
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const getPlaceDetail = useCallback(
    async (placeId: string): Promise<PlaceDetail | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/goong/place-detail?place_id=${encodeURIComponent(placeId)}`
        );

        if (!response.ok) {
          throw new Error(`Place detail fetch failed: ${response.statusText}`);
        }

        const data: PlaceDetail = await response.json();
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch place details";
        setError(errorMessage);
        console.error("Place detail error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    predictions,
    searchPlaces,
    getPlaceDetail,
    clearPredictions,
    loading,
    error,
  };
}
