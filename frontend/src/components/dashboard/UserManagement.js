import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Users, 
  Shield, 
  User, 
  Trash2, 
  Search,
  Crown,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUser, setProcessingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setProcessingUser(userId);
    try {
      await axios.put(`${API}/users/${userId}/role`, { role: newRole });
      toast.success(`Rol actualizado a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar rol');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setProcessingUser(userId);
    try {
      await axios.delete(`${API}/users/${userId}`);
      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al eliminar usuario');
    } finally {
      setProcessingUser(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="user-management-page">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra los usuarios y sus permisos en el sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">{adminCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Regulares</p>
                <p className="text-2xl font-bold">{userCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Buscador */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="user-search-input"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>El primer usuario registrado es automáticamente administrador</span>
            </div>
          </div>
        </Card>

        {/* Tabla de Usuarios */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="users-table">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Correo</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Rol</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Fecha Registro</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors" data-testid={`user-row-${user.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.role === 'admin' ? (
                              <Shield className="h-5 w-5 text-primary" />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                            disabled={processingUser === user.id}
                            data-testid={`toggle-role-${user.id}`}
                          >
                            {processingUser === user.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            ) : user.role === 'admin' ? (
                              <>
                                <User className="h-4 w-4 mr-1" />
                                Hacer Usuario
                              </>
                            ) : (
                              <>
                                <Crown className="h-4 w-4 mr-1" />
                                Hacer Admin
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            disabled={processingUser === user.id}
                            data-testid={`delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
