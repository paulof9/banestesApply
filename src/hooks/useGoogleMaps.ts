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

    if (!apiKey || isLoaded || windowWithGoogle.google?.maps || googleMapsScriptLoaded) {
      if (windowWithGoogle.google?.maps) {
        setIsLoaded(true);
        setGoogleMaps(windowWithGoogle.google.maps ?? null);
      }
      return;
    }

    // Define a função de callback no escopo global antes de carregar o script
    windowWithGoogle.initGoogleMaps = () => {
      setIsLoaded(true);
      setGoogleMaps(windowWithGoogle.google?.maps ?? null);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setLoadError(new Error('Falha ao carregar a API do Google Maps'));
    };

    document.head.appendChild(script);
    googleMapsScriptLoaded = true;

    return () => {
      // Limpa a função global ao desmontar
      delete windowWithGoogle.initGoogleMaps;
    };
  }, [apiKey, libraries, isLoaded]);

  return { isLoaded, googleMaps, loadError };
};

export default useGoogleMaps;
