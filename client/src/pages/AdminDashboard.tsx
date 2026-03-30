import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment, Service } from "@/lib/database.types";
import {
  useAppointments,
  useUpdateAppointmentStatus,
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService
} from "@/hooks/use-barber";
import { useLocation } from "wouter";
import {
  Loader2, LogOut, Check, X, Calendar, DollarSign, Users,
  Search, Scissors, Plus, Pencil, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const { user, logout, isLoading: isLoadingAuth } = useAuth();
  const [_, setLocation] = useLocation();
  const { data: appointments, isLoading: isLoadingAppts } = useAppointments();
  const { data: services, isLoading: isLoadingServices } = useServices();
  const updateStatus = useUpdateAppointmentStatus();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price: 0, duration: 30 });

  if (isLoadingAuth) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!user) { setLocation("/admin/login"); return null; }

  const getServicePrice = (serviceId: number) => services?.find(s => s.id === serviceId)?.price || 0;
  const getServiceName = (serviceId: number) => services?.find(s => s.id === serviceId)?.name || "Desconocido";

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setServiceForm({ name: "", description: "", price: 0, duration: 30 });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditModal = (service: any) => {
    setEditingService(service);
    setServiceForm({ name: service.name, description: service.description || "", price: service.price, duration: service.duration });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService.id, ...serviceForm });
      } else {
        await createService.mutateAsync(serviceForm);
      }
      setIsServiceModalOpen(false);
    } catch (e) {}
  };

  const filteredAppointments = appointments?.filter((appt: Appointment) =>
    appt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.date.includes(searchTerm)
  ).sort((a: Appointment, b: Appointment) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

  const totalAppointments = appointments?.length || 0;
  const todaysAppointments = appointments?.filter((a: Appointment) => isToday(new Date(a.date + 'T12:00:00'))).length || 0;
  const totalRevenue = appointments?.filter((a: Appointment) => a.status === 'completed').reduce((acc: number, curr: Appointment) => acc + getServicePrice(curr.service_id), 0) || 0;

  const getWhatsAppLink = (appt: any) => {
    const phone = appt.client_whatsapp.replace(/\D/g, '');
    let message = "";
    if (appt.status === 'confirmed') {
      message = `Hola ${appt.client_name}, ¡tu turno para ${getServiceName(appt.service_id)} fue confirmado! Te esperamos el ${format(new Date(appt.date + 'T12:00:00'), 'd/MM')} a las ${appt.time} hs.`;
    } else if (appt.status === 'cancelled') {
      message = `Hola ${appt.client_name}, tu pedido fue rechazado, mil perdones. Si querés podemos coordinar para otra fecha.`;
    } else {
      message = `Hola ${appt.client_name}, te escribo por tu turno para ${getServiceName(appt.service_id)}.`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      confirmed: "bg-green-500/15 text-green-600 border-green-500/30",
      completed: "bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(179,132,68,0.2)]",
      cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    };
    const labels: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmado", completed: "Pagado", cancelled: "Cancelado" };
    return (
      <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", map[status] || "bg-muted text-muted-foreground border-border")}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            <span className="text-xl font-display">
              KANKI <span className="text-primary">ADMIN</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-muted-foreground hover:text-foreground hover:bg-card gap-1.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Stat 1 */}
          <div className="kanki-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Totales</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-display text-foreground">{totalAppointments}</div>
          </div>

          {/* Stat 2 */}
          <div className="kanki-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Hoy</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-display text-foreground">{todaysAppointments}</div>
          </div>

          {/* Stat 3 */}
          <div className="kanki-card border-t-2 border-t-primary p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Ingresos</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xl md:text-3xl font-display text-primary text-glow">
              ${totalRevenue.toLocaleString("es-AR")}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <Tabs defaultValue="appointments" onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card border border-border/60 p-1 h-auto gap-1 w-full max-w-xs">
            <TabsTrigger
              value="appointments"
              className="flex-1 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Turnos
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="flex-1 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Servicios
            </TabsTrigger>
          </TabsList>

          {/* ── APPOINTMENTS TAB ── */}
          <TabsContent value="appointments" className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-card border-border/60 focus:border-primary/50"
              />
            </div>

            {isLoadingAppts ? (
              <div className="kanki-card flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground text-sm">Cargando turnos...</span>
              </div>
            ) : !filteredAppointments?.length ? (
              <div className="kanki-card py-14 text-center text-muted-foreground text-sm">
                No se encontraron turnos.
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="kanki-card hidden md:block overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/20">
                          <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente</th>
                          <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Servicio</th>
                          <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha / Hora</th>
                          <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                          <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments?.map((appt) => (
                          <tr key={appt.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">{appt.client_name}</div>
                              <a
                                href={getWhatsAppLink(appt)}
                                target="_blank"
                                rel="noopener noreferrer"
                                  className={cn(
                                    "text-xs inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full font-medium transition-colors",
                                    (appt.status === 'confirmed' || appt.status === 'completed') ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" :
                                    appt.status === 'cancelled' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" :
                                    "bg-muted/50 text-muted-foreground hover:bg-muted"
                                  )}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {appt.client_whatsapp}
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium bg-muted/50 border border-border/40 rounded-lg px-2 py-1 text-foreground">
                                {getServiceName(appt.service_id)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{format(new Date(appt.date + 'T12:00:00'), 'd MMM, yyyy', { locale: es })}</div>
                              <div className="text-xs text-muted-foreground">{appt.time} hs</div>
                            </td>
                            <td className="px-4 py-3">{statusBadge(appt.status)}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {appt.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus.mutate({ id: appt.id, status: 'confirmed' })}
                                      disabled={updateStatus.isPending}
                                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Confirmar
                                    </button>
                                    <button
                                      onClick={() => updateStatus.mutate({ id: appt.id, status: 'cancelled' })}
                                      disabled={updateStatus.isPending}
                                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    >
                                      <X className="w-3.5 h-3.5" /> Rechazar
                                    </button>
                                  </>
                                  )}
                                  {appt.status === 'confirmed' && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => updateStatus.mutate({ id: appt.id, status: 'completed' })}
                                        disabled={updateStatus.isPending}
                                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-md active:scale-95"
                                      >
                                        <DollarSign className="w-3.5 h-3.5" /> PAGO CONFIRMADO
                                      </button>
                                      <button
                                        onClick={() => updateStatus.mutate({ id: appt.id, status: 'cancelled' })}
                                        disabled={updateStatus.isPending}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredAppointments?.map((appt: Appointment) => (
                    <div key={appt.id} className="kanki-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground">{appt.client_name}</p>
                          <a
                            href={getWhatsAppLink(appt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "text-xs inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full font-medium transition-colors",
                              (appt.status === 'confirmed' || appt.status === 'completed') ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" :
                              appt.status === 'cancelled' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" :
                              "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {appt.client_whatsapp}
                          </a>
                        </div>
                        {statusBadge(appt.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3" />
                          {getServiceName(appt.service_id)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(appt.date + 'T12:00:00'), 'd/MM')} · {appt.time} hs
                        </span>
                      </div>

                      {appt.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: 'confirmed' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50 active:scale-95"
                          >
                            <Check className="w-4 h-4" /> Confirmar
                          </button>
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: 'cancelled' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50 active:scale-95"
                          >
                            <X className="w-4 h-4" /> Rechazar
                          </button>
                        </div>
                      )}
                      {appt.status === 'confirmed' && (
                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: 'completed' })}
                            disabled={updateStatus.isPending}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all shadow-lg active:scale-95"
                          >
                            <DollarSign className="w-4 h-4" /> PAGO CONFIRMADO
                          </button>
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: 'cancelled' })}
                            disabled={updateStatus.isPending}
                            className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50 active:scale-95"
                          >
                            Cancelar turno
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ── SERVICES TAB ── */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display">CATÁLOGO DE SERVICIOS</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Gestioná los servicios disponibles para reservar.</p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="btn-lime flex items-center gap-1.5 text-xs px-4 py-2.5 h-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Servicio</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>

            {isLoadingServices ? (
              <div className="kanki-card flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground text-sm">Cargando servicios...</span>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="kanki-card hidden md:block overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/20">
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Servicio</th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Precio</th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Duración</th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services?.map((service) => (
                        <tr key={service.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{service.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                              {service.description || "Sin descripción"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-primary font-bold">$ {service.price.toLocaleString("es-AR")}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{service.duration} min</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(service)}
                                className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { if (confirm(`¿Eliminar "${service.name}"?`)) deleteService.mutate(service.id); }}
                                className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {services?.map((service) => (
                    <div key={service.id} className="kanki-card p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-bold text-foreground">{service.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description || "Sin descripción"}</p>
                        </div>
                        <span className="text-primary font-bold text-sm shrink-0">$ {service.price.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{service.duration} min</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(service)}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Editar
                          </button>
                          <button
                            onClick={() => { if (confirm(`¿Eliminar "${service.name}"?`)) deleteService.mutate(service.id); }}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Borrar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ── CREATE/EDIT SERVICE DIALOG ── */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="bg-card border-border/60 text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingService ? "EDITAR SERVICIO" : "NUEVO SERVICIO"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Completá los detalles. Los cambios se reflejan en la web automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nombre</Label>
              <Input
                id="svc-name"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Ej: Corte Degradé"
                className="bg-background border-border/60 focus:border-primary/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-desc" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Descripción</Label>
              <Textarea
                id="svc-desc"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Breve descripción del servicio..."
                className="bg-background border-border/60 focus:border-primary/60 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="svc-price" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Precio ($)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                  className="bg-background border-border/60 focus:border-primary/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-dur" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duración (min)</Label>
                <Input
                  id="svc-dur"
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })}
                  className="bg-background border-border/60 focus:border-primary/60"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsServiceModalOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <button
              onClick={handleSaveService}
              disabled={createService.isPending || updateService.isPending}
              className="btn-lime px-6 py-2.5 text-sm disabled:opacity-50 disabled:shadow-none"
            >
              {createService.isPending || updateService.isPending
                ? "Guardando..."
                : editingService ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
