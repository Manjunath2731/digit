import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getUserDeviceIds, type UserDevice } from '../services/deviceManagement';
import '../styles/DeviceMap.css';

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

const DeviceMap: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    
    // Load Leaflet CSS and JS
    loadLeaflet();
    loadUserDevices();
  }, []);

  const loadLeaflet = () => {
    // Check if Leaflet is already loaded
    if (window.L) {
      initMap();
      return;
    }

    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        setTimeout(() => initMap(), 100);
      };
      document.head.appendChild(script);
    }
  };

  const loadUserDevices = async () => {
    try {
      setIsLoading(true);
      const devices = await getUserDeviceIds();
      setUserDevices(devices);
      setIsLoading(false);
      
      // Update map markers if map is already initialized
      if (mapRef.current && window.L) {
        updateMapMarkers(devices);
      }
    } catch (error) {
      console.error('Error loading user devices:', error);
      setUserDevices([]);
      setIsLoading(false);
    }
  };

  const initMap = () => {
    if (!window.L || !mapContainerRef.current || mapRef.current) {
      return;
    }

    try {
      // Fix Leaflet's default icon path issues
      const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
      const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
      const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
      
      delete window.L.Icon.Default.prototype._getIconUrl;
      
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Initialize the map
      mapRef.current = window.L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // Default to Bangalore
        zoom: 13,
        attributionControl: true,
        zoomControl: true,
        preferCanvas: true,
        wheelPxPerZoomLevel: 60
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        detectRetina: true,
        crossOrigin: true
      }).addTo(mapRef.current);

      // Force a resize after initialization
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      }, 300);

      // Add device markers if devices are already loaded
      if (userDevices.length > 0) {
        updateMapMarkers(userDevices);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMapMarkers = (devices: UserDevice[]) => {
    if (!mapRef.current || !window.L) {
      console.log('Map or Leaflet not ready');
      return;
    }

    console.log('Updating map markers for devices:', devices);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Sample coordinates for Bangalore area if devices don't have coordinates
    const sampleCoordinates = [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 13.0358, lng: 77.5970 },
      { lat: 12.9279, lng: 77.6271 },
      { lat: 12.9698, lng: 77.7499 },
      { lat: 13.0189, lng: 77.5820 }
    ];
    
    // Add markers for all devices
    devices.forEach((device, index) => {
      // Try to get coordinates from device, or use sample coordinates
      let lat, lng;
      const deviceAny = device as any;
      
      if (device.lat && device.lng) {
        lat = parseFloat(device.lat as any);
        lng = parseFloat(device.lng as any);
      } else if (deviceAny.latitude && deviceAny.longitude) {
        lat = parseFloat(deviceAny.latitude);
        lng = parseFloat(deviceAny.longitude);
      } else {
        // Use sample coordinates with slight offset for each device
        const sampleIndex = index % sampleCoordinates.length;
        lat = sampleCoordinates[sampleIndex].lat + (Math.random() - 0.5) * 0.05;
        lng = sampleCoordinates[sampleIndex].lng + (Math.random() - 0.5) * 0.05;
      }
      
      const deviceName = device.device_name || device.device_id || `Device ${index + 1}`;
      
      console.log(`Adding marker for ${deviceName} at [${lat}, ${lng}]`);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        try {
          // Create custom blue marker icon
          const blueIcon = window.L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          // Create marker with blue icon
          const marker = window.L.marker([lat, lng], { icon: blueIcon });
          marker.addTo(mapRef.current);
          
          // Add device name as a permanent label
          const label = window.L.divIcon({
            className: 'device-label',
            html: `<div>${deviceName}</div>`,
            iconSize: [120, 25],
            iconAnchor: [60, -15]
          });
          
          const labelMarker = window.L.marker([lat, lng], {
            icon: label,
            zIndexOffset: 1000
          });
          
          labelMarker.addTo(mapRef.current);
          
          // Bind popup with device information
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">${deviceName}</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Device ID:</strong> ${device.device_id || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Constituency:</strong> ${device.constituency || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Ward:</strong> ${device.ward || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Longitude:</strong> ${lng.toFixed(6)}</p>
            </div>
          `);
          
          // Add both markers to our tracking array
          markersRef.current.push(marker);
          markersRef.current.push(labelMarker);
        } catch (error) {
          console.error('Error adding device marker:', error);
        }
      }
    });
    
    console.log(`Added ${markersRef.current.length / 2} device markers`);
    
    // Fit map to show all markers if we have any
    if (markersRef.current.length > 0 && window.L.FeatureGroup) {
      try {
        const group = new window.L.FeatureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="dashboard-container device-map-container">
      <header className="auth-header">
        <div className="logo-container">
          <img src="https://nimblevision.io/public/assets/images/nv-logo.png" alt="DIGIT" className="header-logo" />
          <span className="logo-text">Nimble Vision</span>
        </div>
        <div className="language-selector">
          <select className="language-dropdown">
            <option value="ENGLISH">ENGLISH</option>
            <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
          </select>
        </div>
      </header>

      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="dashboard-content">
          <main className="main-content device-map-main">
            {/* <div className="page-header">
              <h1><span className="header-icon">🗺️</span> Device Map</h1>
            </div> */}

            {/* Map Card */}
            <div className="map-card">
              <div className="card-header">
                <div className="card-title-section">
                  <div className="card-icon">📍</div>
                  <h2>Device Locations</h2>
                </div>
              </div>

              <div className="map-wrapper">
                <div 
                  ref={mapContainerRef} 
                  className="map-container" 
                  id="map"
                ></div>
                {isLoading && (
                  <div className="map-loading">
                    <span className="spinner">⟳</span> Loading devices...
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default DeviceMap;
