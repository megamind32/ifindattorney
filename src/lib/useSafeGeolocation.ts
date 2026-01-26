import { useState } from 'react';

export type LocationResult =
  | { status: 'success'; latitude: number; longitude: number }
  | { status: 'error'; message: string }
  | { status: 'manual' };

export function useSafeGeolocation() {
  const [loading, setLoading] = useState(false);

  async function getPermissionState(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state as 'granted' | 'denied' | 'prompt';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  function requestLocation(
    onResult: (result: LocationResult) => void
  ) {
    setLoading(true);
    getPermissionState().then((state) => {
      if (state === 'denied') {
        setLoading(false);
        onResult({ status: 'manual' });
        return;
      }
      if (!navigator.geolocation) {
        setLoading(false);
        onResult({ status: 'error', message: 'Geolocation is not supported by your browser.' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          onResult({
            status: 'success',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          setLoading(false);
          let message = 'Unable to get your location.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location access denied. Please enable location or enter manually.';
            onResult({ status: 'manual' });
            return;
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location unavailable. Please check your device settings.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out. Please try again.';
          }
          onResult({ status: 'error', message });
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    });
  }

  return { loading, requestLocation };
}
