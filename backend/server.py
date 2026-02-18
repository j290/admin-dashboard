"""
EFFITECH - Sistema de Gestión de Energía Solar
Backend API - FastAPI + MongoDB + JWT Authentication

Autor: Equipo EFFITECH
Versión: 2.0.0
"""

from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List, Literal
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

# ==================== CONFIGURACIÓN ====================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Conexión MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configuración JWT
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'effitech-solar-energy-platform-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 días

# Seguridad de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Crear aplicación
app = FastAPI(
    title="EFFITECH API",
    description="Sistema de Gestión de Energía Solar",
    version="2.0.0"
)

# Router con prefijo /api
api_router = APIRouter(prefix="/api")

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ==================== MODELOS DE DATOS ====================

class UserCreate(BaseModel):
    """Modelo para crear un nuevo usuario"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Mínimo 6 caracteres")
    full_name: str

class UserLogin(BaseModel):
    """Modelo para inicio de sesión"""
    email: EmailStr
    password: str

class User(BaseModel):
    """Modelo de usuario (sin contraseña)"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: Literal["admin", "user"] = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    """Modelo de respuesta de usuario para listados"""
    id: str
    email: str
    full_name: str
    role: str
    created_at: str

class Token(BaseModel):
    """Modelo de respuesta de autenticación"""
    access_token: str
    token_type: str
    user: User

class UpdateUserRole(BaseModel):
    """Modelo para actualizar rol de usuario"""
    role: Literal["admin", "user"]

# ==================== MODELOS DE PANELES ====================

class PanelCreate(BaseModel):
    """Modelo para crear un nuevo panel"""
    model: str
    location: str
    capacity: float = Field(..., gt=0, description="Capacidad en kWh")

class PanelUpdate(BaseModel):
    """Modelo para actualizar un panel"""
    model: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[float] = None
    status: Optional[Literal["activo", "inactivo", "mantenimiento"]] = None
    user_id: Optional[str] = None

class Panel(BaseModel):
    """Modelo de panel solar"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model: str
    location: str
    capacity: float
    status: Literal["activo", "inactivo", "mantenimiento"] = "activo"
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PanelResponse(BaseModel):
    """Modelo de respuesta de panel"""
    id: str
    model: str
    location: str
    capacity: float
    status: str
    user_id: Optional[str]
    user_name: Optional[str] = None
    created_at: str


# ==================== FUNCIONES DE SEGURIDAD ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña contra hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generar hash de contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Obtener usuario actual del token JWT"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No se pudo validar las credenciales"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales"
        )
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    # Convertir timestamp ISO a datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    # Asegurar que tenga rol (compatibilidad con usuarios antiguos)
    if 'role' not in user_doc:
        user_doc['role'] = 'user'
    
    return User(**user_doc)

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verificar que el usuario actual es administrador"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos de administrador"
        )
    return current_user


# ==================== RUTAS DE AUTENTICACIÓN ====================

