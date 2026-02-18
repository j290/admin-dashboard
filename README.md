# 🌱 EFFITECH - Sistema de Gestión de Energía Solar

<div align="center">
  
  ![EFFITECH Logo](https://img.shields.io/badge/EFFITECH-Solar%20Energy-064E3B?style=for-the-badge&logo=solaredge)
  
  **Plataforma Profesional de Monitoreo y Gestión de Energía Solar**
  
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4.5-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-3.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)
- [Personalización](#-personalización)
- [Producción](#-producción)
- [Soporte](#-soporte)

---

## ✨ Características

### Autenticación Segura
- 🔐 Sistema JWT con tokens de 7 días
- 🔒 Contraseñas hasheadas con bcrypt
- 👤 Registro y login de usuarios
- 🛡️ Protección de rutas en frontend

### Dashboard Profesional
- 📊 Panel de control completo
- ⚡ Monitoreo de energía solar en tiempo real
- 📈 Análisis y métricas de producción
- ⚙️ Configuración de perfil y preferencias

### Interfaz Premium
- 🎨 Diseño corporativo con colores verde sostenible
- 📱 Totalmente responsive (móvil, tablet, desktop)
- 🌐 100% en español
- ✨ Animaciones suaves y micro-interacciones
- 🎯 Tooltips y mensajes contextuales

### Funcionalidades
- 💬 Botón de ayuda flotante
- 🔔 Sistema de notificaciones (toasts)
- 📉 Visualización de datos con gráficos
- 🔄 Actualización automática de datos
- 🎭 Manejo de estados de carga y errores

---

## 🛠 Tecnologías

### Backend
```
FastAPI          → Framework web moderno y rápido
MongoDB          → Base de datos NoSQL
Motor            → Driver async de MongoDB
PyJWT            → Autenticación JWT
Passlib          → Hashing de contraseñas con bcrypt
Pydantic         → Validación de datos
```

### Frontend
```
React 19         → Librería UI
React Router     → Enrutamiento
Axios            → Cliente HTTP
Tailwind CSS     → Framework de estilos
Shadcn/UI        → Componentes accesibles
Lucide React     → Iconos
Sonner           → Notificaciones toast
```

---

## 🚀 Instalación

### Prerequisitos

- **Node.js** >= 16.0.0
- **Python** >= 3.9
- **MongoDB** >= 4.5
- **Yarn** (recomendado) o npm

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd effitech
```

### 2. Instalar Dependencias

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
yarn install
# o npm install
```

---

## ⚙️ Configuración

### Variables de Entorno

#### Backend (`backend/.env`)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="effitech_db"
CORS_ORIGINS="*"
JWT_SECRET_KEY="tu-clave-secreta-super-segura"
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_BACKEND_URL="http://localhost:8001"
```

### MongoDB

Asegúrate de que MongoDB esté corriendo:

```bash
# Linux/Mac
sudo systemctl start mongod

# Windows
net start MongoDB

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:4.5
```

---

## 💻 Uso

### Desarrollo

Abre **dos terminales**:

#### Terminal 1 - Backend
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

#### Terminal 2 - Frontend
```bash
cd frontend
yarn start
```

La aplicación se abrirá automáticamente en: **http://localhost:3000**

### Producción

```bash
# Backend
cd backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd frontend
yarn build
# Servir los archivos de /build con nginx o similar
```

---

## 📁 Estructura del Proyecto

```
effitech/
├── backend/
│   ├── server.py              # Aplicación FastAPI
│   ├── requirements.txt       # Dependencias Python
│   └── .env                   # Variables de entorno
│
├── frontend/
│   ├── public/                # Archivos estáticos
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── dashboard/     # Componentes del dashboard
│   │   │   ├── ui/            # Componentes Shadcn/UI
│   │   │   ├── HelpButton.js  # Botón de ayuda flotante
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js # Estado global de autenticación
│   │   ├── App.js             # Componente principal
│   │   ├── App.css
│   │   └── index.css          # Estilos globales
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── README.md
└── CODIGO_COMPLETO_EFFITECH.md
```

---

## 📚 API Documentation

### Endpoints Principales

#### Autenticación

**POST** `/api/auth/register`
```json
{
  "email": "usuario@empresa.com",
  "password": "contraseña123",
  "full_name": "Juan Pérez"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "usuario@empresa.com",
  "password": "contraseña123"
}
```

**GET** `/api/auth/me`
```
Headers: Authorization: Bearer <token>
```

### Documentación Interactiva

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

---

## 🎨 Personalización

### Colores

Edita `/frontend/src/index.css`:

```css
:root {
  --primary: 160 84% 15%;        /* Verde principal */
  --secondary: 155 100% 96%;     /* Verde claro */
  --accent: 160 78% 37%;         /* Verde acento */
  /* ... */
}
```

### Tipografía

Edita `/frontend/tailwind.config.js`:

```javascript
fontFamily: {
  heading: ['Outfit', 'sans-serif'],
  body: ['Public Sans', 'sans-serif'],
}
```

### Textos

Todos los textos están en español y se pueden editar directamente en los componentes:

- Login: `/frontend/src/components/auth/Login.js`
- Dashboard: `/frontend/src/components/dashboard/Overview.js`
- etc.

---

## 🌐 Producción

### Checklist Pre-Deploy

- [ ] Cambiar `JWT_SECRET_KEY` por una clave segura
- [ ] Configurar `CORS_ORIGINS` con dominios específicos
- [ ] Usar MongoDB Atlas (cloud) en lugar de localhost
- [ ] Configurar HTTPS
- [ ] Optimizar imágenes y assets
- [ ] Habilitar gzip/brotli compression
- [ ] Configurar logs de producción
- [ ] Implementar rate limiting
- [ ] Backup automático de base de datos

### Despliegue Recomendado

- **Backend**: Railway, Render, AWS EC2
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar logs
tail -f /var/log/supervisor/backend.err.log

# Verificar puerto
lsof -i:8001

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Frontend no compila
```bash
# Limpiar caché
rm -rf node_modules yarn.lock
yarn install

# Verificar versión de Node
node --version  # Debe ser >= 16
```

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongosh --eval "db.version()"

# Verificar conexión
mongosh mongodb://localhost:27017
```

---

## 📞 Soporte

### Documentación Adicional

- **Guía de Integración**: Ver `/GUIA_INTEGRACION_COMPLETA.md`
- **Guía de VSCode**: Ver `/GUIA_VSCODE_EJECUCION.md`
- **Arquitectura**: Ver `/ARCHITECTURE.md`

### Contacto

- 📧 Email: soporte@effitech.com
- 💬 Botón de ayuda en la aplicación
- 📖 Docs: http://localhost:8001/docs

---

## 📄 Licencia

Este proyecto es propiedad de EFFITECH. Todos los derechos reservados.

---

## 🙏 Agradecimientos

Desarrollado con ❤️ por el equipo de EFFITECH

**Impulsando el futuro con energía limpia**

---

<div align="center">
  
  ⚡ **EFFITECH** ⚡
  
  *Monitoreo Inteligente de Energía Solar*

</div>
