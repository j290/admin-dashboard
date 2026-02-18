# GUÍA: Conexión de Datos Reales de Paneles Solares

## 📡 ARQUITECTURA PARA DATOS EN TIEMPO REAL

### OPCIÓN 1: API REST (Más Simple)
Si tienes sensores IoT o un sistema de monitoreo existente:

```
Paneles Solares → Inversor → Sistema IoT → API REST → Tu Backend FastAPI → Frontend React
```

### OPCIÓN 2: WebSockets (Tiempo Real)
Para actualizaciones automáticas sin refrescar:

```
Paneles Solares → Inversor → Sistema IoT → WebSocket Server → Frontend React
```

---

## 🔌 IMPLEMENTACIÓN PASO A PASO

### 1. BACKEND: Crear Endpoints para Datos de Paneles

Agrega estos endpoints en `/app/backend/server.py`:

```python
from datetime import datetime, timezone
from typing import List

# Modelo para datos de paneles
class SolarPanelData(BaseModel):
    panel_id: str
    name: str
    current_production: float  # kWh
    capacity: float  # kWh
    status: str  # "activo", "mantenimiento", "desconectado"
    temperature: float  # Celsius
    efficiency: float  # Porcentaje
    last_update: datetime

class SystemMetrics(BaseModel):
    total_production: float
    active_panels: int
    system_efficiency: float
    uptime_percentage: float
    peak_production_time: str

# Endpoints
@api_router.get("/panels", response_model=List[SolarPanelData])
async def get_all_panels():
    # AQUÍ conectarías con tu sistema IoT o base de datos
    # Por ahora, datos de ejemplo:
    panels = await db.solar_panels.find({}, {"_id": 0}).to_list(100)
    return panels

@api_router.get("/panels/{panel_id}", response_model=SolarPanelData)
async def get_panel_by_id(panel_id: str):
    panel = await db.solar_panels.find_one({"panel_id": panel_id}, {"_id": 0})
    if not panel:
        raise HTTPException(status_code=404, detail="Panel no encontrado")
    return panel

@api_router.get("/metrics", response_model=SystemMetrics)
async def get_system_metrics():
    # Calcular métricas del sistema
    panels = await db.solar_panels.find({}).to_list(100)
    
    total_production = sum(p.get("current_production", 0) for p in panels)
    active_panels = len([p for p in panels if p.get("status") == "activo"])
    
    return {
        "total_production": total_production,
        "active_panels": active_panels,
        "system_efficiency": 94.2,
        "uptime_percentage": 99.8,
        "peak_production_time": "12:34 PM"
    }

@api_router.post("/panels/update")
async def update_panel_data(panel_data: SolarPanelData):
    # Endpoint para recibir datos de tus sensores IoT
    await db.solar_panels.update_one(
        {"panel_id": panel_data.panel_id},
        {"$set": panel_data.model_dump()},
        upsert=True
    )
    return {"status": "success"}
```

### 2. FRONTEND: Hook Personalizado para Datos en Tiempo Real

