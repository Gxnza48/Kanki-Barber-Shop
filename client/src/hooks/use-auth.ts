import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type LoginInput = {
  username: string;
  password: string;
};

export function useAuth() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      // Si el usuario ya puso el mail completo, lo usamos. Si no, le agregamos el dominio por defecto.
      const email = credentials.username.includes("@")
        ? credentials.username
        : `${credentials.username}@barbershop.local`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });

      if (error) {
        console.error("Error Auth Supabase:", error);
        throw new Error(error.message);
      }
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast({ title: "Bienvenido", description: "Sesión iniciada correctamente." });
    },
    onError: (error) => {
      toast({ title: "Error de acceso", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error("Error al cerrar sesión");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
      setLocation("/admin/login");
      toast({ title: "Sesión cerrada", description: "Hasta pronto." });
    },
  });

  return {
    user: user ? { username: user.email?.split("@")[0] || "admin" } : null,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
}
