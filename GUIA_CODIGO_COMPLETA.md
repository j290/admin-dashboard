# ============================================================================
# EFFITECH - GUÍA COMPLETA DEL CÓDIGO
# ============================================================================
# Este documento explica cada archivo y su función en el sistema
# ============================================================================

## 📁 ESTRUCTURA DE CARPETAS

```
effitech/
│
├── backend/                    # 🖥️ SERVIDOR (Python + FastAPI)
│   ├── server.py              # Archivo principal del backend
│   ├── requirements.txt       # Lista de librerías necesarias
│   ├── .env                   # Variables secretas (NO subir a GitHub)
│   └── .env.example           # Ejemplo de variables (SÍ subir)
│
├── frontend/                   # 🎨 INTERFAZ WEB (React)
│   ├── public/
│   │   └── index.html         # Página HTML base
│   ├── src/
│   │   ├── App.js             # Componente principal y rutas
│   │   ├── index.js           # Punto de entrada
│   │   ├── context/
│   │   │   └── AuthContext.js # Maneja el estado de login
│   │   └── components/
│   │       ├── auth/          # Páginas de login y registro
│   │       ├── dashboard/     # Páginas del panel de control
│   │       └── ui/            # Componentes visuales reutilizables
│   ├── package.json           # Lista de librerías de React
│   ├── .env                   # Variables de configuración
│   └── .env.example           # Ejemplo de variables
│
└── DEPLOY_RENDER.md           # Instrucciones de despliegue
```

## 🖥️ BACKEND (server.py) - EXPLICACIÓN LÍNEA POR LÍNEA

### SECCIÓN 1: IMPORTACIONES (Líneas 1-22)
```python
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
# FastAPI = Framework para crear APIs web rápidas
# APIRouter = Agrupa rutas bajo un prefijo (como /api)
# HTTPException = Para enviar errores al frontend (404, 401, etc)
# Depends = Inyección de dependencias (ej: verificar si está logueado)

from motor.motor_asyncio import AsyncIOMotorClient
# Motor = Librería para conectar con MongoDB de forma asíncrona
# Asíncrono = Puede hacer varias cosas a la vez sin bloquearse

from passlib.context import CryptContext
# Passlib = Para encriptar contraseñas de forma segura
# NUNCA guardamos contraseñas en texto plano

import jwt
# JWT = JSON Web Token
# Es como un "pase de entrada" que el usuario recibe al loguearse
# Lo envía en cada petición para demostrar que está autenticado
```

### SECCIÓN 2: CONFIGURACIÓN (Líneas 24-58)
```python
load_dotenv(ROOT_DIR / '.env')
# Carga las variables del archivo .env
# Ejemplo: MONGO_URL, JWT_SECRET_KEY

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
# Se conecta a MongoDB usando la URL del .env
# 'db' es nuestra base de datos donde guardamos todo

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', '...')
# Clave secreta para firmar los tokens JWT
# Si alguien la conoce, podría falsificar tokens
# NUNCA compartir esta clave

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Configuración para encriptar contraseñas con bcrypt
# bcrypt es un algoritmo muy seguro
```

### SECCIÓN 3: MODELOS DE DATOS (Líneas 61-139)
```python
class UserCreate(BaseModel):
    email: EmailStr           # Valida que sea un email real
    password: str             # La contraseña que ingresa el usuario
    full_name: str            # Nombre completo

# Los "modelos" definen la ESTRUCTURA de los datos
# Pydantic (BaseModel) valida automáticamente los datos
# Si alguien envía un email inválido, rechaza la petición
```

### SECCIÓN 4: FUNCIONES DE SEGURIDAD (Líneas 142-209)
```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
# Compara la contraseña ingresada con la guardada (encriptada)
# Retorna True si coinciden, False si no

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
# Convierte "mipassword123" en algo como "$2b$12$LQv3..."
# Imposible de revertir (no se puede "desencriptar")

def create_access_token(data: dict):
    # Crea un token JWT con:
    # - Los datos del usuario (su ID)
    # - Fecha de expiración (7 días)
    # - Firma con la clave secreta
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials):
    # Esta función se ejecuta ANTES de cada ruta protegida
    # 1. Extrae el token del header "Authorization"
    # 2. Verifica que no haya expirado
    # 3. Busca al usuario en la base de datos
    # 4. Retorna el usuario o lanza error 401
```

### SECCIÓN 5: RUTAS/ENDPOINTS (Líneas 212-628)
```python
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # RUTA: POST /api/auth/register
    # QUÉ HACE: Registra un nuevo usuario
    # PASOS:
    # 1. Verifica si el email ya existe
    # 2. Si es el primer usuario -> lo hace admin
    # 3. Encripta la contraseña
    # 4. Guarda en MongoDB
    # 5. Genera token JWT
    # 6. Retorna el token y datos del usuario

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # RUTA: POST /api/auth/login
    # QUÉ HACE: Inicia sesión
    # PASOS:
    # 1. Busca usuario por email
    # 2. Verifica la contraseña
    # 3. Genera token JWT
    # 4. Retorna el token

@api_router.get("/users")
async def list_users(admin: User = Depends(get_admin_user)):
    # RUTA: GET /api/users
    # QUÉ HACE: Lista todos los usuarios
    # PROTECCIÓN: Solo admins (get_admin_user)
    # El "Depends" ejecuta get_admin_user ANTES de esta función
    # Si no es admin, nunca llega aquí (error 403)

@api_router.post("/panels")
async def create_panel(panel_data: PanelCreate, admin: User = Depends(get_admin_user)):
    # RUTA: POST /api/panels
    # QUÉ HACE: Crea un nuevo panel solar
    # PROTECCIÓN: Solo admins
```

