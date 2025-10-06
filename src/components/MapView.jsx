import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function MapView({ isActive, onStop }) {
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  const [route, setRoute] = useState([]);
  const [speeds, setSpeeds] = useState([]);
  const [distance, setDistance] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState(null);

  useEffect(() => {
    // ====== INIT MAP ======
    if (!mapRef.current) {
      mapRef.current = L.map("mapid").setView([3.139, 101.6869], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      const legend = L.control({ position: "bottomright" });
      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "legend");
        div.innerHTML = `
          <div style="background:white; padding:6px 10px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2); font-size:13px; line-height:20px;">
            <div><span style="display:inline-block;width:14px;height:14px;background:green;margin-right:6px;border-radius:3px"></span> ≤10 km/h</div>
            <div><span style="display:inline-block;width:14px;height:14px;background:orange;margin-right:6px;border-radius:3px"></span> 20–40 km/h</div>
            <div><span style="display:inline-block;width:14px;height:14px;background:red;margin-right:6px;border-radius:3px"></span> >40 km/h</div>
          </div>`;
        return div;
      };
      legend.addTo(mapRef.current);
    }

    // ====== START TRACKING ======
    if (isActive) {
      let lastPoint = null;
      setRoute([]);
      setSpeeds([]);
      setDistance(0);
      setStartTimestamp(Date.now());

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed } = pos.coords;
          const kmh = speed ? speed * 3.6 : 0;
          const newPoint = [latitude, longitude];

          // global backup
          window.lastKnownPosition = {
            lat: latitude,
            lng: longitude,
            ts: Date.now(),
          };

          setRoute((prev) => [...prev, { lat: latitude, lng: longitude, speed: kmh }]);
          setSpeeds((prev) => [...prev, kmh]);

          // warna ikut kelajuan
          let color = "green";
          if (kmh > 40) color = "red";
          else if (kmh > 10) color = "orange";

          if (lastPoint) {
            L.polyline([lastPoint, newPoint], {
              color,
              weight: 5,
              opacity: 0.8,
            }).addTo(mapRef.current);

            const d = haversine(
              lastPoint[0],
              lastPoint[1],
              newPoint[0],
              newPoint[1]
            );
            setDistance((prev) => prev + d);
          }

          lastPoint = newPoint;
          mapRef.current.setView(newPoint, 18);
        },
        (err) => {
          console.warn("❌ GPS error (tracking):", err);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 }
      );
    } else {
      // ====== STOP TRACKING ======
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;

        const avg =
          speeds.length > 0
            ? (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)
            : 0;
        const max = speeds.length > 0 ? Math.max(...speeds).toFixed(1) : 0;
        const duration = startTimestamp
          ? formatDuration(Date.now() - startTimestamp)
          : "00:00:00";
        const dist = (distance / 1000).toFixed(2);

        // fallback GPS dari window.lastKnownPosition
        const last = window.lastKnownPosition || {
          lat: 6.3205,
          lng: 100.2901,
        };

        // fallback summary kalau GPS gagal
        const summary = {
          avg: avg || 0,
          max: max || 0,
          duration,
          distance: dist || "0.00",
          route: route.length ? route : [last],
          latitude: last.lat,
          longitude: last.lng,
        };

        console.log("📦 GPS Summary sent to onStop:", summary);
        onStop?.(summary);
      }
    }

    // cleanup
    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isActive]);

  return <div id="mapid" className="h-72 w-full rounded-lg shadow" />;
}
