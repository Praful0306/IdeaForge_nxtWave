"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ComplaintRecord } from "@/lib/db";

// Dynamic import Leaflet components only in browser
export default function CivicMap({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
}: {
  complaints: ComplaintRecord[];
  selectedComplaintId?: string;
  onSelectComplaint?: (c: ComplaintRecord) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L) return;

    // Default center Bengaluru
    const mapElement = document.getElementById("civic-leaflet-map") as any;
    if (!mapElement) return;

    if (mapElement._leaflet_id) {
      mapElement._leaflet_map?.remove();
    }

    const defaultLat = complaints[0]?.lat || 12.9716;
    const defaultLng = complaints[0]?.lng || 77.5946;

    const map = L.map("civic-leaflet-map").setView([defaultLat, defaultLng], 12);
    mapElement._leaflet_map = map;

    // OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Marker styling helper
    const getPinColor = (severity: number, status: string) => {
      if (status === "resolved") return "#16a34a"; // Green
      switch (severity) {
        case 5:
          return "#dc2626"; // Red
        case 4:
          return "#ea580c"; // Orange
        case 3:
          return "#f59e0b"; // Amber
        case 2:
          return "#0284c7"; // Sky
        default:
          return "#64748b"; // Slate
      }
    };

    // Add markers
    complaints.forEach((c) => {
      if (!c.lat || !c.lng) return;

      const color = getPinColor(c.severity, c.status);
      const isSelected = c.id === selectedComplaintId;

      const svgPin = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${isSelected ? 36 : 28}" height="${isSelected ? 36 : 28}">
          <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: svgPin,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 36 : 28],
      });

      const marker = L.marker([c.lat, c.lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #1e40af;">${c.ticket}</strong>
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 999px; background: ${color}20; color: ${color}; font-weight: bold;">
              ${c.status === "resolved" ? "Resolved" : `Sev ${c.severity}`}
            </span>
          </div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; color: #0f172a;">${c.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${c.address || "Bengaluru"}</div>
          <a href="/c/${c.ticket}" style="display: block; text-align: center; background: #2563eb; color: #ffffff; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
            View Live Ticket →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (isSelected) {
        marker.openPopup();
        map.setView([c.lat, c.lng], 14);
      }

      marker.on("click", () => {
        if (onSelectComplaint) onSelectComplaint(c);
      });
    });

    return () => {
      mapElement._leaflet_map?.remove();
    };
  }, [mounted, L, complaints, selectedComplaintId, onSelectComplaint]);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading Interactive Map...
      </div>
    );
  }

  return (
    <div
      id="civic-leaflet-map"
      className="w-full h-full min-h-[400px] rounded-2xl shadow-inner border border-slate-200"
    />
  );
}
