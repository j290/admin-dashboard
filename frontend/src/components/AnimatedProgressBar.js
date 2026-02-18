import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const AnimatedProgressBar = ({ 
  label, 
  value, 
  maxValue, 
  color = 'bg-primary',
  showTrend = true,
  unit = 'kWh',
  time
}) => {
  const [previousValue, setPreviousValue] = useState(value);
  const [trend, setTrend] = useState('stable'); // 'up', 'down', 'stable'
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Detectar cambio de valor
    if (value !== previousValue) {
      if (value > previousValue) {
        setTrend('up');
      } else if (value < previousValue) {
        setTrend('down');
      } else {
        setTrend('stable');
      }

      // Activar animación
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 500);

      setPreviousValue(value);
    }
  }, [value, previousValue]);

  const percentage = (value / maxValue) * 100;
  const change = value - previousValue;
  const changePercentage = previousValue ? ((change / previousValue) * 100).toFixed(1) : 0;

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {/* Header con label y tendencia */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {time || label}
          </span>
          {showTrend && trend !== 'stable' && (
            <div className={`flex items-center gap-1 ${getTrendColor()} ${showAnimation ? 'animate-pulse' : ''}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {changePercentage > 0 ? '+' : ''}{changePercentage}%
              </span>
            </div>
          )}
        </div>
        <span className={`text-sm font-bold transition-all duration-300 ${
          showAnimation ? 'scale-110 text-accent' : 'text-foreground'
        }`}>
          {value} {unit}
        </span>
      </div>

      {/* Barra de progreso animada */}
      <div className="relative w-full bg-muted rounded-full h-8 overflow-hidden">
        {/* Fondo con patrón cuando está cambiando */}
        {showAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        )}
        
        {/* Barra principal */}
        <div
          className={`${color} h-8 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3 relative overflow-hidden`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Efecto de brillo cuando cambia */}
          {showAnimation && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-right"></div>
          )}
          
          {/* Valor dentro de la barra */}
          {percentage > 15 && (
            <span className="text-xs font-medium text-white relative z-10">
              {value} {unit}
            </span>
          )}
        </div>

        {/* Indicador de cambio (pulso) */}
        {showAnimation && trend === 'up' && (
          <div 
            className="absolute top-0 right-0 h-8 w-1 bg-green-400 animate-ping"
            style={{ left: `${percentage}%` }}
          ></div>
        )}
        {showAnimation && trend === 'down' && (
          <div 
            className="absolute top-0 right-0 h-8 w-1 bg-red-400 animate-ping"
            style={{ left: `${percentage}%` }}
          ></div>
        )}
      </div>
    </div>
  );
};

// Componente para métrica con barra circular
export const CircularMetric = ({ 
  label, 
  value, 
  maxValue, 
  unit = 'kWh',
  size = 120,
  strokeWidth = 8
}) => {
  const [previousValue, setPreviousValue] = useState(value);
  const [trend, setTrend] = useState('stable');
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value !== previousValue) {
      setTrend(value > previousValue ? 'up' : 'down');
      
      // Animación de contador
      const steps = 20;
      const increment = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue(prev => {
          const newVal = prev + increment;
          if (currentStep >= steps) {
            clearInterval(interval);
            return value;
          }
          return newVal;
        });
      }, 30);

      setPreviousValue(value);
      
      return () => clearInterval(interval);
    }
  }, [value, previousValue, displayValue]);

  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getTrendColor = () => {
    if (trend === 'up') return '#10B981'; // green
    if (trend === 'down') return '#EF4444'; // red
    return '#6B7280'; // gray
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Círculo de fondo */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Círculo de progreso */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            stroke={getTrendColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Valor en el centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {Math.round(displayValue)}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>

        {/* Indicador de tendencia */}
        {trend !== 'stable' && (
          <div className={`absolute -top-1 -right-1 rounded-full p-1 ${
            trend === 'up' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  );
};