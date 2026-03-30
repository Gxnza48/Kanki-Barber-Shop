import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Service, InsertAppointment } from "@/lib/database.types";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_SERVICES = [
  { id: 1, name: "Corte de Pelo", description: "Corte clásico o moderno con terminación a navaja.", price: 8000, duration: 45 },
  { id: 2, name: "Corte + Barba", description: "Servicio completo de corte de cabello y perfilado de barba.", price: 12000, duration: 75 },
  { id: 3, name: "Perfilado de Barba", description: "Diseño y recorte de barba con toalla caliente.", price: 5000, duration: 30 },
  { id: 4, name: "Color", description: "Servicios de color y mechas.", price: 15000, duration: 90 },
];

// ==========================================
// TELEGRAM NOTIFICATIONS
// ==========================================
const sendTelegramNotification = async (appointment: any) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram Bot token or Chat ID not configured.");
    return;
  }

  const ids = chatId.split(',').map((id: string) => id.trim());

  try {
    const message = `<b>✅ ¡Hola! Tenés un nuevo turno.</b>

<b>👤 Cliente:</b> ${appointment.client_name}
<b>📱 WhatsApp:</b> ${appointment.client_whatsapp}
<b>📅 Fecha:</b> ${appointment.date}
<b>⏰ Hora:</b> ${appointment.time}hs

Cliquéa acá para administrarlo:
https://kanki.vercel.app/admin`;

    // Enviar a todos los IDs configurados
    await Promise.all(ids.map((id: string) => 
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: id,
          text: message,
          parse_mode: 'HTML'
        })
      })
    ));
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
};

// ==========================================
// SERVICES HOOKS
// ==========================================

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error al cargar servicios de Supabase:", error);
        throw new Error("Error al obtener los servicios: " + error.message);
      }
      return data as Service[];
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newService: { name: string; description: string; price: number; duration: number; image_url?: string }) => {
      const { data, error } = await (supabase as any)
        .from("services")
        .insert(newService)
        .select()
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Servicio Creado", description: "El servicio se agregó correctamente." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...update }: { id: number; name?: string; description?: string; price?: number; duration?: number; image_url?: string }) => {
      const { data, error } = await (supabase as any)
        .from("services")
        .update(update)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw new Error(`Error BD: ${error.message}`);
      if (!data) throw new Error("No se pudo encontrar el servicio. Verificá los permisos de Supabase.");

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Servicio Actualizado", description: "Los cambios se guardaron correctamente." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await (supabase as any)
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Servicio Eliminado", description: "El servicio se eliminó de la lista." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "No se pudo eliminar el servicio. Puede que tenga turnos asociados.", variant: "destructive" });
    }
  });
}

// ==========================================
// APPOINTMENT HOOKS
// ==========================================

export function useAvailability(date: string) {
  return useQuery({
    queryKey: ["availability", date],
    queryFn: async () => {
      if (!date) return [];

      const { data, error } = await (supabase as any)
        .from("appointments")
        .select("time")
        .eq("date", date)
        .neq("status", "cancelled");

      if (error) throw new Error("Error al obtener disponibilidad");
      return data?.map((a: any) => a.time) ?? [];
    },
    enabled: !!date,
  });
}

export function useCreateAppointment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertAppointment) => {
      // Verificar disponibilidad primero
      const { data: existing } = await (supabase as any)
        .from("appointments")
        .select("id")
        .eq("date", data.date)
        .eq("time", data.time)
        .neq("status", "cancelled")
        .maybeSingle();

      if (existing) {
        throw new Error("Este horario ya ha sido reservado");
      }

      const { data: newAppointment, error } = await (supabase as any)
        .from("appointments")
        .insert({
          client_name: data.client_name,
          client_whatsapp: data.client_whatsapp,
          service_id: data.service_id,
          date: data.date,
          time: data.time,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw new Error("Error al crear la reserva");
      
      // Esperar a que se envíe la notificación antes de terminar
      try {
        await sendTelegramNotification(newAppointment);
      } catch (err) {
        console.error("Error enviando notificación (no crítico):", err);
      }

      return newAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (error) => {
      toast({
        title: "Error en la reserva",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("appointments")
        .select("*")
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw new Error("Error al obtener los turnos");
      return data;
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "confirmed" | "cancelled" | "completed" }) => {
      const { data, error } = await (supabase as any)
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw new Error("Error al actualizar el estado");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Estado Actualizado", description: "El estado del turno se actualizó correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    }
  });
}
