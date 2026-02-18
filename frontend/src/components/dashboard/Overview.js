import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card } from '../ui/card';
import { Zap, TrendingUp, Database, Clock } from 'lucide-react';

const metrics = [
  {
    name: 'Producción Total de Energía',
    value: '4,832 kWh',
    change: '+12.5%',
    trend: 'up',
    icon: Zap,
    color: 'text-accent'
  },
  {
    name: 'Proyectos Activos',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Database,
    color: 'text-blue-600'
  },
  {
    name: 'Eficiencia del Sistema',
    value: '94.2%',
    change: '+2.1%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-primary'
  },
  {
    name: 'Tiempo Activo',
    value: '99.8%',
    change: 'Excelente',
    trend: 'neutral',
    icon: Clock,
    color: 'text-purple-600'
  },
];

export const Overview = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Resumen del Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitorea tu infraestructura de energía solar en tiempo real
          </p>
        </div>

        {/* Cuadrícula de Métricas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="metrics-grid">
          {metrics.map((metric) => (
            <Card key={metric.name} className="p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{metric.value}</p>
                  <div className="flex items-center gap-1 text-sm">
                    {metric.trend === 'up' && (
                      <span className="text-accent font-medium">{metric.change}</span>
                    )}
                    {metric.trend === 'neutral' && (
                      <span className="text-muted-foreground">{metric.change}</span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-muted/50 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-4">Estado del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <span className="text-sm font-medium">Panel Solar A</span>
                </div>
                <span className="text-sm text-muted-foreground">En Línea</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <span className="text-sm font-medium">Panel Solar B</span>
                </div>
                <span className="text-sm text-muted-foreground">En Línea</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <span className="text-sm font-medium">Almacenamiento de Batería</span>
                </div>
                <span className="text-sm text-muted-foreground">85% Capacidad</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <span className="text-sm font-medium">Conexión a Red</span>
                </div>
                <span className="text-sm text-muted-foreground">Activa</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Producción máxima alcanzada</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Nuevo proyecto agregado</p>
                  <p className="text-xs text-muted-foreground">Hace 5 horas</p>
                </div>
              </div>
              <div className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Eficiencia mejorada</p>
                  <p className="text-xs text-muted-foreground">Hace 1 día</p>
                </div>
              </div>
              <div className="flex gap-3 py-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Mantenimiento completado</p>
                  <p className="text-xs text-muted-foreground">Hace 2 días</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mensaje de Bienvenida */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
              Bienvenido al Panel Administrativo de EFFITECH
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Tu plataforma integral para gestionar y monitorear proyectos de energía solar. 
              Rastrea el rendimiento, analiza tendencias y optimiza tu infraestructura de energía renovable 
              con precisión y transparencia.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border">
                <div className="h-2 w-2 rounded-full bg-accent"></div>
                <span className="text-sm font-medium">Todos los Sistemas Operativos</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border">
                <span className="text-sm text-muted-foreground">Última actualización: Ahora mismo</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};