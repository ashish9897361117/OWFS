import React from 'react';
import { Sprout, Truck, ShieldAlert, Info, CheckCircle2, AlertTriangle, AlertCircle, Cpu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SectorInsights = ({ current, forecast }) => {
  const { isDark } = useTheme();
  if (!current || !forecast) return null;

  const maxWind = Math.max(...forecast.map(d => d.wind_speed));
  const rainLikelihood = forecast.filter(d => d.weather_main.toLowerCase().includes('rain')).length / forecast.length;

  const sectors = [
    {
      id: 'agri',
      name: 'Agriculture',
      persona: 'Strategic Farming',
      icon: Sprout,
      color: 'text-accent-emerald',
      bgColor: 'bg-accent-emerald/10',
      borderColor: 'border-accent-emerald/20',
      insight: rainLikelihood > 0.3 
        ? "Hydration surplus detected. Adjust irrigation cycles to prevent saturation."
        : "Stable thermal conditions. Optimal window for nutrient deployment.",
      status: rainLikelihood > 0.3 ? 'warning' : 'safe'
    },
    {
      id: 'logistics',
      name: 'Logistics',
      persona: 'Supply Chain Ops',
      icon: Truck,
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/10',
      borderColor: 'border-accent-blue/20',
      insight: maxWind > 20 
        ? "Aerodynamic drag increase predicted. Secure high-profile cargo."
        : "Atmospheric stability confirmed. Route efficiency remains nominal.",
      status: maxWind > 20 ? 'warning' : 'safe'
    },
    {
      id: 'disaster',
      name: 'Public Safety',
      persona: 'Crisis Management',
      icon: ShieldAlert,
      color: 'text-accent-rose',
      bgColor: 'bg-accent-rose/10',
      borderColor: 'border-accent-rose/20',
      insight: current.temperature > 35 
        ? "Thermal anomaly detected. Activate regional cooling protocols."
        : "Zero critical hazards identified. All safety systems are standby.",
      status: current.temperature > 35 ? 'danger' : 'safe'
    }
  ];

  const StatusBadge = ({ status }) => {
    const statusMap = {
      safe: { bg: 'bg-green-100', text: 'text-green-700', label: 'Good' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Caution' },
      danger: { bg: 'bg-red-100', text: 'text-red-700', label: 'Alert' }
    };
    const s = statusMap[status] || statusMap.safe;
    return (
      <div className={`px-2 py-1 rounded text-xs font-semibold ${
        isDark 
          ? s.bg.replace('100', '900/40').replace('text-', 'text-opacity-90 text-') 
          : s.bg
      } ${s.text}`}>
        {s.label}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent-blue/10 flex items-center justify-center text-accent-blue">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Sector Analysis</h3>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {sectors.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="p-3 rounded border border-border-basic hover:bg-bg-secondary transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${s.bgColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {s.insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

