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
        <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 flex flex-col items-center justify-start py-10 px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center drop-shadow-lg">
                🌤️ Weather App
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
                    className="bg-white text-blue-600 px-6 py-3 border border-blue-500 rounded-full shadow hover:bg-blue-100 transition-colors duration-200 font-medium"
                >
                    {useMap ? "Use City Name" : "Select Location on Map"}
                </button>
            </div>

            {!useMap ? (
                <div className="flex flex-col sm:flex-row items-center w-full max-w-md mb-6 shadow-lg rounded-xl overflow-hidden bg-white">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city name"
                        className="flex-1 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border-b sm:border-b-0 sm:border-r border-gray-200"
                    />
                    <input
                        type="text"
                        value={lat !== null ? lat.toFixed(4) : ""}
                        onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Latitude"
                        className="w-full sm:w-24 px-3 py-3 text-gray-700 bg-gray-100 border-b sm:border-b-0 sm:border-r border-gray-200 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={lon !== null ? lon.toFixed(4) : ""}
                        onChange={(e) => setLon(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Longitude"
                        className="w-full sm:w-24 px-3 py-3 text-gray-700 bg-gray-100 focus:outline-none"
                    />
                    <button
                        className="w-full sm:w-auto bg-blue-500 text-white px-5 py-3 hover:bg-blue-600 transition duration-200 font-semibold"
                        onClick={fetchWeather}
                    >
                        Get Weather
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-md h-64 mb-6 rounded-xl overflow-hidden shadow-lg">
                    <MapContainer
                        center={[20, 70]}
                        zoom={4}
                        scrollWheelZoom
                        className="h-full w-full rounded-xl"
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker setLatLon={handleLatLonUpdate} />
                    </MapContainer>
                </div>
            )}

            {loading && <p className="text-lg text-gray-700 mt-4 animate-pulse">⏳ Loading...</p>}

            {error && <p className="text-red-600 mt-4 font-medium">{error}</p>}

            {weatherData && (
                <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 text-center transition-transform transform hover:scale-105 duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        {weatherData.location.name}, {weatherData.location.country}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        🕒 Local Time: {weatherData.location.localtime}
                    </p>

                    {/* Weather Icon */}
                    <div className="flex justify-center items-center mb-4">
                        <img
                            src={weatherData.current.condition.icon}
                            alt={weatherData.current.condition.text}
                            className="w-20 h-20"
                        />
                    </div>

                    <p className="text-2xl font-semibold text-gray-800 mb-2">
                        🌡️ {weatherData.current.temp_c}°C (Feels like {weatherData.current.feelslike_c}°C)
                    </p>
                    <p className="text-md text-gray-600 mb-4">{weatherData.current.condition.text}</p>

                    <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                        <div>
                            💧 Humidity: <span className="font-medium">{weatherData.current.humidity}%</span>
                        </div>
                        <div>
                            🌬️ Wind: <span className="font-medium">{weatherData.current.wind_kph} kph {weatherData.current.wind_dir}</span>
                        </div>
                        <div>
                            ☀️ UV Index: <span className="font-medium">{weatherData.current.uv}</span>
                        </div>
                        <div>
                            🌡️ Pressure: <span className="font-medium">{weatherData.current.pressure_mb} mb</span>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
};

export default Card;
