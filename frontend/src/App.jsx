import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar';
import { CurrentWeather } from './components/CurrentWeather/CurrentWeather';
import { ForecastCards } from './components/ForecastCards/ForecastCards';
import { TrendCharts } from './components/TrendCharts/TrendCharts';
import { SectorInsights } from './components/SectorInsights/SectorInsights';
import { HourlyForecast } from './components/HourlyForecast/HourlyForecast';
import { weatherApi } from './api/weatherApi';
import { useTheme } from './context/ThemeContext';
import { 
  CloudRain, Wind, MapPin, 
  Settings, HelpCircle, Cloud,
  Moon, Sun
} from 'lucide-react';

function App() {
  const [location, setLocation] = useState('New Delhi');
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Today/Current
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark, toggleTheme } = useTheme();

  const fetchData = async (loc) => {
    setLoading(true);
    setError(null);
    setSelectedDayIndex(0); // Reset to today on new search
    try {
      const current = await weatherApi.getCurrentWeather(loc);
      const forecast = await weatherApi.getForecast(loc);
      setCurrentData(current);
      setForecastData(forecast.forecast);
      setHourlyData(forecast.hourly);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data. Please check your location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(location);
  }, []);

  const handleLocationSelect = (newLoc) => {
    setLocation(newLoc);
    fetchData(newLoc);
  };

  return (
    <div className={`flex h-screen text-text-primary overflow-hidden font-sans ${isDark ? 'dark-theme' : ''}`}
         style={{
           backgroundColor: isDark ? 'var(--bg-primary-dark)' : 'var(--bg-primary)',
         }}>
      
      {/* Main Content Area - Full Width */}
      <main className="flex-grow flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 relative z-50"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: `1px solid var(--border-basic)`
                }}>
          <div className="flex items-center gap-6 w-full max-w-3xl">
            <div className="flex items-center gap-3 mr-2">
              <div className="w-10 h-10 rounded-lg bg-accent-blue flex items-center justify-center shadow-sm">
                <CloudRain className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-text-primary">
                OWFS
              </span>
            </div>
            <div className="w-full">
              <SearchBar onSelectLocation={handleLocationSelect} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded text-sm"
                 style={{
                   backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                 }}>
              <MapPin className="w-4 h-4" style={{ color: isDark ? '#9ca3af' : '#666666' }} />
              <span className="font-medium" style={{ color: isDark ? '#f8fafc' : '#1a1a1a' }}>
                {location}
              </span>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                color: isDark ? '#fbbf24' : '#666666'
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-grow overflow-y-auto p-8"
             style={{
               backgroundColor: 'var(--bg-primary)',
             }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-accent-blue rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-lg font-semibold text-text-primary">Loading Weather Data</p>
                <p className="text-sm text-text-muted mt-2">Fetching current conditions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Wind className="text-red-600 w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-text-primary">Error Loading Weather</h2>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
              <button 
                onClick={() => fetchData(location)}
                className="px-6 py-2 bg-accent-blue text-white rounded hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Retry
            </button>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto space-y-10">
            {/* Compute Display Data */}
            {(() => {
              const activeData = selectedDayIndex === 0 
                ? currentData 
                : {
                    ...forecastData[selectedDayIndex],
                    location: currentData?.location,
                    // Map forecast fields to CurrentWeather expected fields if they differ
                    temperature: forecastData[selectedDayIndex].temperature,
                    feels_like: forecastData[selectedDayIndex].feels_like || forecastData[selectedDayIndex].temperature,
                    weather_description: forecastData[selectedDayIndex].weather_description || forecastData[selectedDayIndex].weather_main,
                    isForecast: true
                  };

              return (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  {/* Left */}
                  <div className="xl:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <CurrentWeather data={activeData} />
                      <SectorInsights current={activeData} forecast={forecastData} />
                    </div>
                    
                    <HourlyForecast 
                      hourly={hourlyData} 
                      selectedDate={activeData?.date || activeData?.last_updated}
                      selectedDayIndex={selectedDayIndex}
                    />

                    <div className="w-full">
                      <TrendCharts forecast={forecastData} />
                    </div>
                  </div>

                  {/* Right */}
                  <div className="xl:col-span-4 h-full">
                    <ForecastCards 
                      forecast={forecastData} 
                      onSelectDay={setSelectedDayIndex}
                      selectedIndex={selectedDayIndex}
                    />
                  </div>
                </div>
              );
            })()}

              {/* Footer */}
              <footer className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 pb-6 text-sm text-text-muted">
                <div className="flex items-center gap-3">
                  <CloudRain className="w-4 h-4" />
                  <span>Weather Dashboard v1.0</span>
                </div>
                <div className="text-xs">
                  <span className="text-accent-emerald">● Online</span> - Last updated just now
                </div>
              </footer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