### SECCIÓN 6: CONFIGURACIÓN CORS (Líneas 657-664)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    ...
)
# CORS = Cross-Origin Resource Sharing
# Por seguridad, los navegadores bloquean peticiones entre dominios diferentes
# Esto permite que tu frontend (effitech-app.com) hable con el backend (effitech-api.com)
# CORS_ORIGINS debe contener la URL de tu frontend
```

## 🎨 FRONTEND - ARCHIVOS PRINCIPALES

### App.js - Rutas de la aplicación
```javascript
// Define QUÉ PÁGINA mostrar según la URL
<Routes>
  <Route path="/login" element={<Login />} />
  // Si la URL es /login → muestra el componente Login

  <Route path="/dashboard" element={
    <PrivateRoute>           // ← Verifica si está logueado
      <Overview />           // ← Si sí, muestra Overview
    </PrivateRoute>
  }/>

  <Route path="/dashboard/users" element={
    <AdminRoute>             // ← Verifica si es ADMIN
      <UserManagement />
    </AdminRoute>
  }/>
</Routes>
```

### AuthContext.js - Estado de autenticación
```javascript
// Guarda si el usuario está logueado o no
// Se comparte con TODA la aplicación

const login = async (email, password) => {
  // 1. Envía email/password al backend
  // 2. Recibe el token JWT
  // 3. Guarda el token en localStorage
  // 4. Guarda datos del usuario en el estado
  // 5. Configura axios para enviar el token en cada petición
};

const logout = () => {
  // 1. Borra el token de localStorage
  // 2. Limpia el estado del usuario
};
```

### Componentes Dashboard
```
DashboardLayout.js  → El "esqueleto" con sidebar y header
Overview.js         → Página de resumen con métricas
UserManagement.js   → Tabla de usuarios (solo admin)
PanelManagement.js  → Tabla de paneles (solo admin)
EnergyMonitoring.js → Monitoreo de energía
```

## 🔐 FLUJO DE AUTENTICACIÓN

```
1. Usuario entra a /login
   ↓
2. Ingresa email y contraseña
   ↓
3. Frontend envía POST /api/auth/login
   ↓
4. Backend verifica credenciales
   ↓
5. Backend genera token JWT y lo envía
   ↓
6. Frontend guarda token en localStorage
   ↓
7. Usuario es redirigido a /dashboard
   ↓
8. Cada petición incluye el token en el header:
   Authorization: Bearer eyJhbGciOiJIUzI1...
   ↓
9. Backend verifica el token antes de responder
```

## 🗄️ BASE DE DATOS (MongoDB)

### Colección: users
```json
{
  "id": "abc-123-def",           // ID único
  "email": "juan@email.com",     // Email (único)
  "full_name": "Juan Pérez",     // Nombre
  "password": "$2b$12$...",      // Contraseña ENCRIPTADA
  "role": "admin",               // "admin" o "user"
  "created_at": "2024-01-15..."  // Fecha de registro
}
```

### Colección: panels
```json
{
  "id": "panel-001",
  "model": "Solar Pro 400W",
  "location": "Edificio A, Techo",
  "capacity": 3000,              // En kWh
  "status": "activo",            // activo/inactivo/mantenimiento
  "user_id": "abc-123-def",      // A quién está asignado (puede ser null)
  "created_at": "2024-01-15..."
}
```

## 🚀 PARA RENDER - PASO A PASO SIMPLE

### PASO 1: Preparar MongoDB Atlas (5 minutos)
1. Ve a mongodb.com/atlas
2. Crea cuenta gratis
3. "Build a Database" → Shared (gratis) → Create
4. Espera que se cree (~3 min)
5. "Database Access" → Add New User
   - Username: effitech_user
   - Password: (genera uno seguro)
   - Guardar
6. "Network Access" → Add IP → Allow Access from Anywhere
7. "Databases" → Connect → Drivers → Copia la connection string
   Será algo como: mongodb+srv://effitech_user:PASSWORD@cluster0.xxxxx.mongodb.net/

### PASO 2: Subir a GitHub
1. Crea repositorio en GitHub
2. Sube tu código (sin archivos .env)

### PASO 3: Crear Backend en Render
1. render.com → New → Web Service
2. Conecta tu repo de GitHub
3. Configuración:
   - Name: effitech-api
   - Root Directory: backend
   - Runtime: Python 3
   - Build: pip install -r requirements.txt
   - Start: uvicorn server:app --host 0.0.0.0 --port $PORT
4. Environment Variables:
   - MONGO_URL = (tu connection string de MongoDB)
   - DB_NAME = effitech_production
   - JWT_SECRET_KEY = (genera con: python -c "import secrets; print(secrets.token_hex(32))")
   - CORS_ORIGINS = * (temporal, luego pones URL del frontend)
5. Create Web Service
6. Espera que despliegue → Copia la URL (ej: https://effitech-api.onrender.com)

### PASO 4: Crear Frontend en Render
1. New → Static Site
2. Conecta el mismo repo
3. Configuración:
   - Name: effitech-app
   - Root Directory: frontend
   - Build: yarn install && yarn build
   - Publish: build
4. Environment Variables:
   - REACT_APP_BACKEND_URL = (URL del backend del paso anterior)
5. Create Static Site

### PASO 5: Actualizar CORS
1. Vuelve al backend en Render
2. Environment → Edit CORS_ORIGINS
3. Pon la URL del frontend: https://effitech-app.onrender.com

¡LISTO! Tu app está en línea 🎉
