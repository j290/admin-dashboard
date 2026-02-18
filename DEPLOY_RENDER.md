# EFFITECH - Despliegue en Render

## Estructura del Proyecto
```
effitech/
├── backend/          # API FastAPI
│   ├── server.py
│   ├── requirements.txt
│   └── .env (NO subir a git)
├── frontend/         # React App
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env (NO subir a git)
└── README.md
```

## 1. Preparación

### Crear cuenta en MongoDB Atlas (Gratis)
1. Ve a https://www.mongodb.com/atlas
2. Crea cuenta → Crear cluster gratuito (M0)
3. Database Access → Crear usuario con contraseña
4. Network Access → Añadir IP `0.0.0.0/0`
5. Copiar Connection String

### Generar JWT Secret Key
Usa este comando para generar una clave segura:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## 2. Despliegue en Render

### Backend (Web Service)
1. New → Web Service
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** effitech-api
   - **Root Directory:** backend
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. Environment Variables:
   ```
   MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/
   DB_NAME=effitech_production
   JWT_SECRET_KEY=tu-clave-secreta-de-64-caracteres
   CORS_ORIGINS=https://tu-frontend.onrender.com
   ```

### Frontend (Static Site)
1. New → Static Site
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** effitech-app
   - **Root Directory:** frontend
   - **Build Command:** `yarn install && yarn build`
   - **Publish Directory:** build

4. Environment Variables:
   ```
   REACT_APP_BACKEND_URL=https://tu-backend.onrender.com
   ```

## 3. Orden de Despliegue
1. Primero despliega el **Backend** y espera a que esté activo
2. Copia la URL del backend (ej: https://effitech-api.onrender.com)
3. Despliega el **Frontend** usando esa URL en REACT_APP_BACKEND_URL
4. Actualiza CORS_ORIGINS en el backend con la URL del frontend

## 4. Verificar Despliegue
- Backend: `https://tu-backend.onrender.com/api/health`
- Frontend: `https://tu-frontend.onrender.com`

## 5. Primer Usuario (Admin)
El primer usuario que se registre será automáticamente administrador.

## Credenciales de Prueba (Desarrollo)
- Admin: admin@effitech.com / admin123
- Usuario: usuario@effitech.com / user123

## Notas Importantes
- El tier gratuito de Render "duerme" después de 15 min de inactividad
- La primera carga puede tardar ~30 segundos
- Para producción real, considera un plan de pago
