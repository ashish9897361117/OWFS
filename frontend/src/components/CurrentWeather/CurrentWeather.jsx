import React from 'react';
import { Thermometer, Droplets, Wind, Eye, Clock, MapPin, Navigation } from 'lucide-react';

export const CurrentWeather = ({ data }) => {
  if (!data) return null;

  const { 
    location, temperature, humidity, wind_speed, weather_main, 
    weather_description, weather_icon, feels_like, visibility, 
    last_updated, isForecast, date 
  } = data;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const WeatherDetail = ({ icon: Icon, label, value, unit }) => (
    <div className="flex items-center gap-3 p-3 rounded bg-bg-secondary border border-border-basic">
      <div className="w-10 h-10 rounded bg-accent-blue/10 flex items-center justify-center text-accent-blue">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-text-muted font-semibold uppercase">{label}</p>
        <p className="text-sm font-bold text-text-primary">
          {value}<span className="text-xs ml-1 text-text-muted">{unit}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isForecast ? 'bg-accent-purple/10 text-accent-purple' : 'bg-accent-emerald/10 text-accent-emerald'
            }`}>
              {isForecast ? 'Forecast' : 'Live Now'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">
            {location?.name}
          </h2>
          <p className="text-sm text-text-muted mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {location?.country}
          </p>
        </div>
        <div className="text-xs text-text-muted font-medium">
          {isForecast 
            ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            : `Last updated: ${formatDate(last_updated)}`
          }
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-5xl font-bold text-text-primary">
            {Math.round(temperature)}<span className="text-2xl ml-2">°C</span>
          </p>
          <p className="text-sm font-semibold text-accent-blue mt-2">{weather_main}</p>
          <p className="text-xs text-text-muted capitalize mt-1">{weather_description}</p>
        </div>
        <img 
          src={`https://openweathermap.org/img/wn/${weather_icon}@4x.png`} 
          alt={weather_main}
          className="w-32 h-32"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <WeatherDetail icon={Thermometer} label="Feels Like" value={Math.round(feels_like)} unit="°C" />
        <WeatherDetail icon={Droplets} label="Humidity" value={humidity} unit="%" />
        <WeatherDetail icon={Wind} label="Wind" value={Math.round(wind_speed)} unit="km/h" />
        <WeatherDetail icon={Eye} label="Visibility" value={visibility} unit="km" />
      </div>
    </div>
  );
};
