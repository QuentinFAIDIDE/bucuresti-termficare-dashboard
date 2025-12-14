"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Station, LocationResult } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/status-colors";
import { isValidStatus } from "@/lib/types";
import { MAP_CONFIG } from "@/lib/config";

interface MapProps {
  className?: string;
  stations?: Station[];
  onStationClick?: (stationId: string) => void;
  selectedStationId?: string | null;
  locationMarker?: LocationResult | null;
}

export function Map({ className = "", stations = [], onStationClick, selectedStationId, locationMarker }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const selectedMarkerRef = useRef<string | null>(null);
  const originalColorsRef = useRef<Record<string, string>>({});
  const locationMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    L.tileLayer(MAP_CONFIG.tileUrl, {
      attribution: MAP_CONFIG.attribution,
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !stations.length) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};
    originalColorsRef.current = {};

    // Add station markers
    stations.forEach((station) => {
      const status = isValidStatus(station.status) ? station.status : 'broken';
      const color = STATUS_COLORS[status];
      originalColorsRef.current[station.id] = color;

      const marker = L.circleMarker([station.latitude, station.longitude], {
        color,
        fillColor: color,
        fillOpacity: 0.8,
        radius: 3,
      })
        .bindTooltip(station.name)
        .on('click', () => {
          const oldMarkerId = selectedMarkerRef.current;
          
          // Reset previous selection
          if (oldMarkerId && markersRef.current[oldMarkerId]) {
            const oldColor = originalColorsRef.current[oldMarkerId];
            markersRef.current[oldMarkerId].setStyle({
              color: oldColor,
              fillColor: oldColor,
              fillOpacity: 0.8,
              radius: 3,
            });
          }

          // Highlight current selection
          marker.setStyle({
            color: '#02b2d1',
            fillColor: '#02b2d1',
            fillOpacity: 1,
            radius: 10,
          });

          selectedMarkerRef.current = station.id;
          mapInstanceRef.current!.setView([station.latitude, station.longitude], 15);
          onStationClick?.(station.id);
        })
        .addTo(mapInstanceRef.current!);

      markersRef.current[station.id] = marker;
    });
  }, [stations]);

  useEffect(() => {
    if (!selectedStationId && selectedMarkerRef.current) {
      const oldMarkerId = selectedMarkerRef.current;
      if (markersRef.current[oldMarkerId]) {
        const oldColor = originalColorsRef.current[oldMarkerId];
        markersRef.current[oldMarkerId].setStyle({
          color: oldColor,
          fillColor: oldColor,
          fillOpacity: 0.8,
          radius: 3,
        });
        selectedMarkerRef.current = null;
      }
    }
  }, [selectedStationId]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing location marker
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
      locationMarkerRef.current = null;
    }

    // Add new location marker if provided
    if (locationMarker) {
      const marker = L.marker([locationMarker.latitude, locationMarker.longitude], {
        icon: L.divIcon({
          className: 'location-marker',
          html: '<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      })
        .bindTooltip(locationMarker.name)
        .addTo(mapInstanceRef.current);
      
      locationMarkerRef.current = marker;
      mapInstanceRef.current.setView([locationMarker.latitude, locationMarker.longitude], 16);
    }
  }, [locationMarker]);

  return <div ref={mapRef} className={`w-full h-full relative z-10 ${className}`} />;
}
