import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { LogIn, Leaf } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Panel Izquierdo - Imagen de Marca */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1639135723583-5c84eb8b6198?crop=entropy&cs=srgb&fm=jpg&q=85)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight">EFFITECH</span>
          </div>
          
          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-heading font-bold leading-tight">
              Impulsando el Futuro con Energía Limpia
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Monitorea, gestiona y optimiza tus proyectos de energía solar con precisión y transparencia.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <div className="h-px flex-1 bg-white/20"></div>
            <span>Confiado por Empresas Líderes</span>
            <div className="h-px flex-1 bg-white/20"></div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Inicio de Sesión */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Móvil */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-primary tracking-tight">EFFITECH</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Bienvenido de Nuevo
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión para acceder a tu panel administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                  data-testid="email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-11"
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading}
              data-testid="login-submit-button"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ¿Nuevo en EFFITECH?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link to="/register">
              <Button variant="outline" className="w-full h-11" data-testid="register-link">
                Crear una Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};