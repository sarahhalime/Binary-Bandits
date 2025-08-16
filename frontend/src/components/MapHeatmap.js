import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapHeatmap = ({ moodData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatmapLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Toronto
    const map = L.map(mapRef.current).setView([43.6532, -79.3832], 11);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles with a softer style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.7
    }).addTo(map);

    // Add custom styling for the map container
    map.getContainer().style.filter = 'sepia(10%) saturate(80%) brightness(110%)';

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !moodData?.mood_points) return;

    // Remove existing heatmap layer
    if (heatmapLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
    }

    // Convert mood data to heatmap format with mood-based intensity
    const heatmapData = moodData.mood_points.map(point => {
      // Adjust intensity based on mood type
      let intensityMultiplier = 1;
      switch (point.mood) {
        case 'stressed':
        case 'anxious':
          intensityMultiplier = 1.5; // Higher intensity for negative moods
          break;
        case 'happy':
        case 'energetic':
          intensityMultiplier = 1.2; // Medium-high for positive moods
          break;
        case 'sad':
          intensityMultiplier = 1.3;
          break;
        case 'calm':
        case 'neutral':
          intensityMultiplier = 0.8; // Lower intensity for neutral moods
          break;
        default:
          intensityMultiplier = 1;
      }

      return [
        point.lat,
        point.lng,
        point.intensity * intensityMultiplier * point.count * 0.3 // Scale for visibility
      ];
    });

    // Create heatmap layer with custom gradient
    const heatmapLayer = L.heatLayer(heatmapData, {
      radius: 40,
      blur: 25,
      maxZoom: 15,
      gradient: {
        0.0: '#313695',  // Deep blue (calm)
        0.2: '#4575b4',  // Blue
        0.4: '#74add1',  // Light blue
        0.6: '#feb24c',  // Orange (moderate stress)
        0.8: '#fd8d3c',  // Dark orange
        1.0: '#e31a1c'   // Red (high stress)
      }
    }).addTo(mapInstanceRef.current);

    heatmapLayerRef.current = heatmapLayer;

    // Add mood markers for specific points
    moodData.mood_points.forEach(point => {
      const moodColors = {
        'happy': '#10B981',
        'calm': '#6EE7B7',
        'neutral': '#9CA3AF',
        'anxious': '#F59E0B',
        'stressed': '#EF4444',
        'sad': '#8B5CF6',
        'energetic': '#06B6D4'
      };

      const moodEmojis = {
        'happy': '😊',
        'calm': '😌',
        'neutral': '😐',
        'anxious': '😰',
        'stressed': '😤',
        'sad': '😢',
        'energetic': '⚡'
      };

      // Create custom icon for each mood
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: ${moodColors[point.mood] || '#9CA3AF'};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            font-size: 16px;
          ">
            ${moodEmojis[point.mood] || '🤔'}
          </div>
        `,
        className: 'mood-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Add marker with popup
      L.marker([point.lat, point.lng], { icon: customIcon })
        .bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <div style="font-size: 24px; margin-bottom: 8px;">
              ${moodEmojis[point.mood] || '🤔'}
            </div>
            <div style="font-weight: bold; text-transform: capitalize; margin-bottom: 4px;">
              ${point.mood}
            </div>
            <div style="color: #666; font-size: 14px;">
              ${point.count} users here
            </div>
            <div style="color: #888; font-size: 12px; margin-top: 4px;">
              ${Math.round(point.intensity * 100)}% intensity
            </div>
          </div>
        `)
        .addTo(mapInstanceRef.current);
    });

  }, [moodData]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ 
          height: '500px', 
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }} 
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Mood Intensity</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
            <span>Calm / Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
            <span>High Stress</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
          Click markers for details
        </div>
      </div>

      {/* Map Controls Info */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600">
          🗺️ Toronto Area • Live Mood Data
        </div>
      </div>
    </div>
  );
};

export default MapHeatmap; 