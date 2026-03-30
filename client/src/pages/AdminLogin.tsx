import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Scissors } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, user } = useAuth();
  const [_, setLocation] = useLocation();

  if (user) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password }, {
      onSuccess: () => setLocation("/admin")
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Stripe texture only — no image */}
      <div className="absolute inset-0 z-0 stripe-decoration opacity-10 pointer-events-none" />

      {/* Glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 pulse-glow">
            <Scissors className="w-7 h-7 text-primary" />
          </div>
          <h1
            className="text-glow text-primary leading-none"
            style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2.5rem, 8vw, 3.5rem)' }}
          >
            KANKI BARBER
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-semibold opacity-60">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="kanki-card p-6 space-y-5 shadow-2xl">
          <div>
            <h2 className="text-xl font-display text-foreground">ACCESO STAFF</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ingresá tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Email / Usuario
              </Label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                placeholder="admin@gmail.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-muted/30 border-border/60 focus:border-primary/60 text-foreground placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-muted/30 border-border/60 focus:border-primary/60 text-foreground placeholder:text-muted-foreground/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !username || !password}
              className="btn-lime w-full h-12 text-base disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed mt-2"
            >
              {isLoggingIn ? (
                <><Loader2 className="inline w-4 h-4 animate-spin mr-2" /> ENTRANDO...</>
              ) : "INICIAR SESIÓN"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          Solo personal autorizado
        </p>
      </motion.div>
    </div>
  );
}
