import React from 'react';
import { Calendar, Droplets, Wind, ChevronRight, Zap } from 'lucide-react';

export const ForecastCards = ({ forecast, onSelectDay, selectedIndex }) => {
  if (!forecast || forecast.length === 0) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">7-Day Forecast</h3>
        <span className="text-xs bg-bg-secondary px-2 py-1 rounded text-text-muted border border-border-basic">Next 7 Days</span>
      </div>
      
      <div className="flex-grow flex flex-col gap-2 overflow-y-auto">
        {forecast.map((day, idx) => {
          const dateInfo = formatDate(day.date);
          return (
            <div 
              key={idx} 
              onClick={() => onSelectDay(idx)}
              className={`flex items-center gap-3 p-3 rounded border transition-all cursor-pointer group ${
                selectedIndex === idx 
                  ? 'border-accent-blue bg-accent-blue/5 shadow-sm' 
                  : 'border-border-basic hover:bg-bg-secondary hover:border-text-muted/30'
              }`}
            >
              <div className="flex flex-col items-center justify-center min-w-max">
                <span className="text-sm font-semibold text-text-primary">
                   {idx === 0 ? 'Today' : dateInfo.day}
                </span>
                <span className="text-xs text-text-muted">{dateInfo.date}</span>
              </div>

              <img 
                src={`https://openweathermap.org/img/wn/${day.weather_icon}.png`} 
                alt={day.weather_main}
                className="w-10 h-10"
              />

              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-text-primary capitalize">{day.weather_main}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    {day.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    {Math.round(day.wind_speed)}k/h
                  </span>
                </div>
              </div>

              <div className="text-right min-w-max">
                <p className="text-lg font-bold text-text-primary">
                  {Math.round(day.temperature)}°
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
