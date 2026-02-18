import React, { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Bell, Shield, Save } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notifications, setNotifications] = useState({
    email_alerts: true,
    performance_reports: true,
    system_updates: false,
    maintenance_alerts: true
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    toast.success('Perfil actualizado exitosamente');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.new_password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    toast.success('Contraseña cambiada exitosamente');
    setFormData({
      ...formData,
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
    toast.success('Preferencias actualizadas');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="settings-page">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Configuración
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra la configuración de tu cuenta y preferencias
          </p>
        </div>

        {/* Configuración de Perfil */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">Información del Perfil</h2>
              <p className="text-sm text-muted-foreground">Actualiza tus datos personales</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Juan Pérez"
                  data-testid="fullname-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@empresa.com"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="gap-2" data-testid="save-profile-button">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>

        {/* Configuración de Seguridad */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">Seguridad</h2>
              <p className="text-sm text-muted-foreground">Cambia tu contraseña</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="current_password">Contraseña Actual</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  placeholder="Ingresa contraseña actual"
                  data-testid="current-password-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nueva Contraseña</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  data-testid="new-password-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Reingresa nueva contraseña"
                  data-testid="confirm-password-input"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="gap-2" data-testid="change-password-button">
                <Shield className="h-4 w-4" />
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </Card>

        {/* Preferencias de Notificaciones */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">Notificaciones</h2>
              <p className="text-sm text-muted-foreground">Administra tus preferencias de notificación</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Alertas por Correo</p>
                <p className="text-sm text-muted-foreground">Recibe alertas sobre el estado del sistema</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('email_alerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email_alerts ? 'bg-primary' : 'bg-muted'
                }`}
                data-testid="email-alerts-toggle"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email_alerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Reportes de Rendimiento</p>
                <p className="text-sm text-muted-foreground">Resúmenes semanales de rendimiento energético</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('performance_reports')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.performance_reports ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.performance_reports ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Actualizaciones del Sistema</p>
                <p className="text-sm text-muted-foreground">Notificaciones sobre actualizaciones de la plataforma</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('system_updates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.system_updates ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.system_updates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-foreground">Alertas de Mantenimiento</p>
                <p className="text-sm text-muted-foreground">Notificaciones de mantenimiento programado</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('maintenance_alerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.maintenance_alerts ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.maintenance_alerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Información de la Cuenta */}
        <Card className="p-6 bg-muted/30">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Información de la Cuenta</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              ID de Cuenta: <span className="font-mono text-foreground">{user?.id}</span>
            </p>
            <p className="text-muted-foreground">
              Miembro desde: <span className="text-foreground">{new Date(user?.created_at).toLocaleDateString('es-ES')}</span>
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};