@api_router.post("/auth/register", response_model=Token, tags=["Autenticación"])
async def register(user_data: UserCreate):
    """
    Registrar un nuevo usuario
    
    - **email**: Correo electrónico único
    - **password**: Contraseña (mínimo 6 caracteres)
    - **full_name**: Nombre completo del usuario
    """
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado"
        )
    
    # Verificar si es el primer usuario (será admin)
    user_count = await db.users.count_documents({})
    is_first_user = user_count == 0
    
    # Crear nuevo usuario
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role="admin" if is_first_user else "user"
    )
    
    # Preparar documento para MongoDB
    user_doc = user.model_dump()
    user_doc['password'] = get_password_hash(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Crear token de acceso
    access_token = create_access_token(data={"sub": user.id})
    
    logger.info(f"Nuevo usuario registrado: {user.email} (rol: {user.role})")
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@api_router.post("/auth/login", response_model=Token, tags=["Autenticación"])
async def login(credentials: UserLogin):
    """
    Iniciar sesión
    
    - **email**: Correo electrónico
    - **password**: Contraseña
    """
    # Buscar usuario
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    
    # Verificar contraseña
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    
    # Convertir timestamp ISO a datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    # Asegurar que tenga rol (compatibilidad con usuarios antiguos)
    if 'role' not in user_doc:
        user_doc['role'] = 'user'
    
    # Remover datos sensibles
    user_doc.pop('password')
    user_doc.pop('_id', None)
    
    user = User(**user_doc)
    
    # Crear token de acceso
    access_token = create_access_token(data={"sub": user.id})
    
    logger.info(f"Usuario autenticado: {user.email}")
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@api_router.get("/auth/me", response_model=User, tags=["Autenticación"])
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual
    
    Requiere token JWT válido en el header Authorization
    """
    return current_user


# ==================== RUTAS DE GESTIÓN DE USUARIOS (ADMIN) ====================

@api_router.get("/users", response_model=List[UserResponse], tags=["Usuarios"])
async def list_users(admin: User = Depends(get_admin_user)):
    """
    Listar todos los usuarios (solo admin)
    """
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    result = []
    for u in users:
        result.append(UserResponse(
            id=u['id'],
            email=u['email'],
            full_name=u['full_name'],
            role=u.get('role', 'user'),
            created_at=u['created_at'] if isinstance(u['created_at'], str) else u['created_at'].isoformat()
        ))
    return result

@api_router.put("/users/{user_id}/role", response_model=UserResponse, tags=["Usuarios"])
async def update_user_role(user_id: str, role_data: UpdateUserRole, admin: User = Depends(get_admin_user)):
    """
    Actualizar el rol de un usuario (solo admin)
    """
    # No permitir que un admin se quite su propio rol
    if user_id == admin.id and role_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede quitarse el rol de administrador a sí mismo"
        )
    
    result = await db.users.find_one_and_update(
        {"id": user_id},
        {"$set": {"role": role_data.role}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    logger.info(f"Rol de usuario {user_id} actualizado a {role_data.role}")
    
    return UserResponse(
        id=result['id'],
        email=result['email'],
        full_name=result['full_name'],
        role=result.get('role', 'user'),
        created_at=result['created_at'] if isinstance(result['created_at'], str) else result['created_at'].isoformat()
    )

@api_router.delete("/users/{user_id}", tags=["Usuarios"])
async def delete_user(user_id: str, admin: User = Depends(get_admin_user)):
    """
    Eliminar un usuario (solo admin)
    """
    # No permitir que un admin se elimine a sí mismo
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede eliminarse a sí mismo"
        )
    
    # Primero desasignar paneles del usuario
    await db.panels.update_many(
        {"user_id": user_id},
        {"$set": {"user_id": None}}
    )
    
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    logger.info(f"Usuario {user_id} eliminado")
    
    return {"message": "Usuario eliminado correctamente"}


# ==================== RUTAS DE GESTIÓN DE PANELES ====================

@api_router.post("/panels", response_model=PanelResponse, tags=["Paneles"])
async def create_panel(panel_data: PanelCreate, admin: User = Depends(get_admin_user)):
    """
    Crear un nuevo panel solar (solo admin)
    """
    panel = Panel(
        model=panel_data.model,
        location=panel_data.location,
        capacity=panel_data.capacity
    )
    
    panel_doc = panel.model_dump()
    panel_doc['created_at'] = panel_doc['created_at'].isoformat()
    
    await db.panels.insert_one(panel_doc)
    
    logger.info(f"Nuevo panel creado: {panel.id}")
    
    return PanelResponse(
        id=panel.id,
        model=panel.model,
        location=panel.location,
        capacity=panel.capacity,
        status=panel.status,
        user_id=panel.user_id,
        user_name=None,
        created_at=panel_doc['created_at']
    )

@api_router.get("/panels", response_model=List[PanelResponse], tags=["Paneles"])
async def list_panels(current_user: User = Depends(get_current_user)):
    """
    Listar paneles (admin ve todos, usuarios solo los suyos)
    """
    if current_user.role == "admin":
        panels = await db.panels.find({}, {"_id": 0}).to_list(1000)
    else:
        panels = await db.panels.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    # Obtener nombres de usuarios para los paneles asignados
    user_ids = list(set(p.get('user_id') for p in panels if p.get('user_id')))
    users_map = {}
    if user_ids:
        users = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0, "id": 1, "full_name": 1}).to_list(1000)
        users_map = {u['id']: u['full_name'] for u in users}
    
    result = []
    for p in panels:
        result.append(PanelResponse(
            id=p['id'],
            model=p['model'],
            location=p['location'],
            capacity=p['capacity'],
            status=p.get('status', 'activo'),
            user_id=p.get('user_id'),
            user_name=users_map.get(p.get('user_id')),
            created_at=p['created_at'] if isinstance(p['created_at'], str) else p['created_at'].isoformat()
        ))
    return result

@api_router.get("/panels/{panel_id}", response_model=PanelResponse, tags=["Paneles"])
async def get_panel(panel_id: str, current_user: User = Depends(get_current_user)):
    """
    Obtener un panel específico
    """
    panel = await db.panels.find_one({"id": panel_id}, {"_id": 0})
    
    if not panel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panel no encontrado"
        )
    
    # Usuarios normales solo pueden ver sus paneles
    if current_user.role != "admin" and panel.get('user_id') != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene acceso a este panel"
        )
    
    user_name = None
    if panel.get('user_id'):
        user = await db.users.find_one({"id": panel['user_id']}, {"_id": 0, "full_name": 1})
        if user:
            user_name = user['full_name']
    
    return PanelResponse(
        id=panel['id'],
        model=panel['model'],
        location=panel['location'],
        capacity=panel['capacity'],
        status=panel.get('status', 'activo'),
        user_id=panel.get('user_id'),
        user_name=user_name,
        created_at=panel['created_at'] if isinstance(panel['created_at'], str) else panel['created_at'].isoformat()
    )

@api_router.put("/panels/{panel_id}", response_model=PanelResponse, tags=["Paneles"])
async def update_panel(panel_id: str, panel_data: PanelUpdate, admin: User = Depends(get_admin_user)):
    """
    Actualizar un panel (solo admin)
    """
    update_data = {k: v for k, v in panel_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay datos para actualizar"
        )
    
    result = await db.panels.find_one_and_update(
        {"id": panel_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panel no encontrado"
        )
    
    user_name = None
    if result.get('user_id'):
        user = await db.users.find_one({"id": result['user_id']}, {"_id": 0, "full_name": 1})
        if user:
            user_name = user['full_name']
    
    logger.info(f"Panel {panel_id} actualizado")
    
    return PanelResponse(
        id=result['id'],
        model=result['model'],
        location=result['location'],
        capacity=result['capacity'],
        status=result.get('status', 'activo'),
        user_id=result.get('user_id'),
        user_name=user_name,
        created_at=result['created_at'] if isinstance(result['created_at'], str) else result['created_at'].isoformat()
    )

@api_router.delete("/panels/{panel_id}", tags=["Paneles"])
async def delete_panel(panel_id: str, admin: User = Depends(get_admin_user)):
    """
    Eliminar un panel (solo admin)
    """
    result = await db.panels.delete_one({"id": panel_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panel no encontrado"
        )
    
    logger.info(f"Panel {panel_id} eliminado")
    
    return {"message": "Panel eliminado correctamente"}

@api_router.post("/panels/{panel_id}/assign/{user_id}", response_model=PanelResponse, tags=["Paneles"])
async def assign_panel(panel_id: str, user_id: str, admin: User = Depends(get_admin_user)):
    """
    Asignar un panel a un usuario (solo admin)
    """
    # Verificar que el usuario existe
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    result = await db.panels.find_one_and_update(
        {"id": panel_id},
        {"$set": {"user_id": user_id}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panel no encontrado"
        )
    
    logger.info(f"Panel {panel_id} asignado a usuario {user_id}")
    
    return PanelResponse(
        id=result['id'],
        model=result['model'],
        location=result['location'],
        capacity=result['capacity'],
        status=result.get('status', 'activo'),
        user_id=result.get('user_id'),
        user_name=user['full_name'],
        created_at=result['created_at'] if isinstance(result['created_at'], str) else result['created_at'].isoformat()
    )

@api_router.post("/panels/{panel_id}/unassign", response_model=PanelResponse, tags=["Paneles"])
async def unassign_panel(panel_id: str, admin: User = Depends(get_admin_user)):
    """
    Desasignar un panel de un usuario (solo admin)
    """
    result = await db.panels.find_one_and_update(
        {"id": panel_id},
        {"$set": {"user_id": None}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Panel no encontrado"
        )
    
    logger.info(f"Panel {panel_id} desasignado")
    
    return PanelResponse(
        id=result['id'],
        model=result['model'],
        location=result['location'],
        capacity=result['capacity'],
        status=result.get('status', 'activo'),
        user_id=None,
        user_name=None,
        created_at=result['created_at'] if isinstance(result['created_at'], str) else result['created_at'].isoformat()
    )


# ==================== RUTAS BÁSICAS ====================

@api_router.get("/", tags=["General"])
async def root():
    """Información de la API"""
    return {
        "message": "EFFITECH API - Sistema de Gestión de Energía Solar",
        "version": "1.0.0",
        "status": "operational"
    }

@api_router.get("/health", tags=["General"])
async def health_check():
    """Verificar estado del servidor"""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ==================== CONFIGURACIÓN DE LA APLICACIÓN ====================

# Incluir router en la aplicación
app.include_router(api_router)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Evento al iniciar la aplicación"""
    logger.info("🚀 EFFITECH API iniciada")
    logger.info(f"📊 Base de datos: {os.environ['DB_NAME']}")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Cerrar conexión a la base de datos"""
    client.close()
    logger.info("🔒 Conexión a base de datos cerrada")
