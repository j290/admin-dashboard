# EFFITECH Authentication System - Architecture Documentation

## Executive Summary

EFFITECH is a premium corporate web platform for solar energy project management, featuring enterprise-grade authentication, elegant design, and scalable architecture.

## Technical Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB (Motor async driver)
- **Authentication**: JWT (JSON Web Tokens) with Bearer scheme
- **Password Security**: Bcrypt hashing via Passlib
- **API Prefix**: `/api` (Kubernetes ingress routing)

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **State Management**: Context API (AuthContext)
- **Styling**: Tailwind CSS v3 + Custom design system
- **UI Components**: Shadcn/UI (Radix primitives)
- **Typography**: Outfit (headings), Public Sans (body)
- **Notifications**: Sonner toasts

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                     │
│              React SPA (localhost:3000)              │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ REACT_APP_BACKEND_URL
                     │
┌────────────────────▼────────────────────────────────┐
│            KUBERNETES INGRESS GATEWAY                │
│   Routes /api/* → Backend | /* → Frontend            │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
┌────────▼─────────┐   ┌────────▼─────────┐
│  FASTAPI BACKEND │   │  REACT FRONTEND  │
│   Port: 8001     │   │   Port: 3000     │
│  (server.py)     │   │   (Hot Reload)   │
└────────┬─────────┘   └──────────────────┘
         │
         │ MONGO_URL
         │
┌────────▼─────────┐
│   MONGODB        │
│  localhost:27017 │
│  DB: test_database│
└──────────────────┘
```

## Design System

### Color Palette (Corporate Green Theme)
- **Primary**: `#064E3B` (Deep Forest Green) - Brand, CTAs, active states
- **Secondary**: `#ECFDF5` (Pale Mint) - Highlights, hover states
- **Accent**: `#10B981` (Vibrant Emerald) - Success, positive trends
- **Background**: `#F9FAFB` (Off-white) - Main app background
- **Text**: `#111827` (Dark Gray) - Primary text

### Typography
- **Headings**: Outfit (bold, tracking-tight)
- **Body**: Public Sans (regular, leading-relaxed)
- **Code**: JetBrains Mono

### Layout Strategy
- **Auth Pages**: Split-screen (50/50) with hero image on left
- **Dashboard**: Fixed sidebar (64px width) + top header + scrollable content
- **Mobile**: Hamburger menu with slide-out sidebar

## Security Implementation

### Password Security
1. **Hashing**: Bcrypt with automatic salt generation
2. **Validation**: Minimum 6 characters (enforced backend + frontend)
3. **Storage**: Only hashed passwords stored in MongoDB
4. **Transmission**: HTTPS (production), password never logged

### JWT Authentication
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable)
- **Storage**: localStorage (frontend)
- **Transmission**: Authorization Bearer header
- **Secret**: Environment variable `JWT_SECRET_KEY`

### API Security
- **CORS**: Configured via `CORS_ORIGINS` environment variable
- **Protected Routes**: HTTPBearer dependency injection
- **Token Validation**: Automatic expiration checking
- **Error Handling**: Appropriate HTTP status codes (401, 403, 400)

## Database Schema

### Users Collection
```json
{
  "id": "uuid-string",
  "email": "user@company.com",
  "full_name": "John Doe",
  "password": "$2b$12$hashed_password_here",
  "created_at": "2025-01-18T12:00:00.000Z"
}
```

**Indexes Required** (for production):
- `email` (unique)
- `id` (unique)

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
**Request:**
```json
{
  "email": "user@company.com",
  "password": "securepass123",
  "full_name": "John Doe"
}
```
**Response:** (201 Created)
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "full_name": "John Doe",
    "created_at": "2025-01-18T12:00:00"
  }
}
```

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@company.com",
  "password": "securepass123"
}
```
**Response:** (200 OK)
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { ... }
}
```

#### GET `/api/auth/me`
**Headers:** `Authorization: Bearer <token>`
**Response:** (200 OK)
```json
{
  "id": "uuid",
  "email": "user@company.com",
  "full_name": "John Doe",
  "created_at": "2025-01-18T12:00:00"
}
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js          # Split-screen login form
│   │   └── Register.js       # Split-screen registration form
│   ├── dashboard/
│   │   ├── DashboardLayout.js  # Sidebar + header wrapper
│   │   └── Overview.js         # Main dashboard content
│   ├── ui/                     # Shadcn components
│   └── PrivateRoute.js         # Route protection HOC
├── context/
│   └── AuthContext.js          # Global auth state
├── App.js                      # Main router
└── index.css                   # Global styles + design tokens
```

### Authentication Flow

#### Registration Flow
1. User fills registration form (full name, email, password, confirm password)
2. Frontend validates password length (≥6 chars) and matching
3. POST to `/api/auth/register`
4. Backend validates, hashes password, saves to MongoDB
5. Backend generates JWT token
6. Frontend stores token in localStorage
7. AuthContext updates user state
8. Redirect to `/dashboard`

#### Login Flow
1. User enters email and password
2. POST to `/api/auth/login`
3. Backend verifies credentials
4. Backend generates JWT token
5. Frontend stores token, updates AuthContext
6. Redirect to `/dashboard`

#### Protected Route Access
1. User visits `/dashboard`
2. PrivateRoute checks AuthContext for user
3. If no user: redirect to `/login`
4. If user exists: render dashboard content

#### Session Persistence
1. On app load, AuthProvider checks localStorage for token
2. If token exists: sets axios Authorization header
3. Calls `/api/auth/me` to fetch user data
4. If successful: updates AuthContext
5. If failed (expired/invalid): clears token, redirects to login

## File Structure

### Backend Files
```
/app/backend/
├── server.py           # Main FastAPI application
├── requirements.txt    # Python dependencies
└── .env                # Environment variables
```

### Frontend Files
```
/app/frontend/
├── src/
│   ├── components/     # React components
│   ├── context/        # Context providers
│   ├── App.js          # Main app component
│   ├── App.css         # App styles
│   └── index.css       # Global styles + Tailwind
├── public/             # Static assets
├── package.json        # Node dependencies
├── tailwind.config.js  # Tailwind configuration
└── .env                # Environment variables
```

## Environment Variables

### Backend (.env)
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET_KEY="your-secret-key-here"  # Auto-generated if not set
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL="https://your-domain.com"
```

## Scalability Considerations

### Current MVP
- Single MongoDB instance
- In-memory session (JWT)
- Basic error handling
- No rate limiting

### Production Recommendations

#### Infrastructure
1. **Load Balancing**: Deploy multiple FastAPI instances behind nginx/ALB
2. **Database**: MongoDB Atlas with replica sets for high availability
3. **CDN**: CloudFlare/CloudFront for static assets
4. **Caching**: Redis for token blacklisting and session data

#### Security Enhancements
1. **Rate Limiting**: Implement request throttling (10 login attempts/hour)
2. **Email Verification**: Send verification emails on registration
3. **Password Reset**: Implement forgot password flow
4. **2FA**: Add two-factor authentication option
5. **Audit Logs**: Track authentication events
6. **Token Refresh**: Implement refresh token rotation

#### Monitoring
1. **Logging**: Centralized logging (ELK stack, CloudWatch)
2. **Metrics**: Track login success rate, token expiration, API latency
3. **Alerts**: Failed login attempts, database connection issues
4. **Health Checks**: `/health` endpoint for load balancer

#### Features to Add
1. **User Roles**: Admin, Manager, Viewer permissions
2. **Project Management**: CRUD for solar energy projects
3. **Real-time Monitoring**: WebSocket for live energy data
4. **Analytics**: Energy production charts and reports
5. **Notifications**: Email/SMS alerts for system events

## Development Guidelines

### Code Style
- **Backend**: PEP 8 (Black formatter)
- **Frontend**: ESLint + Prettier
- **Naming**: snake_case (Python), camelCase (JavaScript)

### Testing Strategy
- **Backend**: pytest for API tests
- **Frontend**: Playwright for E2E tests
- **Coverage Target**: 80% minimum

### Git Workflow
1. Feature branches from `main`
2. PR reviews required
3. CI/CD pipeline runs tests
4. Deploy to staging → production

## Deployment

### Current Setup (Development)
- Supervisor manages processes
- Hot reload enabled for both frontend and backend
- Local MongoDB instance

### Production Deployment
1. **Backend**: Docker container on AWS ECS/EKS
2. **Frontend**: Static build on S3 + CloudFront
3. **Database**: MongoDB Atlas
4. **Environment**: Kubernetes with horizontal pod autoscaling

## Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Restart service
sudo supervisorctl restart backend
```

**Frontend build fails**
```bash
# Clear cache
rm -rf node_modules yarn.lock
yarn install
```

**Authentication fails**
- Verify REACT_APP_BACKEND_URL is correct
- Check browser console for CORS errors
- Inspect network tab for failed API calls
- Verify JWT secret matches between sessions

## Conclusion

EFFITECH authentication system provides a solid foundation for enterprise solar energy management. The architecture is designed for scalability, security, and maintainability, with clear separation between authentication logic, business logic, and presentation layers.

**Next Steps**:
1. Implement additional dashboard pages (Energy Monitoring, Analytics, Settings)
2. Add real-time data visualization for solar projects
3. Integrate external APIs for weather data and energy forecasts
4. Deploy to production with recommended security enhancements
