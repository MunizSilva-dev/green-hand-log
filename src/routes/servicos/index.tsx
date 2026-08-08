import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { minutosParaTexto, salvarServico, useEstado, type StatusServico } from "@/lib/store";

export const Route = createFileRoute("/servicos/")({
  head: () => ({
    meta: [
      { title: "Serviços | THE GARDEN" },
      { name: "description", content: "Acompanhe serviços agendados, em andamento, concluídos e cancelados de roçada e jardinagem." },
      { property: "og:title", content: "Serviços | THE GARDEN" },
      { property: "og:description", content: "Controle completo dos serviços realizados e agendados." },
    ],
  }),
  component: Servicos,
});

const filtros: { valor: StatusServico | "todos"; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "agendado", label: "Agendados" },
  { valor: "andamento", label: "Andamento" },
  { valor: "concluido", label: "Concluídos" },
  { valor: "cancelado", label: "Cancelados" },
];

function Servicos() {
  const { servicos, clientes } = useEstado();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<StatusServico | "todos">("todos");
  const [busca, setBusca] = useState("");

  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? "Cliente";
  const q = busca.toLowerCase();
  const lista = servicos
    .filter((s) => (filtro === "todos" ? true : s.status === filtro))
    .filter((s) => [nome(s.clienteId), s.tipo, s.endereco, s.data].join(" ").toLowerCase().includes(q))
    .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));

  return (
    <AppShell
      titulo="Serviços"
      acao={
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link to="/servicos/novo">
            <Plus className="size-4" /> Novo
          </Link>
        </Button>
      }
    >
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por cliente, endereço ou data"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
        <TabsList className="w-full">
          {filtros.map((f) => (
            <TabsTrigger key={f.valor} value={f.valor} className="flex-1 text-[11px]">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ul className="mt-4 space-y-2">
        {lista.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum serviço nesta categoria.
          </p>
        )}
        {lista.map((s) => (
          <li key={s.id}>
            <Card className="gap-2 p-3 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{nome(s.clienteId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(`${s.data}T00:00`).toLocaleDateString("pt-BR")} · {s.hora} · {s.tipo} ·{" "}
                    {minutosParaTexto(s.tempoEstimado)}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate({ to: "/servicos/$id/editar", params: { id: s.id } })}
                >
                  Editar
                </Button>
                {s.status === "agendado" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      salvarServico({ id: s.id, status: "andamento", inicioReal: new Date().toISOString() });
                      toast.success("Serviço iniciado");
                    }}
                  >
                    <Play className="size-4" /> Iniciar
                  </Button>
                )}
                {s.status !== "concluido" && s.status !== "cancelado" && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => navigate({ to: "/servicos/$id/concluir", params: { id: s.id } })}
                  >
                    Concluir
                  </Button>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
