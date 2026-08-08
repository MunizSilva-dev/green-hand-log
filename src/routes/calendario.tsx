import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, corStatus } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { minutosParaTexto, salvarServico, useEstado, type Servico } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário | THE GARDEN" },
      { name: "description", content: "Agenda de roçadas e jardinagem por dia, semana ou mês com cores por status." },
      { property: "og:title", content: "Calendário | THE GARDEN" },
      { property: "og:description", content: "Visualize e organize seus agendamentos por dia, semana e mês." },
    ],
  }),
  component: Calendario,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);
const somaDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function Calendario() {
  const { servicos, clientes } = useEstado();
  const navigate = useNavigate();
  const [modo, setModo] = useState<"dia" | "semana" | "mes">("mes");
  const [ref, setRef] = useState(new Date());
  const [arrastando, setArrastando] = useState<string | null>(null);

  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? "Cliente";
  const doDia = (data: string) =>
    servicos.filter((s) => s.data === data).sort((a, b) => a.hora.localeCompare(b.hora));

  function mover(id: string, data: string) {
    salvarServico({ id, data });
    toast.success(`Agendamento movido para ${new Date(`${data}T00:00`).toLocaleDateString("pt-BR")}`);
  }

  const passo = modo === "dia" ? 1 : modo === "semana" ? 7 : 0;
  const avancar = (dir: number) =>
    setRef((d) => (passo ? somaDias(d, passo * dir) : new Date(d.getFullYear(), d.getMonth() + dir, 1)));

  const inicioSemana = somaDias(ref, -((ref.getDay() + 6) % 7));
  const diasSemana = Array.from({ length: 7 }, (_, i) => somaDias(inicioSemana, i));

  const primeiroMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const offset = (primeiroMes.getDay() + 6) % 7;
  const diasMes = Array.from({ length: 42 }, (_, i) => somaDias(primeiroMes, i - offset));

  function ItemServico({ s }: { s: Servico }) {
    return (
      <Card
        draggable
        onDragStart={() => setArrastando(s.id)}
        onDragEnd={() => setArrastando(null)}
        onClick={() => navigate({ to: "/servicos/$id/editar", params: { id: s.id } })}
        className="cursor-pointer flex-row items-center justify-between gap-2 p-3 shadow-card"
      >
        <div>
          <p className="text-sm font-medium">{nome(s.clienteId)}</p>
          <p className="text-xs text-muted-foreground">
            {s.hora} · {s.tipo} · {minutosParaTexto(s.tempoEstimado)}
          </p>
        </div>
        <StatusBadge status={s.status} />
      </Card>
    );
  }

  return (
    <AppShell
      titulo="Calendário"
      acao={
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link to="/servicos/novo">
            <Plus className="size-4" /> Novo
          </Link>
        </Button>
      }
    >
      <Tabs value={modo} onValueChange={(v) => setModo(v as typeof modo)}>
        <TabsList className="w-full">
          <TabsTrigger value="dia" className="flex-1">Dia</TabsTrigger>
          <TabsTrigger value="semana" className="flex-1">Semana</TabsTrigger>
          <TabsTrigger value="mes" className="flex-1">Mês</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="my-3 flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={() => avancar(-1)} aria-label="Anterior">
          <ChevronLeft className="size-5" />
        </Button>
        <p className="text-sm font-semibold capitalize">
          {modo === "dia"
            ? ref.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
            : modo === "semana"
              ? `${diasSemana[0]!.toLocaleDateString("pt-BR")} – ${diasSemana[6]!.toLocaleDateString("pt-BR")}`
              : ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <Button size="icon" variant="ghost" onClick={() => avancar(1)} aria-label="Próximo">
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {modo === "dia" && (
        <div className="space-y-2">
          {doDia(iso(ref)).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Nenhum agendamento neste dia.
            </p>
          ) : (
            doDia(iso(ref)).map((s) => <ItemServico key={s.id} s={s} />)
          )}
        </div>
      )}

      {modo === "semana" && (
        <div className="space-y-3">
          {diasSemana.map((d) => (
            <div
              key={iso(d)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => arrastando && mover(arrastando, iso(d))}
              className="rounded-2xl border border-border p-2"
            >
              <p className="mb-2 text-xs font-semibold capitalize text-muted-foreground">
                {d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
              </p>
              <div className="space-y-2">
                {doDia(iso(d)).map((s) => (
                  <ItemServico key={s.id} s={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modo === "mes" && (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {diasMes.map((d) => {
              const lista = doDia(iso(d));
              const foraMes = d.getMonth() !== ref.getMonth();
              return (
                <button
                  key={iso(d)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => arrastando && mover(arrastando, iso(d))}
                  onClick={() => {
                    setRef(d);
                    setModo("dia");
                  }}
                  className={cn(
                    "aspect-square rounded-xl border border-border p-1 text-xs",
                    foraMes && "opacity-40",
                    iso(d) === iso(new Date()) && "border-primary bg-accent/25",
                  )}
                >
                  <span>{d.getDate()}</span>
                  <span className="mt-1 flex flex-wrap justify-center gap-0.5">
                    {lista.slice(0, 3).map((s) => (
                      <span key={s.id} className={cn("size-1.5 rounded-full", corStatus[s.status])} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Arraste um agendamento (dia/semana) para outra data para reagendar.
          </p>
        </>
      )}
    </AppShell>
  );
}
