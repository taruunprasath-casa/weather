import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const API_KEY = "9e97ce07a31e4cff8dd70149251709";

const LocationMarker = ({ setLatLon }: { setLatLon: (lat: number, lon: number) => void }) => {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLatLon(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const Card = () => {
    const [city, setCity] = useState("");
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [useMap, setUseMap] = useState(false);

    const fetchWeather = async () => {
        setLoading(true);
        setError("");
        try {
            let query = "";

            if (lat !== null && lon !== null) {
                query = `${lat},${lon}`;
            } else if (city.trim() !== "") {
                query = city;
            } else {
                throw new Error("Please enter a city name or select a location on the map.");
            }

            const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&aqi=no`;
            const response = await fetch(url);

            if (!response.ok) throw new Error("Failed to fetch weather data.");
            const data = await response.json();
            setWeatherData(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLatLonUpdate = (lat: number, lon: number) => {
        setLat(lat);
        setLon(lon);
        fetchWeather();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex flex-col items-center justify-center px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center drop-shadow-md">
                Weather App
            </h1>

            <div className="w-full max-w-md mb-6 flex justify-center">
                <button
                    onClick={() => {
                        setUseMap(!useMap);
                        setCity("");
                        setLat(null);
                        setLon(null);
                        setWeatherData(null);
                        setError("");
                    }}
                    className="bg-white text-blue-600 px-5 py-2.5 border border-blue-500 rounded-md hover:bg-blue-100 transition-colors duration-200"
                >
                    {useMap ? "Use City Name" : "Use Map to Select Location"}
                </button>
            </div>

            {!useMap ? (
                <div className="flex items-center w-full max-w-md mb-6 shadow-md rounded-md overflow-hidden bg-white">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city name"
                        className="flex-1 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={lat !== null ? lat.toFixed(4) : ""}
                        onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Latitude"
                        className="w-24 px-2 py-3 text-gray-500 bg-gray-100 border-l border-gray-300 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={lon !== null ? lon.toFixed(4) : ""}
                        onChange={(e) => setLon(e.target.value ? parseFloat (e.target.value) : null)}
                        placeholder="Longitude"
                        className="w-24 px-2 py-3 text-gray-500 bg-gray-100 border-l border-gray-300 focus:outline-none"
                    />
                    <button
                        className="mr-2 bg-blue-500 text-white px-5 py-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        onClick={fetchWeather}
                    >
                        Get Weather
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-md h-64 mb-6 rounded-md overflow-hidden shadow-md relative">
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        scrollWheelZoom
                        className="h-full w-full"
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker setLatLon={handleLatLonUpdate} />
                    </MapContainer>
                </div>
            )}

            {loading && <p className="text-lg text-gray-700 mt-4 animate-pulse">Loading...</p>}

            {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}

            {weatherData && (
                <div className="w-full max-w-xs bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 text-center transition-transform transform hover:scale-105 duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {weatherData.location.name}, {weatherData.location.country}
                    </h2>
                    <p className="text-xl text-gray-700">
                        Temperature: {weatherData.current.temp_c}°C
                    </p>
                    <p className="text-md text-gray-600">
                        Condition: {weatherData.current.condition.text}
                    </p>
                    <img
                        src={weatherData.current.condition.icon}
                        alt={weatherData.current.condition.text}
                        className="mx-auto mt-4 w-16 h-16"
                    />
                </div>
            )}
        </div>
    );
};

export default Card;
