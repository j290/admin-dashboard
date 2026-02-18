import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card } from '../ui/card';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

const monthlyData = [
  { month: 'Ene', production: 4200, consumption: 3800, savings: 400 },
  { month: 'Feb', production: 4500, consumption: 4100, savings: 400 },
  { month: 'Mar', production: 5200, consumption: 4300, savings: 900 },
  { month: 'Abr', production: 5800, consumption: 4500, savings: 1300 },
  { month: 'May', production: 6200, consumption: 4700, savings: 1500 },
  { month: 'Jun', production: 6500, consumption: 4900, savings: 1600 },
];

const performanceMetrics = [
  { label: 'Producción Diaria Promedio', value: '218 kWh', change: '+12%', trend: 'up' },
  { label: 'Eficiencia Energética', value: '94.2%', change: '+2.1%', trend: 'up' },
  { label: 'Compensación de Carbono', value: '4.8 tons CO₂', change: '+15%', trend: 'up' },
  { label: 'Ahorro en Costos', value: '$2,340', change: '+18%', trend: 'up' },
];

export const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="analytics-page">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Análisis y Reportes
            </h1>
            <p className="text-muted-foreground mt-2">
              Información detallada y análisis de rendimiento
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Últimos 6 Meses
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
        </div>

        {/* Métricas de Rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric) => (
            <Card key={metric.label} className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-heading font-bold text-foreground">{metric.value}</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-accent font-medium">{metric.change}</span>
                  <span className="text-muted-foreground">vs período anterior</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Gráfico de Producción Mensual */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold">Producción vs Consumo Mensual</h2>
              <p className="text-sm text-muted-foreground mt-1">Tendencias energéticas de los últimos 6 meses</p>
            </div>
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          
          {/* Gráfico */}
          <div className="space-y-4">
            {monthlyData.map((data) => {
              const maxValue = 7000;
              const productionWidth = (data.production / maxValue) * 100;
              const consumptionWidth = (data.consumption / maxValue) * 100;
              
              return (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground w-12">{data.month}</span>
                    <div className="flex-1 mx-4 space-y-1">
                      <div className="relative">
                        <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                          <div 
                            className="bg-primary h-6 rounded-full absolute top-0 left-0"
                            style={{ width: `${productionWidth}%` }}
                          ></div>
                        </div>
                        <span className="absolute right-2 top-1 text-xs font-medium text-white">
                          {data.production} kWh
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                          <div 
                            className="bg-blue-500 h-6 rounded-full absolute top-0 left-0"
                            style={{ width: `${consumptionWidth}%` }}
                          ></div>
                        </div>
                        <span className="absolute right-2 top-1 text-xs font-medium text-white">
                          {data.consumption} kWh
                        </span>
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <span className="text-sm font-bold text-accent">+{data.savings} kWh</span>
                      <p className="text-xs text-muted-foreground">ahorrados</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Producción</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">Consumo</span>
            </div>
          </div>
        </Card>

        {/* Impacto Ambiental */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-primary/20">
            <h3 className="text-lg font-heading font-semibold mb-4">Impacto Ambiental</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm font-medium text-muted-foreground">Emisiones de CO₂ Evitadas</span>
                <span className="text-lg font-bold text-foreground">4.8 toneladas</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm font-medium text-muted-foreground">Equivalente a Árboles Plantados</span>
                <span className="text-lg font-bold text-foreground">220 árboles</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-muted-foreground">Energía Limpia Generada</span>
                <span className="text-lg font-bold text-foreground">32,100 kWh</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-4">Resumen Financiero</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm font-medium text-muted-foreground">Ahorro Total (6 meses)</span>
                <span className="text-lg font-bold text-accent">$2,340</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm font-medium text-muted-foreground">Ahorro Mensual Promedio</span>
                <span className="text-lg font-bold text-accent">$390</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-muted-foreground">Ahorro Anual Proyectado</span>
                <span className="text-lg font-bold text-accent">$4,680</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};