'use client'

import { useEffect, useRef, useState } from 'react'
import { MonasteryWithDistance } from '@/lib/supabase'

interface MonasteryMapProps {
  monasteries: MonasteryWithDistance[];
  userLocation?: { latitude: number; longitude: number; address?: string } | null;
  onMonasterySelect?: (monastery: MonasteryWithDistance) => void;
  height?: string;
  className?: string;
}

export function MonasteryMap({ 
  monasteries, 
  userLocation, 
  onMonasterySelect,
  height = '400px',
  className = ''
}: MonasteryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = await import('leaflet');
        
        // Fix for default markers not showing
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!isMounted) return;

        // Default center (India center)
        let center: [number, number] = [20.5937, 78.9629];

        // Adjust zoom based on screen size
        const isMobile = window.innerWidth < 768;
        let zoom = isMobile ? 3 : 5; // More zoomed out on mobile

        // If user location is available, center on it
        if (userLocation) {
          center = [userLocation.latitude, userLocation.longitude];
          zoom = isMobile ? 8 : 10; // Less zoom on mobile for better context
        } else if (monasteries.length > 0) {
          // Center on first monastery with location
          const firstMonastery = monasteries.find(m => m.latitude && m.longitude);
          if (firstMonastery && firstMonastery.latitude && firstMonastery.longitude) {
            center = [firstMonastery.latitude, firstMonastery.longitude];
            zoom = isMobile ? 6 : 8; // Less zoom on mobile
          }
        }

        // Ensure map container is valid before creating map
        if (!mapRef.current || !mapRef.current.offsetParent) {
          return;
        }

        // Clean up existing map
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('Error removing previous map instance:', e);
          }
        }

        // Create map with additional error handling
        let map;
        try {
          map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
            fadeAnimation: false,
            zoomAnimation: false,
            markerZoomAnimation: false
          }).setView(center, zoom);
        } catch (error) {
          console.error('Error creating map:', error);
          setLoadError('Failed to initialize map');
          return;
        }
        mapInstanceRef.current = map;

        // Wait for map to fully initialize before adding layers
        await new Promise(resolve => setTimeout(resolve, 100));

        // Add OpenStreetMap tiles (FREE)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Create custom icons
        const userIcon = L.divIcon({
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const monasteryIcon = L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background-color: #D4AF37;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
            ">
              M
            </div>
          `,
          className: 'custom-marker monastery-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        // Add user location marker
        if (userLocation) {
          L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <h3 class="font-semibold text-blue-600">📍 Your Location</h3>
                <p class="text-sm text-gray-600 mt-1">You are here</p>
              </div>
            `);
        }

        // Add monastery markers
        const bounds = L.latLngBounds([]);
        let hasValidLocations = false;

        monasteries.forEach((monastery) => {
          if (monastery.latitude && monastery.longitude) {
            hasValidLocations = true;
            const latLng = L.latLng(monastery.latitude, monastery.longitude);
            bounds.extend(latLng);

            const marker = L.marker([monastery.latitude, monastery.longitude], { icon: monasteryIcon })
              .addTo(map);

            // Create enhanced popup content with monastery portfolio
            const popupContent = `
              <div class="p-4 min-w-[280px] max-w-[320px]">
                <div class="flex items-start space-x-3">
                  ${monastery.image_url ? `
                    <img src="${monastery.image_url}" alt="${monastery.name}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ` : `
                    <div class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span class="text-2xl">🏛️</span>
                    </div>
                  `}
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-lg mb-1">${monastery.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${monastery.address || 'Address not provided'}</p>
                    ${monastery.distance ? `<p class="text-sm font-medium text-blue-600 mb-2">📍 ${monastery.distance.toFixed(1)} km away</p>` : ''}
                  </div>
                </div>
                
                ${monastery.description ? `
                  <div class="mt-3">
                    <p class="text-sm text-gray-700 line-clamp-3">${monastery.description}</p>
                  </div>
                ` : ''}
                
                <div class="mt-3 space-y-1">
                  ${monastery.capacity ? `<p class="text-sm text-gray-600"><strong>Capacity:</strong> ${monastery.capacity} monks</p>` : ''}
                  ${monastery.email ? `<p class="text-sm text-gray-600"><strong>Email:</strong> ${monastery.email}</p>` : ''}
                  ${monastery.phone ? `<p class="text-sm text-gray-600"><strong>Phone:</strong> ${monastery.phone}</p>` : ''}
                  ${monastery.tradition ? `<p class="text-sm text-gray-600"><strong>Tradition:</strong> ${monastery.tradition}</p>` : ''}
                  ${monastery.established_year ? `<p class="text-sm text-gray-600"><strong>Established:</strong> ${monastery.established_year}</p>` : ''}
                </div>
                
                <div class="mt-4 pt-3 border-t border-gray-200">
                  <button onclick="window.location.href='/en/monasteries/${monastery.id}'" class="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors cursor-pointer border-none">
                    View Full Portfolio →
                  </button>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent, {
              maxWidth: 350,
              className: 'monastery-popup'
            });

            // Show popup on hover
            marker.on('mouseover', function(e) {
              const target = e.target as L.Marker;
              target.openPopup();
            });

            // Keep popup open on click for mobile
            if (onMonasterySelect) {
              marker.on('click', () => onMonasterySelect(monastery));
            }
          }
        });

        // If user location exists, include it in bounds
        if (userLocation) {
          bounds.extend(L.latLng(userLocation.latitude, userLocation.longitude));
          hasValidLocations = true;
        }

        // Fit map to show all markers if we have valid locations
        if (hasValidLocations && bounds.isValid()) {
          // Use larger padding on mobile for better overview
          const padding = isMobile ? [50, 50] : [20, 20];
          const maxZoom = isMobile ? 12 : 15; // Limit max zoom on mobile
          map.fitBounds(bounds, {
            padding,
            maxZoom
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setLoadError('Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [monasteries, userLocation, onMonasterySelect]);

  if (loadError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">🗺️</div>
          <p className="text-sm text-gray-600">{loadError}</p>
          <p className="text-xs text-gray-500 mt-1">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg border overflow-hidden ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow-sm text-xs z-[1000]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full border-2 border-white flex items-center justify-center text-white text-[8px]">M</div>
            <span>Monasteries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