Crea `/app/frontend/src/hooks/useSolarData.js`:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useSolarData = (refreshInterval = 5000) => {
  const [panels, setPanels] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [panelsRes, metricsRes] = await Promise.all([
        axios.get(`${API}/panels`),
        axios.get(`${API}/metrics`)
      ]);
      
      setPanels(panelsRes.data);
      setMetrics(metricsRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Actualizar automáticamente cada X segundos
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { panels, metrics, loading, error, refetch: fetchData };
};
```

### 3. ACTUALIZAR COMPONENTE EnergyMonitoring

Modifica `/app/frontend/src/components/dashboard/EnergyMonitoring.js`:

```javascript
import { useSolarData } from '../../hooks/useSolarData';

export const EnergyMonitoring = () => {
  // Obtener datos reales cada 5 segundos
  const { panels, metrics, loading, error } = useSolarData(5000);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos de paneles...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600">
          Error al cargar datos: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Usar datos reales de 'panels' y 'metrics' */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Monitoreo de Energía
          </h1>
          <p className="text-sm text-muted-foreground">
            Actualizado: {new Date().toLocaleTimeString('es-ES')}
          </p>
        </div>

        {/* Mostrar métricas reales */}
        <Card className="p-6">
          <p className="text-4xl font-bold">{metrics.total_production} kWh</p>
          <p className="text-sm text-muted-foreground">Producción Total</p>
        </Card>

        {/* Mapear paneles reales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {panels.map((panel) => (
            <Card key={panel.panel_id} className="p-6">
              <h3 className="font-semibold">{panel.name}</h3>
              <p>{panel.current_production} kWh</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-2 w-2 rounded-full ${
                  panel.status === 'activo' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}></div>
                <span className="text-xs capitalize">{panel.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
```

---

## 🔄 CONECTAR CON SISTEMAS IoT REALES

### A) Si tienes API de Inversor Solar (ej: SolarEdge, Enphase):

```javascript
// En tu backend
import requests

@api_router.get("/sync-solar-data")
async def sync_with_solar_api():
    # Ejemplo con SolarEdge API
    api_key = os.environ.get("SOLAREDGE_API_KEY")
    site_id = os.environ.get("SOLAREDGE_SITE_ID")
    
    url = f"https://monitoringapi.solaredge.com/site/{site_id}/currentPowerFlow"
    response = requests.get(url, params={"api_key": api_key})
    
    data = response.json()
    
    # Guardar en tu base de datos
    await db.solar_panels.update_one(
        {"panel_id": "panel_a"},
        {"$set": {
            "current_production": data["siteCurrentPowerFlow"]["PV"]["currentPower"],
            "last_update": datetime.now(timezone.utc)
        }}
    )
    
    return {"status": "synced"}
```

### B) Si tienes sensores MQTT:

```python
import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    # Recibir datos de sensores
    data = json.loads(msg.payload)
    
    # Actualizar base de datos
    asyncio.run(db.solar_panels.update_one(
        {"panel_id": data["panel_id"]},
        {"$set": data}
    ))

mqtt_client = mqtt.Client()
mqtt_client.on_message = on_message
mqtt_client.connect("mqtt.tuservidor.com", 1883)
mqtt_client.subscribe("paneles/+/datos")
mqtt_client.loop_start()
```

### C) Datos Simulados (Para Testing):

```python
import random

@api_router.get("/panels/simulate")
async def simulate_panel_data():
    # Genera datos aleatorios para pruebas
    panels = []
    for i in range(3):
        panels.append({
            "panel_id": f"panel_{chr(65+i).lower()}",
            "name": f"Panel Solar {chr(65+i)}",
            "current_production": round(random.uniform(2000, 2500), 2),
            "capacity": 3000,
            "status": random.choice(["activo", "activo", "mantenimiento"]),
            "temperature": round(random.uniform(25, 45), 1),
            "efficiency": round(random.uniform(85, 95), 1),
            "last_update": datetime.now(timezone.utc).isoformat()
        })
    
    # Guardar en BD
    for panel in panels:
        await db.solar_panels.update_one(
            {"panel_id": panel["panel_id"]},
            {"$set": panel},
            upsert=True
        )
    
    return panels
```

---

## 📊 ACTIVIDAD RECIENTE EN TIEMPO REAL

```javascript
// Hook para actividades
export const useActivityFeed = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await axios.get(`${API}/activities/recent`);
      setActivities(res.data);
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Cada 10 seg
    
    return () => clearInterval(interval);
  }, []);

  return activities;
};
```

---

## 🎯 RESUMEN DE PASOS

1. **Backend**: Crea endpoints `/api/panels` y `/api/metrics`
2. **Conecta IoT**: Integra API del inversor o sensores MQTT
3. **Frontend**: Usa hooks personalizados con `setInterval` para actualización automática
4. **Base de Datos**: Guarda histórico en MongoDB para gráficos
5. **WebSocket** (Opcional): Para actualizaciones instantáneas

---

## 📝 PROVEEDORES DE DATOS SOLARES COMUNES

- **SolarEdge**: https://www.solaredge.com/products/installer-tools/monitoring-platform
- **Enphase**: https://developer.enphase.com/
- **Fronius**: https://www.fronius.com/en/solar-energy/installers-partners/products-solutions/monitoring
- **Huawei FusionSolar**: https://support.huawei.com/enterprise/en/doc/EDOC1100200453

---

¿Necesitas que implemente alguna de estas opciones específicamente?
