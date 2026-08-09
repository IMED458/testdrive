import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteVersion, Coordinates, Checkpoint, RoadWarning } from '../../types';

interface RouteMapProps {
  route: RouteVersion;
  currentPosition?: Coordinates;
  showPolyline?: boolean;
  showInstructions?: boolean;
  warnings?: RoadWarning[];
  height?: string;
  interactive?: boolean;
  onMarkerClick?: (info: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  currentPosition,
  showPolyline = true,
  showInstructions = true,
  warnings = [],
  height = '360px',
  interactive = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map instance
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const start = route.startPoint;
    const map = L.map(mapRef.current, {
      center: [start.lat, start.lng],
      zoom: 15,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: false,
    });

    leafletMapRef.current = map;

    // Add clean, high-contrast OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Render Route Polyline
    if (showPolyline && route.polyline.length > 0) {
      const latLngs: [number, number][] = route.polyline.map((p) => [p.lat, p.lng]);
      const polyline = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    }

    // Start Marker (Green Pin)
    const startIcon = L.divIcon({
      className: 'custom-map-pin-start',
      html: `<div style="background-color:#10b981; color:white; font-weight:bold; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">S</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([route.startPoint.lat, route.startPoint.lng], { icon: startIcon })
      .bindPopup('<b>დასაწყისი</b><br/>საგამოცდო ზონის დასაწყისი')
      .addTo(map);

    // Finish Marker (Red Pin)
    const finishIcon = L.divIcon({
      className: 'custom-map-pin-finish',
      html: `<div style="background-color:#ef4444; color:white; font-weight:bold; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">F</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([route.finishPoint.lat, route.finishPoint.lng], { icon: finishIcon })
      .bindPopup('<b>დასასრული</b><br/>საგამოცდო ზონის დასასრული')
      .addTo(map);

    // Instructions & Checkpoint Markers
    if (showInstructions) {
      route.instructions.forEach((inst, idx) => {
        const instIcon = L.divIcon({
          className: 'custom-inst-pin',
          html: `<div style="background-color:#4f46e5; color:white; font-size:11px; font-weight:bold; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white;">${idx + 1}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([inst.location.lat, inst.location.lng], { icon: instIcon })
          .bindPopup(`<b>ინსტრუქცია #${idx + 1}</b><br/>${inst.instructionText}`)
          .addTo(map);
      });
    }

    // Road Warnings
    warnings.forEach((warn) => {
      const warnIcon = L.divIcon({
        className: 'custom-warn-pin',
        html: `<div style="background-color:#f59e0b; color:white; font-size:13px; font-weight:bold; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white;">⚠️</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([warn.coordinates.lat, warn.coordinates.lng], { icon: warnIcon })
        .bindPopup(`<b>საგზაო გაფრთხილება</b><br/>${warn.warningText}`)
        .addTo(map);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [route, showPolyline, showInstructions, warnings, interactive]);

  // Handle Driver Current Position update
  useEffect(() => {
    if (!leafletMapRef.current || !currentPosition) return;

    const map = leafletMapRef.current;
    const latLng: [number, number] = [currentPosition.lat, currentPosition.lng];

    if (!driverMarkerRef.current) {
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `<div style="background-color:#2563eb; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(37,99,235,0.8); animation: pulse 1.5s infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      driverMarkerRef.current = L.marker(latLng, { icon: driverIcon }).addTo(map);
    } else {
      driverMarkerRef.current.setLatLng(latLng);
    }

    map.panTo(latLng);
  }, [currentPosition]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 z-0"
    />
  );
};
