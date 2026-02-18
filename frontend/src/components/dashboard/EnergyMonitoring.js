import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card } from '../ui/card';
import { Zap, Battery, Sun, TrendingUp, TrendingDown } from 'lucide-react';

const energySources = [
  {
    name: 'Panel Solar A',
    current: 2450,
    capacity: 3000,
    percentage: 82,
    status: 'activo',
    trend: 'up',
    change: '+5.2%',
    icon: Sun,
    color: 'text-yellow-500'
  },
  {
    name: 'Panel Solar B',
    current: 2382,
    capacity: 3000,
    percentage: 79,
    status: 'activo',
    trend: 'up',
    change: '+3.8%',
    icon: Sun,
    color: 'text-yellow-500'
  },
  {
    name: 'Almacenamiento de Batería',
    current: 1700,
    capacity: 2000,
    percentage: 85,
    status: 'cargando',
    trend: 'up',
    change: '+12.5%',
    icon: Battery,
    color: 'text-blue-600'
  },
];

const realtimeData = [
  { time: '00:00', production: 120 },
  { time: '04:00', production: 80 },
  { time: '08:00', production: 450 },
  { time: '12:00', production: 680 },
  { time: '16:00', production: 520 },
  { time: '20:00', production: 290 },
  { time: '23:59', production: 150 },
];

export const EnergyMonitoring = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="energy-monitoring-page">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Monitoreo de Energía
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitoreo en tiempo real de tu infraestructura de energía solar
          </p>
        </div>

        {/* Resumen de Producción Actual */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Producción Actual</p>
              <p className="text-4xl font-heading font-bold text-foreground mb-1">6,532 kWh</p>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-accent font-medium">+8.3% desde ayer</span>
              </div>
            </div>
            <div className="p-4 rounded-full bg-primary/10">
              <Zap className="h-12 w-12 text-primary" />
            </div>
          </div>
        </Card>

        {/* Cuadrícula de Fuentes de Energía */}
        <div>
          <h2 className="text-xl font-heading font-semibold mb-4">Fuentes de Energía</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {energySources.map((source) => (
              <Card key={source.name} className="p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-muted/50 ${source.color}`}>
                    <source.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    {source.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-accent" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      source.trend === 'up' ? 'text-accent' : 'text-red-500'
                    }`}>
                      {source.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-3">{source.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="font-medium text-foreground">{source.current} kWh</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacidad</span>
                    <span className="font-medium text-foreground">{source.capacity} kWh</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      source.status === 'activo' ? 'bg-accent' : 'bg-blue-500'
                    } animate-pulse`}></div>
                    <span className="text-xs font-medium capitalize text-muted-foreground">
                      {source.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Gráfico en Tiempo Real */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-6">Línea de Tiempo de Producción (Hoy)</h2>
          <div className="space-y-4">
            {realtimeData.map((data, index) => (
              <div key={data.time} className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground w-16">{data.time}</span>
                <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${(data.production / 700) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">{data.production} kWh</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas del Sistema */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Alertas del Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Producción Máxima Alcanzada</p>
                <p className="text-xs text-muted-foreground mt-1">El Panel Solar A alcanzó capacidad máxima a las 12:34 PM</p>
              </div>
              <span className="text-xs text-muted-foreground">Hace 2h</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Almacenamiento de Batería Optimizado</p>
                <p className="text-xs text-muted-foreground mt-1">Eficiencia de carga de batería aumentó 15%</p>
              </div>
              <span className="text-xs text-muted-foreground">Hace 5h</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};