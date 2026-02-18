import React, { useState } from 'react';
import { HelpCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner';

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Aquí conectarías con tu API de email (SendGrid, Resend, etc.)
    console.log('Enviando mensaje:', formData);
    
    toast.success('Mensaje enviado exitosamente. Te responderemos pronto.');
    
    // Limpiar formulario
    setFormData({ email: '', subject: '', message: '' });
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
            data-testid="help-button"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <HelpCircle className="h-6 w-6" />
            )}
          </button>
          
          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              ¿Alguna duda?
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de contacto */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
          <Card className="p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold">¿Necesitas ayuda?</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="help-email">Tu Correo</Label>
                <Input
                  id="help-email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="help-subject">Asunto</Label>
                <Input
                  id="help-subject"
                  type="text"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="help-message">Mensaje</Label>
                <textarea
                  id="help-message"
                  rows="4"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Describe tu consulta o solicitud..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Enviar Mensaje
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              También puedes escribirnos a: <span className="font-medium">soporte@effitech.com</span>
            </p>
          </Card>
        </div>
      )}
    </>
  );
};
