# 🚀 GUÍA RÁPIDA - EFFITECH

## Inicio Rápido (5 minutos)

### 1. Ejecutar el Proyecto

```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --reload

# Terminal 2 - Frontend  
cd frontend
yarn start
```

✅ Abre automáticamente en: **http://localhost:3000**

---

## 📂 Archivos Principales

### 🔐 Autenticación
```
/frontend/src/components/auth/
├── Login.js          ← Página de inicio de sesión
└── Register.js       ← Página de registro
```

### 🏠 Dashboard
```
/frontend/src/components/dashboard/
├── Overview.js       ← Vista principal (métricas)
├── EnergyMonitoring.js  ← Monitoreo de paneles
├── Analytics.js      ← Análisis y gráficos
├── Settings.js       ← Configuración de usuario
└── DashboardLayout.js   ← Layout con sidebar
```

### 🔧 Backend
```
/backend/
└── server.py         ← API completa (todo aquí)
```

---

## ✏️ Modificaciones Comunes

### Cambiar Textos

**Login:**
```javascript
// /frontend/src/components/auth/Login.js
<h1>Bienvenido de Nuevo</h1>  ← Línea 84
```

**Dashboard:**
```javascript
// /frontend/src/components/dashboard/Overview.js
<h1>Resumen del Panel</h1>  ← Línea 48
```

### Cambiar Colores

```css
/* /frontend/src/index.css */
:root {
  --primary: 160 84% 15%;     ← Verde principal
  --accent: 160 78% 37%;      ← Verde acento
}
```

### Agregar Nuevo Panel

```javascript
// /frontend/src/components/dashboard/EnergyMonitoring.js
// Línea 9-18: Array energySources
{
  name: 'Mi Nuevo Panel',
  current: 1500,
  capacity: 2000,
  percentage: 75,
  status: 'activo',
  ...
}
```

---

## 🔌 Conectar a MongoDB

```javascript
// /backend/.env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="effitech_db"
```

---

## 🎨 Agregar Nueva Página

### 1. Crear Componente
```javascript
// /frontend/src/components/dashboard/MiNuevaPagina.js
import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export const MiNuevaPagina = () => {
  return (
    <DashboardLayout>
      <h1>Mi Nueva Página</h1>
    </DashboardLayout>
  );
};
```

### 2. Agregar Ruta
```javascript
// /frontend/src/App.js
import { MiNuevaPagina } from './components/dashboard/MiNuevaPagina';

// Agregar en <Routes>
<Route
  path="/dashboard/mi-nueva-pagina"
  element={
    <PrivateRoute>
      <MiNuevaPagina />
    </PrivateRoute>
  }
/>
```

### 3. Agregar al Menú
```javascript
// /frontend/src/components/dashboard/DashboardLayout.js
// Línea 18-22: Array navigation
{ 
  name: 'Mi Nueva Página', 
  href: '/dashboard/mi-nueva-pagina', 
  icon: Settings 
}
```

---

## 🐛 Solución Rápida de Errores

### ❌ "Module not found"
```bash
cd frontend
yarn install
```

### ❌ "Port 3000 already in use"
```bash
# Matar proceso
lsof -ti:3000 | xargs kill -9
```

### ❌ "Failed to connect to MongoDB"
```bash
# Iniciar MongoDB
sudo systemctl start mongod
```

### ❌ "Token expired"
```javascript
// El usuario debe hacer logout y login de nuevo
// Los tokens duran 7 días
```

---

## 📊 Ver Datos en MongoDB

```bash
# Conectar a MongoDB
mongosh

# Usar base de datos
use effitech_db

# Ver usuarios
db.users.find().pretty()

# Contar usuarios
db.users.countDocuments()
```

---

## 🎯 Comandos Útiles

```bash
# Instalar nueva librería (Frontend)
cd frontend
yarn add nombre-libreria

# Instalar nueva librería (Backend)
cd backend
pip install nombre-libreria
pip freeze > requirements.txt

# Ver logs del backend
tail -f /var/log/supervisor/backend.err.log

# Compilar para producción
cd frontend
yarn build
```

---

## 💡 Tips Profesionales

1. **Usa extensiones de VSCode:**
   - ES7 React snippets
   - Prettier
   - Tailwind CSS IntelliSense

2. **Hot Reload:**
   - Guarda (Ctrl+S) → Cambios automáticos
   - No reinicies servidores

3. **Debug:**
   - Backend: Ver logs en terminal
   - Frontend: F12 → Console tab

4. **Estructura:**
   - Un componente por archivo
   - Nombres en PascalCase
   - Carpetas organizadas por feature

---

## 🔑 Atajos de Teclado

```
Ctrl + S         → Guardar
Ctrl + `         → Abrir terminal en VSCode
Ctrl + B         → Ocultar/Mostrar sidebar
Ctrl + P         → Buscar archivo
Ctrl + Shift + P → Command palette
F12              → Abrir DevTools (navegador)
```

---

## ✅ Checklist Diario

- [ ] Backend corriendo (puerto 8001)
- [ ] Frontend corriendo (puerto 3000)
- [ ] MongoDB activo
- [ ] Sin errores en consola
- [ ] Cambios guardados en git

---

**¿Necesitas ayuda?** 

Usa el botón **?** (Ayuda) en la esquina inferior derecha de la aplicación.
