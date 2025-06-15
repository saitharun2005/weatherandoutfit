import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const apiKey = "1ec1fcd8f022d917d406a6c3c7610c21"; // Replace with your working API key

  useEffect(() => {
    // Auto-fetch weather using GPS on load
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("GPS access denied or failed.", err);
      }
    );

    // Load search history & dark mode preference from localStorage
    const stored = JSON.parse(localStorage.getItem('history')) || [];
    setHistory(stored);
    const storedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDark);
  }, []);

  const getOutfitSuggestion = (temp) => {
    if (temp < 10) return "Wear a heavy jacket & gloves 🧥🧤";
    if (temp < 20) return "Light jacket or hoodie 🧥";
    if (temp < 30) return "T-shirt and jeans 👕👖";
    return "Shorts and sunglasses 🩳🕶️";
  };

  const getWeatherIconUrl = (iconCode) =>
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const updateHistory = (cityName) => {
    const updated = [cityName, ...history.filter(c => c !== cityName)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('history', JSON.stringify(updated));
  };

  const fetchWeather = async () => {
    if (!city) return;
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeather(res.data);
      updateHistory(city);
      setError('');
    } catch (err) {
      setError("City not found or API error!");
      setWeather(null);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setWeather(res.data);
      updateHistory(res.data.name);
      setError('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <div className="top-bar">
        <h1>🌦️ Weather & Outfit</h1>
        <button onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Get Weather</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="result-box">
          <h2>{weather.name}</h2>
          <img
            src={getWeatherIconUrl(weather.weather[0].icon)}
            alt="weather icon"
          />
          <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
          <p><strong>Feels Like:</strong> {weather.main.feels_like}°C</p>
          <p><strong>Condition:</strong> {weather.weather[0].description}</p>
          <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
          <p><strong>Wind Speed:</strong> {weather.wind.speed} m/s</p>
          <p className="outfit">{getOutfitSuggestion(weather.main.temp)}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-box">
          <h3>Recent Searches</h3>
          {history.map((h, i) => (
            <button key={i} onClick={() => {
              setCity(h);
              fetchWeather();
            }}>
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
