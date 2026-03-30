import { useState } from "react";
import { useServices, useCreateAppointment } from "@/hooks/use-barber";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Scissors, Calendar as CalIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const STEPS = ["Servicio", "Fecha", "Hora", "Detalles", "Confirmar"];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState({ name: "", whatsapp: "+54 9 341 " });
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: services, isLoading: isLoadingServices } = useServices();
  const createAppointment = useCreateAppointment();

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    try {
      await createAppointment.mutateAsync({
        service_id: selectedService.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        client_name: clientDetails.name,
        client_whatsapp: clientDetails.whatsapp,
      });
      setIsSuccess(true);
    } catch (error) { }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen kanki-hero-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6 animate-slide-up"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/20 pulse-glow" />
            <div className="relative w-24 h-24 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-display text-glow text-primary mb-2">¡TURNO CONFIRMADO!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Gracias, <span className="text-foreground font-semibold">{clientDetails.name}</span>. Tu turno para{" "}
              <span className="text-primary">{selectedService?.name}</span> está agendado para el{" "}
              {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })} a las {selectedTime} hs.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-lime w-full h-13 text-base font-bold"
          >
            RESERVAR OTRO TURNO
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <header className="relative overflow-hidden min-h-[56vw] max-h-[420px] flex items-end">
        {/* Stripe decoration only — no image */}
        <div className="absolute inset-0 z-10 stripe-decoration opacity-40 pointer-events-none" />

        {/* Bottom fade into main bg */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-20 w-full container mx-auto px-4 pb-10 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Branding & Logo */}
            <div className="flex items-center justify-center gap-3 mb-4 mx-auto w-fit">
              <img src="/barber-pole.png" alt="Barber Pole Icon" className="w-10 h-10 object-contain drop-shadow-md" />
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase">
                Rosario Fisherton
              </span>
            </div>

            <h1
              className="leading-none mb-3"
              style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(3rem, 11vw, 6rem)' }}
            >
              <span className="text-foreground">KANKI </span>
              <span className="text-primary text-glow">BARBER</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
              Elegi tu servicio y reserva tu turno.
            </p>
          </motion.div>
        </div>

        {/* Staff link - moved lower for better PC UX */}
        <div className="absolute top-12 right-6 z-30 opacity-20 hover:opacity-80 transition-opacity">
          <Link href="/admin/login" className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Staff</Link>
        </div>
      </header>

      {/* ── BOOKING WIZARD ── */}
      <main className="container mx-auto px-4 -mt-4 relative z-30 pb-24">
        <div className="kanki-card overflow-hidden">

          {/* Progress Bar */}
          <div className="h-1 w-full bg-muted">
            <motion.div
              className="h-full bg-primary shadow-[0_0_8px_rgba(179,132,68,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>

          <div className="p-5 md:p-10">

            {/* Step Header */}
            <div className="flex items-center justify-between mb-7 gap-3">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">
                  Paso {currentStep + 1} de 5
                </p>
                <h2 className="text-[clamp(1.6rem,5vw,2.5rem)] font-display leading-none">
                  {currentStep === 0 && "ELEGÍ UN SERVICIO"}
                  {currentStep === 1 && "ELEGÍ UNA FECHA"}
                  {currentStep === 2 && "ELEGÍ UN HORARIO"}
                  {currentStep === 3 && "TUS DATOS"}
                  {currentStep === 4 && "CONFIRMAR RESERVA"}
                </h2>
              </div>

              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="shrink-0 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver
                </Button>
              )}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="min-h-[320px]"
              >

                {/* STEP 1: Services */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoadingServices ? (
                      <div className="col-span-full flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : services?.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        selected={selectedService?.id === service.id}
                        onSelect={(s) => { setSelectedService(s); handleNext(); }}
                      />
                    ))}
                  </div>
                )}

                {/* STEP 2: Date */}
                {currentStep === 1 && (
                  <div className="flex justify-center py-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => { setSelectedDate(date); if (date) handleNext(); }}
                      locale={es}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="rounded-xl border border-border/60 bg-card p-4 text-foreground"
                    />
                  </div>
                )}

                {/* STEP 3: Time */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots
                      .filter(time => {
                        if (!selectedDate || !isSameDay(selectedDate, new Date())) return true;
                        const [hours, minutes] = time.split(":").map(Number);
                        const slotTime = new Date();
                        slotTime.setHours(hours, minutes, 0, 0);
                        return slotTime > new Date();
                      })
                      .map((time) => (
                        <button
                          key={time}
                          onClick={() => { setSelectedTime(time); handleNext(); }}
                          className={cn(
                            "py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 active:scale-95",
                            selectedTime === time
                              ? "border-primary bg-primary text-black shadow-[0_0_12px_hsl(80_100%_44%/0.4)]"
                              : "border-border/60 bg-card text-muted-foreground hover:border-primary/60 hover:text-primary"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                  </div>
                )}

                {/* STEP 4: Details */}
                {currentStep === 3 && (
                  <div className="max-w-md mx-auto space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        Nombre Completo
                      </Label>
                      <Input
                        id="name"
                        placeholder="Juan García"
                        value={clientDetails.name}
                        onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                        className="h-12 bg-card border-border/60 focus:border-primary/60 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        WhatsApp
                      </Label>
                      <Input
                        id="whatsapp"
                        placeholder="+54 9 341 XXX XXXX"
                        type="tel"
                        value={clientDetails.whatsapp}
                        onChange={(e) => {
                          let val = e.target.value;
                          const prefix = "+54 9 341 ";
                          // Extraemos solo los num
                          let rawNums = val.replace(/[^0-9]/g, '');
                          // Sacamos el prefijo si está
                          if (rawNums.startsWith("549341")) {
                            rawNums = rawNums.slice(6);
                          }
                          // Solo 7 dígitos máximo después del código de área
                          rawNums = rawNums.slice(0, 7);

                          // Formateo XXX XXXX
                          let formatted = rawNums;
                          if (rawNums.length > 3) {
                            formatted = rawNums.slice(0, 3) + " " + rawNums.slice(3);
                          }

                          setClientDetails({ ...clientDetails, whatsapp: prefix + formatted });
                        }}
                        className="h-12 bg-card border-border/60 focus:border-primary/60 text-base"
                      />
                      <p className="text-xs text-muted-foreground">Te enviaremos la confirmación por acá.</p>
                    </div>

                    <button
                      className="btn-lime w-full h-13 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                      onClick={handleNext}
                      disabled={!clientDetails.name || clientDetails.whatsapp.replace(/[^0-9]/g, '').length < 13}
                    >
                      REVISAR TURNO <ChevronRight className="inline w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}

                {/* STEP 5: Confirmation */}
                {currentStep === 4 && (
                  <div className="max-w-lg mx-auto space-y-5">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
                      {/* Service */}
                      <div className="p-5 flex items-start gap-4 border-b border-primary/10">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Scissors className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Servicio</p>
                          <p className="text-xl font-display">{selectedService?.name}</p>
                          <p className="text-primary font-bold text-sm mt-0.5">$ {selectedService?.price.toLocaleString("es-AR")}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="p-5 grid grid-cols-2 gap-4 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                          <CalIcon className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Fecha</p>
                            <p className="font-semibold text-sm">{selectedDate && format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Hora</p>
                            <p className="font-semibold text-sm">{selectedTime} hs</p>
                          </div>
                        </div>
                      </div>

                      {/* Client */}
                      <div className="p-5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Cliente</p>
                        <p className="font-bold text-base">{clientDetails.name}</p>
                        <p className="text-green-600 font-semibold text-sm">{clientDetails.whatsapp}</p>
                      </div>
                    </div>

                    <button
                      className="btn-lime w-full h-14 text-lg disabled:opacity-50 disabled:shadow-none"
                      onClick={handleBook}
                      disabled={createAppointment.isPending}
                    >
                      {createAppointment.isPending ? (
                        <><Loader2 className="inline mr-2 h-5 w-5 animate-spin" /> CONFIRMANDO...</>
                      ) : "CONFIRMAR TURNO"}
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="container mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-muted-foreground/50">
          © 2026 <span className="text-primary/60">Kanki Barber</span> · Todos los derechos reservados desarrollado por <span className="text-primary/60">Gonza Bonadeo</span>
        </p>
      </footer>

    </div>
  );
}
