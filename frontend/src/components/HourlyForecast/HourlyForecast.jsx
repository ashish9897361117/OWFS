import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Clock } from 'lucide-react';

export const HourlyForecast = ({ hourly, selectedDate, selectedDayIndex }) => {
  if (!hourly || hourly.length === 0) return null;

  // selectedDayIndex from App: 0 = current/live data, 1+ = forecastData[idx]
  // forecastData[0] = tomorrow, forecastData[1] = day after, etc.
  // When selectedDayIndex === 0 (Live Now), show next 8 hourly slots = next 24h
  // When selectedDayIndex > 0 (a future forecast day), show hourly slots for that calendar date

  let displayData = [];

  if (selectedDayIndex === 0) {
    // Live view: show the first 8 slots = next 24 hours from the API
    displayData = hourly.slice(0, 8);
  } else {
    // Future day: selectedDate is the forecast date string e.g. "2026-05-03"
    const forecastDateStr = selectedDate
      ? String(selectedDate).split('T')[0].split(' ')[0]
      : null;

    if (forecastDateStr) {
      displayData = hourly.filter(item =>
        item.timestamp.startsWith(forecastDateStr)
      );
    }
    // If OWM doesn't have hourly data that far out (beyond 5 days), hide gracefully
    if (displayData.length === 0) return null;
  }

  const chartData = displayData.map(item => ({
    time: new Date(item.timestamp.replace(' ', 'T') + 'Z').toLocaleTimeString([], { 
      hour: '2-digit', minute: '2-digit', hour12: false 
    }),
    temp: Math.round(item.temperature),
    humidity: item.humidity,
    icon: item.weather_icon,
    wind: Math.round(item.wind_speed * 3.6), // m/s to km/h
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    const tempVal = payload.find(p => p.dataKey === 'temp');
    const humidVal = payload.find(p => p.dataKey === 'humidity');
    return (
      <div className="bg-bg-card border border-border-basic rounded-lg shadow-lg p-3 min-w-[130px]">
        <p className="text-xs font-bold text-text-primary mb-2 border-b border-border-basic pb-1">{label}</p>
        <div className="space-y-1.5">
          {tempVal && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Temp</span>
              <span className="text-sm font-bold text-accent-blue">{tempVal.value}°C</span>
            </div>
          )}
          {humidVal && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Humidity</span>
              <span className="text-sm font-bold text-accent-purple">{humidVal.value}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const label = selectedDayIndex === 0
    ? 'Next 24 Hours'
    : new Date((selectedDate + 'T00:00:00').replace('T00:00:00T00:00:00', 'T00:00:00')).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent-purple/10 flex items-center justify-center text-accent-purple">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Hourly Forecast</h3>
        </div>
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-bg-secondary px-2 py-1 rounded border border-border-basic">
          {label}
        </div>
      </div>

      {/* Hourly Strip - scrollable icons */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 min-w-[68px] px-2 py-2 rounded-lg hover:bg-bg-secondary transition-colors border border-transparent hover:border-border-basic group">
            <span className="text-[11px] font-semibold text-text-muted group-hover:text-text-primary whitespace-nowrap">{item.time}</span>
            <img 
              src={`https://openweathermap.org/img/wn/${item.icon}.png`} 
              alt="weather" 
              className="w-9 h-9"
            />
            <span className="text-sm font-bold text-text-primary">{item.temp}°</span>
            <span className="text-[10px] text-text-muted">{item.humidity}%</span>
          </div>
        ))}
      </div>

      {/* Temperature graph */}
      <div className="w-full" style={{ height: '180px' }}>
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="hourlyHumidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-basic)" opacity={0.4} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
            />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#hourlyTempGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#3b82f6', stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="humidity" 
              stroke="#8b5cf6" 
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fillOpacity={1} 
              fill="url(#hourlyHumidGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-accent-blue rounded"/>
          <span className="text-[11px] text-text-muted font-medium">Temperature (°C)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-accent-purple rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8b5cf6 0, #8b5cf6 4px, transparent 4px, transparent 6px)' }}/>
          <span className="text-[11px] text-text-muted font-medium">Humidity (%)</span>
        </div>
      </div>
    </div>
  );
};
