# EFFITECH - Sistema de Gestión de Energía Solar
## Product Requirements Document (PRD)

### Información General
- **Nombre del Proyecto:** EFFITECH Dashboard
- **Stack Tecnológico:** React (Frontend) + FastAPI (Backend) + MongoDB (Database)
- **Idioma de la Interfaz:** Español
- **Última actualización:** 18 Enero 2026

---

## Declaración del Problema Original
Desarrollar una plataforma web corporativa para EFFITECH, una empresa de energía solar. La plataforma está destinada a clientes empresariales para monitorear proyectos de energía y paneles solares, con un sistema de roles para administradores y usuarios regulares.

---

## Requisitos Implementados ✅

### 1. Sistema de Autenticación (Completo)
- [x] Login con email y contraseña
- [x] Registro de nuevos usuarios
- [x] Validación JWT
- [x] Primer usuario registrado se convierte automáticamente en administrador
- [x] Toast notifications en español (auto-dismiss 2 segundos)

### 2. Sistema de Roles (Completo)
- [x] **Administradores:** Pueden gestionar paneles y usuarios
- [x] **Usuarios regulares:** Solo pueden ver sus paneles asignados
- [x] Protección de rutas admin en frontend (AdminRoute)
- [x] Validación de permisos en backend

### 3. Gestión de Usuarios - Solo Admin (Completo)
- [x] Listar todos los usuarios registrados
- [x] Ver rol y fecha de registro
- [x] Cambiar rol de usuario (admin ↔ user)
- [x] Eliminar usuarios
- [x] Protección: admin no puede eliminarse a sí mismo ni quitarse su rol

### 4. Gestión de Paneles Solares - Solo Admin (Completo)
- [x] Crear nuevos paneles (modelo, ubicación, capacidad)
- [x] Editar información de paneles
- [x] Cambiar estado (activo/inactivo/mantenimiento)
- [x] Asignar paneles a usuarios específicos
- [x] Desasignar paneles de usuarios
- [x] Eliminar paneles
- [x] Ver estadísticas: total, activos, asignados, capacidad total

### 5. Dashboard Principal (Completo)
- [x] Página de resumen con métricas estáticas
- [x] Estado del sistema
- [x] Actividad reciente
- [x] Diseño profesional con colores verde y blanco

### 6. Navegación Condicional (Completo)
- [x] Sidebar muestra sección "Administración" solo a admins
- [x] Badge "Admin" visible en perfil de usuario admin
- [x] Menú móvil responsivo con misma lógica

### 7. UI/UX (Completo)
- [x] Diseño premium, minimalista, profesional
- [x] Colores corporativos: verde (#16a34a) y blanco
- [x] Toda la interfaz en español
- [x] Botón de ayuda flotante (?) que abre cliente de correo
- [x] Sombras suaves y micro-interacciones

---

## Estructura de la Base de Datos

### Colección: users
```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "password": "hashed",
  "role": "admin | user",
  "created_at": "ISO datetime"
}
```

### Colección: panels
```json
{
  "id": "uuid",
  "model": "string",
  "location": "string",
  "capacity": "number (kWh)",
  "status": "activo | inactivo | mantenimiento",
  "user_id": "uuid | null",
  "created_at": "ISO datetime"
}
```

---

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios (Solo Admin)
- `GET /api/users` - Listar todos los usuarios
- `PUT /api/users/{id}/role` - Cambiar rol de usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Paneles
- `POST /api/panels` - Crear panel (admin)
- `GET /api/panels` - Listar paneles (admin: todos, user: solo asignados)
- `GET /api/panels/{id}` - Obtener panel específico
- `PUT /api/panels/{id}` - Actualizar panel (admin)
- `DELETE /api/panels/{id}` - Eliminar panel (admin)
- `POST /api/panels/{id}/assign/{user_id}` - Asignar panel (admin)
- `POST /api/panels/{id}/unassign` - Desasignar panel (admin)

---

## Credenciales de Test
- **Admin:** admin@effitech.com / admin123
- **Usuario:** usuario@effitech.com / user123

---

## Tareas Futuras / Backlog

### P1 - Alta Prioridad
- [ ] Mostrar paneles del usuario en página "Monitoreo de Energía"
- [ ] Dashboard personalizado por usuario mostrando solo sus paneles

### P2 - Media Prioridad
- [ ] Integración de datos en tiempo real (API externa del propietario)
- [ ] Gráficos de producción con datos reales
- [ ] Fórmula configurable de ahorro de CO2

### P3 - Baja Prioridad
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones por email
- [ ] Multi-idioma (inglés)

---

## Notas Técnicas
- Los datos del dashboard son estáticos/demo por solicitud del usuario
- La integración de datos en tiempo real fue explícitamente pospuesta
- El sistema está preparado para conectar a API externa cuando se requiera
