import { useEffect, useRef } from "react";
import L from "leaflet";

// Fix Leaflet's default icon paths (required for Vite)
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function IssueMap({ issues = [], interactive = false, onLocationSelect, selectedLocation }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Wait for the DOM element to be ready
    if (!mapRef.current && document.getElementById("map")) {
      mapRef.current = L.map("map").setView([12.9716, 77.5946], 13);
      
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
        subdomains: "abcd",
        maxZoom: 19,
        minZoom: 3,
      }).addTo(mapRef.current);

      if (interactive) {
        mapRef.current.on("click", (e) => {
          if (onLocationSelect) onLocationSelect(e.latlng);
        });
      }
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each issue
    issues.forEach(issue => {
      if (issue.coordinates?.lat && issue.coordinates?.lng) {
        const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng])
          .addTo(mapRef.current)
          .bindPopup(`
            <b>${issue.title}</b><br/>
            ${issue.location}<br/>
            Status: ${issue.status}<br/>
            Priority: ${issue.priority}
          `);
        markersRef.current.push(marker);
      }
    });

    // Show selected location (for form)
    if (selectedLocation && interactive && mapRef.current) {
      // Remove any existing temporary marker (optional, could keep)
      const tempMarker = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(mapRef.current)
        .bindPopup("📍 Selected location")
        .openPopup();
      markersRef.current.push(tempMarker);
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 15);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [issues, interactive, selectedLocation, onLocationSelect]);

  return <div id="map" style={{ height: "400px", width: "100%", borderRadius: "0.5rem", zIndex: 1 }} />;
}

export default IssueMap;