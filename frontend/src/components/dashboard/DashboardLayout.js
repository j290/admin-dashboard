import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { HelpButton } from '../HelpButton';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Leaf,
  User,
  Users,
  Sun,
  Shield
} from 'lucide-react';

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Monitoreo de Energía', href: '/dashboard/energy', icon: Zap },
  { name: 'Análisis', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Gestión de Paneles', href: '/dashboard/panels', icon: Sun },
  { name: 'Gestión de Usuarios', href: '/dashboard/users', icon: Users },
];

export const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItem = (item, isMobile = false) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-secondary text-primary'
            : 'text-gray-700 hover:bg-secondary/50 hover:text-primary'
        }`}
        data-testid={`nav-${item.name.toLowerCase().replace(/ /g, '-')}`}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Escritorio */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-border bg-white overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-primary tracking-tight">EFFITECH</span>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => renderNavItem(item))}
            
            {/* Sección Admin */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    Administración
                  </div>
                </div>
                {adminNavigation.map((item) => renderNavItem(item))}
              </>
            )}
          </nav>

          {/* Perfil de Usuario */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isAdmin ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.full_name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {isAdmin && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Header Móvil */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-white/95 backdrop-blur px-4">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-heading font-bold text-primary">EFFITECH</span>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex items-center gap-3 py-5">
                  <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-heading font-bold text-primary">EFFITECH</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        {renderNavItem(item, true)}
                      </li>
                    ))}
                    
                    {/* Sección Admin Móvil */}
                    {isAdmin && (
                      <>
                        <li className="pt-4 pb-2">
                          <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Shield className="h-3 w-3" />
                            Administración
                          </div>
                        </li>
                        {adminNavigation.map((item) => (
                          <li key={item.name}>
                            {renderNavItem(item, true)}
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </nav>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Botón de Ayuda Flotante */}
      <HelpButton />
    </div>
  );
};