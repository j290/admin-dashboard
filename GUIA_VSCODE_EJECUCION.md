# GUÍA: Cómo Ejecutar EFFITECH en Visual Studio Code

## ⚠️ IMPORTANTE: LIVE SERVER NO FUNCIONA CON REACT

**Live Server solo funciona con HTML/CSS/JS estático.**

React necesita un **servidor de desarrollo** que:
- Compile JSX a JavaScript
- Procese imports de módulos
- Aplique hot reload
- Transpile código moderno

---

## ✅ FORMA CORRECTA DE EJECUTAR EL PROYECTO

### **OPCIÓN 1: Terminal Integrada de VSCode (RECOMENDADO)**

#### PASO 1: Abrir el proyecto en VSCode
```bash
# En tu computadora
cd ruta/a/effitech
code .
```

#### PASO 2: Abrir Terminal Integrada
- **Windows/Linux**: `Ctrl + ñ` o `Ctrl + }`
- **Mac**: `Cmd + ñ` o `Cmd + }`
- O desde menú: Terminal → New Terminal

#### PASO 3: Ejecutar Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### PASO 4: Ejecutar Frontend (Terminal 2)
Click en el **+** para abrir nueva terminal:
```bash
cd frontend
yarn install    # Solo la primera vez
yarn start
```

✅ **La página se abrirá automáticamente en**: http://localhost:3000

---

## 🔧 ESTRUCTURA DE TERMINALES EN VSCODE

```
┌─────────────────────────────────────────┐
│  VSCODE                                 │
├─────────────────────────────────────────┤
│  Código aquí                            │
│                                         │
├─────────────────────────────────────────┤
│  TERMINAL 1: Backend                    │
│  > cd backend                           │
│  > uvicorn server:app --reload          │
│  ✓ Backend corriendo en :8001           │
├─────────────────────────────────────────┤
│  TERMINAL 2: Frontend                   │
│  > cd frontend                          │
│  > yarn start                           │
│  ✓ Frontend corriendo en :3000          │
└─────────────────────────────────────────┘
```

---

## 🚀 SCRIPTS ÚTILES (Opcional)

Puedes crear scripts para facilitar el inicio:

### **Windows**: `start.bat`
```batch
@echo off
start cmd /k "cd backend && uvicorn server:app --reload"
start cmd /k "cd frontend && yarn start"
```

### **Mac/Linux**: `start.sh`
```bash
#!/bin/bash
cd backend && uvicorn server:app --reload &
cd frontend && yarn start &
```

Ejecutar:
```bash
chmod +x start.sh
./start.sh
```

---

## 📝 COMANDOS RÁPIDOS

### Instalar dependencias:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

### Ejecutar en modo desarrollo:
```bash
# Backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend
cd frontend
yarn start
```

### Compilar para producción:
```bash
cd frontend
yarn build
# Los archivos compilados estarán en /frontend/build
```

---

## ❌ POR QUÉ LIVE SERVER NO FUNCIONA

Cuando intentas abrir `index.html` con Live Server:

1. ❌ No compila JSX
2. ❌ No procesa `import` statements
3. ❌ No carga variables de entorno (`.env`)
4. ❌ No ejecuta Webpack/Vite
5. ❌ Página en blanco porque el navegador no entiende JSX

```html
<!-- Este código NO funciona en el navegador directamente -->
<div>
  {user?.name}  ❌ Sintaxis JSX
</div>
```

---

## 🎯 FLUJO CORRECTO DE DESARROLLO

```
1. Abrir VSCode
   ↓
2. Abrir 2 terminales
   ↓
3. Terminal 1: cd backend && uvicorn server:app --reload
   ↓
4. Terminal 2: cd frontend && yarn start
   ↓
5. Editar archivos en VSCode
   ↓
6. Guardar (Ctrl+S) → Hot Reload automático ✓
   ↓
7. Ver cambios en http://localhost:3000
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "yarn: command not found"
```bash
# Instalar yarn
npm install -g yarn
```

### Problema: Puerto 3000 ya en uso
```bash
# Matar proceso
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Problema: Errores de módulos
```bash
# Limpiar caché
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

---

## 📦 EXTENSIONES ÚTILES DE VSCODE

Para mejor experiencia de desarrollo:

1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **Python** (para backend)
5. **Tailwind CSS IntelliSense**
6. **Auto Rename Tag**

---

## 🎨 EDITAR Y VER CAMBIOS EN TIEMPO REAL

1. Con `yarn start` corriendo
2. Abre cualquier archivo `.js` en VSCode
3. Edita el texto, por ejemplo en `Login.js`:
   ```javascript
   <h1>MI NUEVO TÍTULO</h1>
   ```
4. Guarda (Ctrl+S)
5. **Hot Reload automático** - cambios visibles en 1-2 segundos

---

## 📂 ARCHIVOS QUE PUEDES EDITAR

```
frontend/src/
├── App.js                    ← Rutas principales
├── components/
│   ├── auth/
│   │   ├── Login.js          ← Textos de login
│   │   └── Register.js       ← Textos de registro
│   └── dashboard/
│       ├── Overview.js       ← Dashboard principal
│       ├── EnergyMonitoring.js  ← Monitoreo
│       ├── Analytics.js      ← Análisis
│       └── Settings.js       ← Configuración
└── index.css                 ← Estilos globales
```

**Edita cualquiera de estos archivos y guarda → Verás cambios automáticamente**

---

## ✅ CHECKLIST DE INICIO

- [ ] Instalar Node.js (v16+)
- [ ] Instalar Python (3.9+)
- [ ] Instalar MongoDB
- [ ] Clonar proyecto
- [ ] `cd backend && pip install -r requirements.txt`
- [ ] `cd frontend && yarn install`
- [ ] Crear archivos `.env` en backend y frontend
- [ ] Abrir 2 terminales en VSCode
- [ ] Terminal 1: `cd backend && uvicorn server:app --reload`
- [ ] Terminal 2: `cd frontend && yarn start`
- [ ] Abrir http://localhost:3000

---

## 💡 RESUMEN

✅ **USAR**: `yarn start` en terminal de VSCode
❌ **NO USAR**: Live Server extension

**Razón**: React no es HTML estático, necesita compilación.

---

¿Todo claro? ¡Ahora puedes desarrollar con hot reload completo! 🚀
