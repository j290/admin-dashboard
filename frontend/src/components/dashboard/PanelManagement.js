import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Sun, 
  Plus, 
  Trash2, 
  Search,
  MapPin,
  Zap,
  UserPlus,
  UserMinus,
  Edit,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PanelManagement = () => {
  const [panels, setPanels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingPanel, setProcessingPanel] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [assigningPanel, setAssigningPanel] = useState(null);
  
  const [formData, setFormData] = useState({
    model: '',
    location: '',
    capacity: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [panelsRes, usersRes] = await Promise.all([
        axios.get(`${API}/panels`),
        axios.get(`${API}/users`)
      ]);
      setPanels(panelsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePanel = async (e) => {
    e.preventDefault();
    if (!formData.model || !formData.location || !formData.capacity) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      await axios.post(`${API}/panels`, {
        model: formData.model,
        location: formData.location,
        capacity: parseFloat(formData.capacity)
      });
      toast.success('Panel creado correctamente');
      setShowCreateForm(false);
      setFormData({ model: '', location: '', capacity: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear panel');
    }
  };

  const handleUpdatePanel = async (panelId) => {
    if (!editingPanel) return;
    
    setProcessingPanel(panelId);
    try {
      await axios.put(`${API}/panels/${panelId}`, {
        model: editingPanel.model,
        location: editingPanel.location,
        capacity: parseFloat(editingPanel.capacity),
        status: editingPanel.status
      });
      toast.success('Panel actualizado correctamente');
      setEditingPanel(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar panel');
    } finally {
      setProcessingPanel(null);
    }
  };

  const handleDeletePanel = async (panelId, panelModel) => {
    if (!window.confirm(`¿Está seguro de eliminar el panel "${panelModel}"?`)) {
      return;
    }
    
    setProcessingPanel(panelId);
    try {
      await axios.delete(`${API}/panels/${panelId}`);
      toast.success('Panel eliminado correctamente');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al eliminar panel');
    } finally {
      setProcessingPanel(null);
    }
  };

  const handleAssignPanel = async (panelId, userId) => {
    setProcessingPanel(panelId);
    try {
      await axios.post(`${API}/panels/${panelId}/assign/${userId}`);
      toast.success('Panel asignado correctamente');
      setAssigningPanel(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al asignar panel');
    } finally {
      setProcessingPanel(null);
    }
  };

  const handleUnassignPanel = async (panelId) => {
    setProcessingPanel(panelId);
    try {
      await axios.post(`${API}/panels/${panelId}/unassign`);
      toast.success('Panel desasignado correctamente');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al desasignar panel');
    } finally {
      setProcessingPanel(null);
    }
  };

  const filteredPanels = panels.filter(panel => 
    panel.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    panel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (panel.user_name && panel.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = panels.filter(p => p.status === 'activo').length;
  const assignedCount = panels.filter(p => p.user_id).length;
  const totalCapacity = panels.reduce((sum, p) => sum + p.capacity, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'mantenimiento': return 'Mantenimiento';
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="panel-management-page">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Gestión de Paneles Solares
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra y asigna paneles solares a los usuarios
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="gap-2"
            data-testid="create-panel-btn"
          >
            <Plus className="h-4 w-4" />
            Nuevo Panel
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sun className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paneles</p>
                <p className="text-2xl font-bold">{panels.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asignados</p>
                <p className="text-2xl font-bold">{assignedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacidad Total</p>
                <p className="text-2xl font-bold">{totalCapacity.toLocaleString()} kWh</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Modal de Crear Panel */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateForm(false)}>
            <Card className="w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold">Crear Nuevo Panel</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleCreatePanel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Modelo</label>
                  <Input
                    placeholder="Ej: Solar Pro 400W"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    data-testid="panel-model-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ubicación</label>
                  <Input
                    placeholder="Ej: Edificio A, Techo Norte"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    data-testid="panel-location-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Capacidad (kWh)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 3000"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    data-testid="panel-capacity-input"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" data-testid="submit-panel-btn">
                    Crear Panel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal de Asignar Panel */}
        {assigningPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAssigningPanel(null)}>
            <Card className="w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold">Asignar Panel a Usuario</h2>
                <Button variant="ghost" size="sm" onClick={() => setAssigningPanel(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Seleccione un usuario para asignar el panel "{assigningPanel.model}"
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssignPanel(assigningPanel.id, user.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                    data-testid={`assign-to-${user.id}`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Buscador */}
        <Card className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por modelo, ubicación o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="panel-search-input"
            />
          </div>
        </Card>

        {/* Tabla de Paneles */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando paneles...</p>
            </div>
          ) : filteredPanels.length === 0 ? (
            <div className="p-8 text-center">
              <Sun className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No se encontraron paneles' : 'No hay paneles registrados'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer panel
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="panels-table">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Modelo</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Ubicación</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Capacidad</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Asignado a</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPanels.map((panel) => (
                    <tr key={panel.id} className="hover:bg-muted/30 transition-colors" data-testid={`panel-row-${panel.id}`}>
                      <td className="px-6 py-4">
                        {editingPanel?.id === panel.id ? (
                          <Input
                            value={editingPanel.model}
                            onChange={(e) => setEditingPanel({ ...editingPanel, model: e.target.value })}
                            className="max-w-[200px]"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100">
                              <Sun className="h-5 w-5 text-yellow-600" />
                            </div>
                            <span className="font-medium">{panel.model}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingPanel?.id === panel.id ? (
                          <Input
                            value={editingPanel.location}
                            onChange={(e) => setEditingPanel({ ...editingPanel, location: e.target.value })}
                            className="max-w-[200px]"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {panel.location}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingPanel?.id === panel.id ? (
                          <Input
                            type="number"
                            value={editingPanel.capacity}
                            onChange={(e) => setEditingPanel({ ...editingPanel, capacity: e.target.value })}
                            className="max-w-[100px]"
                          />
                        ) : (
                          <span className="font-medium">{panel.capacity.toLocaleString()} kWh</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingPanel?.id === panel.id ? (
                          <select
                            value={editingPanel.status}
                            onChange={(e) => setEditingPanel({ ...editingPanel, status: e.target.value })}
                            className="border border-border rounded-md px-3 py-1.5 text-sm"
                          >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="mantenimiento">Mantenimiento</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(panel.status)}`}>
                            {getStatusLabel(panel.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {panel.user_name ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {panel.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{panel.user_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {editingPanel?.id === panel.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdatePanel(panel.id)}
                                disabled={processingPanel === panel.id}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPanel(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPanel({ ...panel })}
                                data-testid={`edit-panel-${panel.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {panel.user_id ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnassignPanel(panel.id)}
                                  disabled={processingPanel === panel.id}
                                  data-testid={`unassign-panel-${panel.id}`}
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAssigningPanel(panel)}
                                  disabled={processingPanel === panel.id}
                                  data-testid={`assign-panel-${panel.id}`}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeletePanel(panel.id, panel.model)}
                                disabled={processingPanel === panel.id}
                                data-testid={`delete-panel-${panel.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
