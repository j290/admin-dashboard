# GUÍA COMPLETA: Sistema EFFITECH con Datos Reales

## 🎯 RESUMEN DE CAMBIOS

### ✅ IMPLEMENTADO:
1. **Valores en CERO** hasta recibir datos reales
2. **Registro de paneles** por usuario (CRUD completo)
3. **Conexión con app externa** mediante API
4. **Alertas automáticas** configurables
5. **Fórmula CO₂ personalizable** con variables de app externa

---

## 📡 1. CONECTAR APP EXTERNA DEL DUEÑO

### **Endpoint para Recibir Datos:**

```
POST https://tu-servidor.com/api/external/panel-data
```

### **Headers:**
```
Content-Type: application/json
```

### **Query Parameters:**
```
api_key=effitech-external-key-2025
```

### **Body (JSON):**
```json
{
  "panel_id": "uuid-del-panel",
  "production": 2450.5,
  "temperature": 35.2,
  "timestamp": "2025-01-18T15:30:00Z"
}
```

### **Ejemplo con cURL:**
```bash
curl -X POST "https://tu-servidor.com/api/external/panel-data?api_key=effitech-external-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "panel_id": "abc-123-def",
    "production": 2450.5,
    "temperature": 35.2,
    "timestamp": "2025-01-18T15:30:00Z"
  }'
```

### **Ejemplo con Python (para la app del dueño):**
```python
import requests
from datetime import datetime

def send_panel_data(panel_id, production, temperature=None):
    url = "https://tu-servidor.com/api/external/panel-data"
    
    data = {
        "panel_id": panel_id,
        "production": production,
        "temperature": temperature,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    params = {
        "api_key": "effitech-external-key-2025"
    }
    
    response = requests.post(url, json=data, params=params)
    return response.json()

# Uso
result = send_panel_data(
    panel_id="abc-123-def",
    production=2450.5,
    temperature=35.2
)
print(result)  # {'status': 'success', 'message': 'Datos actualizados'}
```

### **Ejemplo con JavaScript/Node.js:**
```javascript
const axios = require('axios');

async function sendPanelData(panelId, production, temperature = null) {
  const url = 'https://tu-servidor.com/api/external/panel-data';
  
  const data = {
    panel_id: panelId,
    production: production,
    temperature: temperature,
    timestamp: new Date().toISOString()
  };
  
  const response = await axios.post(url, data, {
    params: {
      api_key: 'effitech-external-key-2025'
    }
  });
  
  return response.data;
}

// Uso
sendPanelData('abc-123-def', 2450.5, 35.2)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

---

## 👥 2. GESTIÓN DE PANELES POR USUARIO

### **Registrar Panel:**

**Endpoint:** `POST /api/panels/register`

**Headers:**
```
Authorization: Bearer <token-del-usuario>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Panel Solar A",
  "capacity": 3000,
  "location": "Techo Edificio Principal"
}
```

**Respuesta:**
```json
{
  "panel_id": "abc-123-def-456",
  "user_id": "user-uuid",
  "name": "Panel Solar A",
  "capacity": 3000,
  "current_production": 0,
  "status": "desconectado",
  "location": "Techo Edificio Principal",
  "installation_date": "2025-01-18T15:30:00Z"
}
```

### **Obtener Paneles del Usuario:**

**Endpoint:** `GET /api/panels`

**Headers:**
```
Authorization: Bearer <token-del-usuario>
```

**Respuesta:**
```json
[
  {
    "panel_id": "abc-123",
    "name": "Panel Solar A",
    "capacity": 3000,
    "current_production": 0,
    "status": "desconectado",
    ...
  }
]
```

### **Actualizar Panel:**

**Endpoint:** `PUT /api/panels/{panel_id}`

### **Eliminar Panel:**

**Endpoint:** `DELETE /api/panels/{panel_id}`

---

## 🚨 3. SISTEMA DE ALERTAS AUTOMÁTICAS

### **Configurar Alertas:**

**Endpoint:** `POST /api/alerts/config`

**Body:**
```json
{
  "alert_type": "low_production",
  "threshold_value": 1000,
  "enabled": true
}
```

### **Tipos de Alertas Disponibles:**

1. **`low_production`**: Alerta cuando producción < umbral
   ```json
   {
     "alert_type": "low_production",
     "threshold_value": 1000,
     "enabled": true
   }
   ```

2. **`high_temperature`**: Alerta cuando temperatura > umbral
   ```json
   {
     "alert_type": "high_temperature",
     "threshold_value": 50,
     "enabled": true
   }
   ```

3. **`offline`**: Alerta cuando panel está desconectado
   ```json
   {
     "alert_type": "offline",
     "threshold_value": 0,
     "enabled": true
   }
   ```

### **Obtener Alertas:**

**Endpoint:** `GET /api/alerts`

**Respuesta:**
```json
[
  {
    "alert_id": "alert-uuid",
    "user_id": "user-uuid",
    "panel_id": "panel-uuid",
    "alert_type": "low_production",
    "message": "Producción baja en Panel Solar A: 800 kWh (umbral: 1000 kWh)",
    "timestamp": "2025-01-18T15:30:00Z",
    "read": false
  }
]
```

---

## 🌱 4. FÓRMULA CO₂ PERSONALIZABLE

### **Configurar Fórmula:**

**Endpoint:** `POST /api/co2/formula`

**Body:**
```json
{
  "formula_variables": {
    "kwh_factor": 0.5,
    "efficiency_multiplier": 1.2,
    "region_factor": 0.8,
    "custom_variable": 1.5
  }
}
```

### **Variables Disponibles:**

La fórmula puede usar cualquier variable que envíes desde la app externa:

```javascript
CO₂_evitado = total_kwh × kwh_factor × efficiency_multiplier × region_factor × ...
```

### **Calcular CO₂:**

**Endpoint:** `GET /api/co2/calculate`

**Respuesta:**
```json
{
  "total_production_kwh": 6532,
  "co2_avoided_kg": 3916.8,
  "co2_avoided_tons": 3.9168
}
```

### **Ejemplo de Uso:**

```javascript
// 1. Configurar fórmula personalizada
await axios.post('/api/co2/formula', {
  formula_variables: {
    kwh_factor: 0.6,           // kg CO2 por kWh
    efficiency_multiplier: 1.1, // Factor de eficiencia
    // Agrega las variables que necesites de tu app
  }
});

