"use client";

import { useState, useEffect, useRef } from "react";
import { useGoongPlaces } from "../../hooks/useGoongPlaces";

export interface SearchBoxProps {
  onPlaceSelect: (place: {
    lat: number;
    lng: number;
    address: string;
    placeId: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBox({
  onPlaceSelect,
  placeholder = "Tìm kiếm địa điểm...",
  className = "",
}: SearchBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { predictions, searchPlaces, getPlaceDetail, clearPredictions, loading } =
    useGoongPlaces();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (inputValue.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(inputValue);
        setShowDropdown(true);
      }, 300);
    } else {
      clearPredictions();
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue, searchPlaces, clearPredictions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPlace = async (placeId: string, description: string) => {
    setInputValue(description);
    setShowDropdown(false);

    const placeDetail = await getPlaceDetail(placeId);
    if (placeDetail?.result) {
      const { geometry, formatted_address } = placeDetail.result;
      onPlaceSelect({
        lat: geometry.location.lat,
        lng: geometry.location.lng,
        address: formatted_address,
        placeId,
      });
    }
  };

  const handleClear = () => {
    setInputValue("");
    clearPredictions();
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/50 transition-all"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a3a52] border border-white/20 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() =>
                handleSelectPlace(prediction.place_id, prediction.description)
              }
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">📍</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && predictions.length === 0 && !loading && inputValue.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a3a52] border border-white/20 rounded-lg shadow-2xl p-4 text-center text-gray-400 text-sm">
          Không tìm thấy kết quả
        </div>
      )}
    </div>
  );
}
