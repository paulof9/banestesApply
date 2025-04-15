import { useState, useEffect } from 'react';

interface GoogleMapsWindow extends Window {
  initGoogleMaps?: () => void;
  google?: {
    maps?: typeof google.maps;
  };
}

let googleMapsScriptLoaded = false;

const useGoogleMaps = (apiKey: string, libraries: string[] = []) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [googleMaps, setGoogleMaps] = useState<typeof google.maps | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const windowWithGoogle = window as GoogleMapsWindow;

    const handleScriptError = () => {
      setLoadError(new Error('Falha ao carregar a API do Google Maps'));
    };

    const loadScript = () => {
      const script = document.createElement('script');
      const libs = libraries.join(',');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}`;
      script.async = true;
      script.defer = true;
      script.onerror = handleScriptError;

      document.head.appendChild(script);
      googleMapsScriptLoaded = true;
    };

    const initializeGoogleMaps = () => {
      setIsLoaded(true);
      setGoogleMaps(windowWithGoogle.google?.maps || null);
    };

    if (!apiKey || isLoaded || windowWithGoogle.google?.maps || googleMapsScriptLoaded) {
      if (windowWithGoogle.google?.maps) {
        initializeGoogleMaps();
      }
      return;
    }

    windowWithGoogle.initGoogleMaps = initializeGoogleMaps;
    loadScript();

    return () => {
      delete windowWithGoogle.initGoogleMaps;
      googleMapsScriptLoaded = false;
    };
  }, [apiKey, libraries, isLoaded]);

  return { isLoaded, googleMaps, loadError };
};

export default useGoogleMaps;
