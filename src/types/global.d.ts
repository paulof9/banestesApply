/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google?: typeof google.maps;
    googleMapsLoaded?: boolean;
  }
}