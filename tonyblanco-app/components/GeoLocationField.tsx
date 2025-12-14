'use client';

import { useState, useRef, useEffect } from 'react';
import { useGeoResolver } from '@/lib/useGeoResolver';

interface GeoLocationFieldProps {
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
  onCoordinatesChange: (lat: number | null, lng: number | null) => void;
  disabled?: boolean;
  errors?: {
    city?: string;
    country?: string;
  };
}

interface GeoResult {
  latitude: number;
  longitude: number;
  normalized_city: string;
  normalized_country: string;
  displayName?: string;
}

/**
 * GeoLocationField Component
 * 
 * Robust geo resolution with separate state management:
 * - cityInput: user-typed city (not bound to coordinates)
 * - countryInput: user-typed country (not bound to coordinates)
 * - geoResult: resolved geo data (separate from inputs)
 * 
 * Trigger lookup on blur, not while typing.
 * Validation only on save.
 */
export default function GeoLocationField({
  city,
  country,
  latitude,
  longitude,
  onCityChange,
  onCountryChange,
  onCoordinatesChange,
  disabled = false,
  errors = {},
}: GeoLocationFieldProps) {
  // Separate input state from geo result
  const [cityInput, setCityInput] = useState(city);
  const [countryInput, setCountryInput] = useState(country);
  const [geoResult, setGeoResult] = useState<GeoResult | null>(
    latitude && longitude && latitude !== 0 && longitude !== 0
      ? { latitude, longitude, normalized_city: city, normalized_country: country }
      : null
  );
  
  const [manualLatitude, setManualLatitude] = useState<string>('');
  const [manualLongitude, setManualLongitude] = useState<string>('');
  
  // Use the geo resolver hook
  const geoResolver = useGeoResolver();
  const isDev = process.env.NODE_ENV === 'development';

  // Sync external props to internal state only on mount or when props change from external source
  // Use ref to track if we're updating from internal changes to avoid loops
  const isInternalUpdateRef = useRef(false);
  
  useEffect(() => {
    // Skip sync if we just made an internal update
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    setCityInput(city);
    setCountryInput(country);
    
    // Only set geoResult if we have valid coordinates from props
    // Use functional update to read current geoResult without adding it to dependencies
    setGeoResult((currentGeoResult) => {
      if (latitude && longitude && latitude !== 0 && longitude !== 0) {
        // Only update if coordinates actually changed
        if (currentGeoResult?.latitude !== latitude || currentGeoResult?.longitude !== longitude) {
          return {
            latitude,
            longitude,
            normalized_city: city,
            normalized_country: country,
          };
        }
        return currentGeoResult; // No change
      } else {
        // Clear geoResult if coordinates become invalid
        return null;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, country, latitude, longitude]);

  /**
   * Resolve geo coordinates from city and country using Nominatim
   */
  const performGeoLookup = async () => {
    if (disabled || !cityInput.trim() || cityInput.trim().length < 2) {
      return;
    }

    const result = await geoResolver.resolve(cityInput, countryInput);

    if (result) {
      // Valid result found
      const geoData: GeoResult = {
        latitude: result.latitude,
        longitude: result.longitude,
        normalized_city: cityInput.trim(), // Keep user input as-is
        normalized_country: countryInput.trim() || '',
        displayName: result.displayName,
      };

      setGeoResult(geoData);
      
      // Update parent with coordinates
      isInternalUpdateRef.current = true;
      // Keep original city/country input, just update coordinates
      onCoordinatesChange(geoData.latitude, geoData.longitude);
    } else {
      // No valid result found - geoResolver already set error
      setGeoResult(null);
      onCoordinatesChange(null, null);
    }
  };

  const handleCityBlur = () => {
    if (cityInput.trim() && (countryInput.trim() || !geoResult)) {
      performGeoLookup();
    }
  };

  const handleCountryBlur = () => {
    if (cityInput.trim() && countryInput.trim()) {
      performGeoLookup();
    }
  };

  const handleCityChange = (newCity: string) => {
    setCityInput(newCity);
    onCityChange(newCity);
    // Clear geo result and error when user types
    geoResolver.clear();
    // Clear geo result if input changes
    if (newCity.trim().toLowerCase() !== city.trim().toLowerCase()) {
      setGeoResult(null);
      onCoordinatesChange(null, null);
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountryInput(newCountry);
    onCountryChange(newCountry);
    // Clear geo result and error when user types
    geoResolver.clear();
    // Clear geo result if country changes
    if (newCountry.trim().toLowerCase() !== country.trim().toLowerCase()) {
      setGeoResult(null);
      onCoordinatesChange(null, null);
    }
  };

  const handleManualRetry = () => {
    performGeoLookup();
  };

  // Handle manual override: update geoResult when both manual coordinates are valid
  // Use a ref to track if we're already processing to avoid loops
  const manualProcessingRef = useRef(false);
  
  useEffect(() => {
    if (isDev && manualLatitude && manualLongitude && !manualProcessingRef.current) {
      const lat = parseFloat(manualLatitude);
      const lng = parseFloat(manualLongitude);
      
      // Only update if both coordinates are valid
      if (!isNaN(lat) && lat !== 0 && lat >= -90 && lat <= 90 &&
          !isNaN(lng) && lng !== 0 && lng >= -180 && lng <= 180) {
        // Check if we already have this exact result to avoid infinite loops
        const currentLat = geoResult?.latitude;
        const currentLng = geoResult?.longitude;
        
        // Only update if the coordinates actually changed
        if (currentLat !== lat || currentLng !== lng) {
          const newGeoResult: GeoResult = {
            latitude: lat,
            longitude: lng,
            normalized_city: cityInput.trim(),
            normalized_country: countryInput.trim(),
          };
          setGeoResult(newGeoResult);
          isInternalUpdateRef.current = true;
          onCoordinatesChange(lat, lng);
          geoResolver.clear(); // Clear error state
        }
      }
    }
    // Only depend on manual inputs and dev mode
    // onCoordinatesChange is stable from parent, but we don't need it as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualLatitude, manualLongitude, isDev]);

  const handleManualLatitudeChange = (value: string) => {
    setManualLatitude(value);
  };

  const handleManualLongitudeChange = (value: string) => {
    setManualLongitude(value);
  };

  return (
    <div className="space-y-3">
      {/* City Input */}
      <div>
        <label htmlFor="birth_city" className="block text-sm font-medium text-gray-700 mb-2">
          Ciudad de nacimiento <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="birth_city"
            type="text"
            value={cityInput}
            onChange={(e) => handleCityChange(e.target.value)}
            onBlur={handleCityBlur}
            disabled={disabled}
            className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ciudad de nacimiento"
          />
          {geoResolver.loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
          {geoResult && geoResult.latitude !== 0 && geoResult.longitude !== 0 && !geoResolver.loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">✓</span>
          )}
        </div>
        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
        {geoResolver.loading && (
          <p className="mt-1 text-xs text-gray-500">Buscando ciudad...</p>
        )}
        {geoResolver.error && !geoResolver.loading && (
          <div className="mt-1">
            <p className="text-xs text-yellow-600">{geoResolver.error}</p>
            <button
              type="button"
              onClick={handleManualRetry}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Reintentar búsqueda
            </button>
          </div>
        )}
        {geoResult?.displayName && !geoResolver.error && !geoResolver.loading && (
          <p className="mt-1 text-xs text-blue-600">
            Ubicación encontrada: {geoResult.displayName}
          </p>
        )}
        {!geoResolver.loading && !geoResolver.error && !geoResult && (
          <p className="mt-1 text-xs text-gray-500">
            Ingresa la ciudad y país. Las coordenadas se calcularán al salir del campo.
          </p>
        )}
      </div>

      {/* Country Input */}
      <div>
        <label htmlFor="birth_country" className="block text-sm font-medium text-gray-700 mb-2">
          País de nacimiento <span className="text-red-500">*</span>
        </label>
        <input
          id="birth_country"
          type="text"
          value={countryInput}
          onChange={(e) => handleCountryChange(e.target.value)}
          onBlur={handleCountryBlur}
          disabled={disabled}
          className={`w-full px-4 py-2 bg-white border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
            errors.country ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="País de nacimiento"
        />
        {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
      </div>

      {/* Coordinates Display - Note: Editing is controlled by parent component via checkbox */}
      {/* This component always shows coordinates as read-only; parent handles unlock logic */}
      {geoResult && geoResult.latitude !== 0 && geoResult.longitude !== 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Latitud</label>
            <input
              type="number"
              step="0.0001"
              value={geoResult.latitude}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Longitud</label>
            <input
              type="number"
              step="0.0001"
              value={geoResult.longitude}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Manual Override (Dev Only) */}
      {isDev && !geoResult && geoResolver.error && (
        <div className="border border-yellow-300 bg-yellow-50 rounded-md p-3 space-y-2">
          <p className="text-xs font-medium text-yellow-800">Modo desarrollo: Override manual</p>
          <p className="text-xs text-yellow-700">
            Si la búsqueda falla, puedes ingresar coordenadas manualmente aquí.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Latitud (manual)</label>
              <input
                type="number"
                step="0.0001"
                value={manualLatitude}
                placeholder="Ej: 23.1136"
                onChange={(e) => handleManualLatitudeChange(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Longitud (manual)</label>
              <input
                type="number"
                step="0.0001"
                value={manualLongitude}
                placeholder="Ej: -82.3666"
                onChange={(e) => handleManualLongitudeChange(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