// 2. Calcular CO2 evitado
const result = await axios.get('/api/co2/calculate');
console.log(`CO2 evitado: ${result.data.co2_avoided_tons} toneladas`);
```

---

## 🔄 5. FLUJO COMPLETO DE DATOS

```
┌─────────────────────────────────────────────────┐
│  1. Usuario Registra Panel en EFFITECH         │
│     POST /api/panels/register                   │
│     → panel_id: "abc-123"                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Panel Aparece en Dashboard (valor en 0)     │
│     Estado: "desconectado"                      │
│     Producción: 0 kWh                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. App Externa Envía Datos                     │
│     POST /api/external/panel-data               │
│     {                                           │
│       "panel_id": "abc-123",                    │
│       "production": 2450.5,                     │
│       "temperature": 35.2                       │
│     }                                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Sistema Actualiza Panel                     │
│     Estado: "activo"                            │
│     Producción: 2450.5 kWh                      │
│     Barras se animan automáticamente            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Sistema Verifica Alertas                    │
│     Si producción < umbral → Crear alerta       │
│     Si temperatura > umbral → Crear alerta      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Usuario Ve Datos Actualizados               │
│     Dashboard actualiza cada 5 segundos         │
│     Alertas aparecen en tiempo real             │
└─────────────────────────────────────────────────┘
```

---

## 📱 6. INTEGRACIÓN CON APP DEL DUEÑO

### **Opción A: Polling (Consulta Periódica)**

La app del dueño envía datos cada X segundos:

```python
import time
import schedule

def update_panels():
    # Leer sensores
    panels_data = read_sensors()
    
    # Enviar a EFFITECH
    for panel in panels_data:
        send_panel_data(
            panel_id=panel['id'],
            production=panel['kwh'],
            temperature=panel['temp']
        )

# Ejecutar cada 5 segundos
schedule.every(5).seconds.do(update_panels)

while True:
    schedule.run_pending()
    time.sleep(1)
```

### **Opción B: Webhook (Evento Disparado)**

Tu app envía datos cuando detecta un cambio:

```python
def on_sensor_change(panel_id, new_value):
    # Cuando el sensor detecta cambio, enviar inmediatamente
    send_panel_data(panel_id, new_value)
```

---

## 🧪 7. PROBAR SIN LA APP EXTERNA

Mientras no tengas la app del dueño lista, puedes simular datos:

### **Script de Prueba (Python):**

```python
import requests
import random
import time
from datetime import datetime

API_URL = "http://localhost:8001/api/external/panel-data"
API_KEY = "effitech-external-key-2025"
PANEL_ID = "tu-panel-id-aqui"  # Copia del dashboard

while True:
    # Simular datos
    production = random.uniform(2000, 2500)
    temperature = random.uniform(25, 45)
    
    data = {
        "panel_id": PANEL_ID,
        "production": production,
        "temperature": temperature,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    try:
        response = requests.post(
            API_URL,
            json=data,
            params={"api_key": API_KEY}
        )
        print(f"✓ Enviado: {production:.2f} kWh, {temperature:.1f}°C")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    time.sleep(5)  # Enviar cada 5 segundos
```

---

## 🔐 8. SEGURIDAD

### **Cambiar API Key:**

Edita `/app/backend/.env`:

```bash
EXTERNAL_APP_API_KEY="tu-clave-secreta-aqui"
```

### **Validación de Requests:**

Todos los requests a `/api/external/*` requieren API key válida.

---

## 📊 9. MONITOREO

### **Ver Estado de Paneles:**
```bash
GET /api/panels
```

### **Ver Alertas:**
```bash
GET /api/alerts
```

### **Ver Métricas:**
```bash
GET /api/metrics
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] 1. Registrar paneles en EFFITECH
- [ ] 2. Copiar `panel_id` de cada panel
- [ ] 3. Configurar app externa con API key
- [ ] 4. Implementar envío de datos desde app externa
- [ ] 5. Configurar alertas (umbrales)
- [ ] 6. Configurar fórmula CO₂
- [ ] 7. Probar con datos simulados
- [ ] 8. Conectar sensores reales
- [ ] 9. Verificar que datos lleguen correctamente
- [ ] 10. Configurar intervalo de actualización

---

## 🆘 SOPORTE

Si tienes problemas:

1. **Verificar logs del backend:**
   ```bash
   tail -f /var/log/supervisor/backend.err.log
   ```

2. **Verificar que el panel existe:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8001/api/panels
   ```

3. **Probar endpoint externo:**
   ```bash
   curl -X POST "http://localhost:8001/api/external/panel-data?api_key=effitech-external-key-2025" \
        -H "Content-Type: application/json" \
        -d '{"panel_id":"PANEL_ID","production":2450,"timestamp":"2025-01-18T15:30:00Z"}'
   ```

---

¿Necesitas ayuda con alguna parte específica de la integración?
