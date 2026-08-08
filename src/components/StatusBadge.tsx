import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusServico } from "@/lib/store";

const mapa: Record<StatusServico, { label: string; classe: string }> = {
  agendado: { label: "Agendado", classe: "bg-accent text-accent-foreground" },
  andamento: { label: "Em andamento", classe: "bg-warning text-warning-foreground" },
  concluido: { label: "Concluído", classe: "bg-success text-success-foreground" },
  cancelado: { label: "Cancelado", classe: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: StatusServico; className?: string }) {
  const s = mapa[status];
  return <Badge className={cn("rounded-full border-0", s.classe, className)}>{s.label}</Badge>;
}

export const corStatus: Record<StatusServico, string> = {
  agendado: "bg-accent",
  andamento: "bg-warning",
  concluido: "bg-success",
  cancelado: "bg-muted-foreground",
};
