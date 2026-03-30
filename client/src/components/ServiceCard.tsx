import { cn } from "@/lib/utils";
import type { Service } from "@/lib/database.types";
import { Check, Clock } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <div
      onClick={() => onSelect(service)}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/8 shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
          : "border-border/60 bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      {/* Accent top bar */}
      <div className={cn(
        "h-[3px] w-full bg-primary transition-all duration-300",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
      )} />

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className={cn(
            "text-xl font-display leading-none transition-colors",
            selected ? "text-primary" : "text-foreground group-hover:text-primary"
          )}>
            {service.name}
          </h3>
          {selected && (
            <div className="shrink-0 ml-2 bg-primary text-primary-foreground rounded-full p-1 animate-in fade-in zoom-in duration-200">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed mb-5 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock className="w-3 h-3" />
            {service.duration} min
          </span>
          <span className={cn(
            "text-lg font-bold transition-colors",
            selected ? "text-primary text-glow" : "text-foreground group-hover:text-primary"
          )}>
            $ {service.price.toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-[2px] w-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)] transition-transform duration-300 origin-left",
        selected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      )} />
    </div>
  );
}
