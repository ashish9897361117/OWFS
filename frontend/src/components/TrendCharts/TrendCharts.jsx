import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Activity, BarChart3, Binary } from 'lucide-react';

export const TrendCharts = ({ forecast }) => {
  const [activeMetric, setActiveMetric] = useState('temperature');

  if (!forecast || forecast.length === 0) return null;

  const data = forecast.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    temperature: day.temperature,
    humidity: day.humidity,
    wind_speed: day.wind_speed,
  }));

  const metrics = [
    { id: 'temperature', name: 'Thermal', icon: Activity, color: '#3b82f6', unit: '°C' },
    { id: 'humidity', name: 'Moisture', icon: BarChart3, color: '#8b5cf6', unit: '%' },
    { id: 'wind_speed', name: 'Velocity', icon: TrendingUp, color: '#10b981', unit: ' km/h' },
  ];

  const currentMetric = metrics.find(m => m.id === activeMetric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card border border-border-basic rounded shadow p-2 min-w-[140px]">
          <p className="text-xs font-semibold text-text-primary mb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-muted">{currentMetric.name}</span>
            <span className="text-sm font-bold" style={{ color: currentMetric.color }}>
              {payload[0].value}{currentMetric.unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-8 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-accent-blue/10 flex items-center justify-center text-accent-blue">
            <Binary className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">7-Day Trends</h3>
        </div>

        <div className="flex gap-2 bg-bg-secondary rounded p-1 border border-border-basic">
          {metrics.map(m => {
            const Icon = m.icon;
            const isActive = activeMetric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-accent-blue text-white' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-96 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-basic)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              unit={currentMetric.unit}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={currentMetric.color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorMetric)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};