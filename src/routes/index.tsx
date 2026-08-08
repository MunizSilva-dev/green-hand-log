import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Clock, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { hoje, minutosParaTexto, useEstado } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE GARDEN | Gestão de jardinagem e roçada" },
      {
        name: "description",
        content:
          "Painel do THE GARDEN: serviços do dia, clientes agendados, tempo estimado e atalhos para novo agendamento.",
      },
      { property: "og:title", content: "THE GARDEN | Gestão de jardinagem e roçada" },
      {
        property: "og:description",
        content: "Controle clientes, agenda, serviços, materiais e ferramentas direto do celular.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { usuario, clientes, servicos } = useEstado();
  const dia = hoje();
  const doDia = servicos
    .filter((s) => s.data === dia && s.status !== "cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const proximos = servicos
    .filter((s) => s.data >= dia && s.status === "agendado")
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5);
  const tempoTotal = doDia.reduce((t, s) => t + s.tempoEstimado, 0);
  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? "Cliente";
  const dataTexto = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <AppShell titulo="THE GARDEN">
      <section className="mb-4">
        <h2 className="text-lg font-semibold">Olá, {usuario?.nome?.split(" ")[0] ?? "jardineiro"} 👋</h2>
        <p className="text-sm capitalize text-muted-foreground">{dataTexto}</p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <Card className="items-center gap-1 p-3 text-center shadow-card">
          <p className="text-2xl font-semibold text-primary">{doDia.length}</p>
          <p className="text-[11px] text-muted-foreground">Serviços hoje</p>
        </Card>
        <Card className="items-center gap-1 p-3 text-center shadow-card">
          <p className="text-2xl font-semibold text-primary">{minutosParaTexto(tempoTotal)}</p>
          <p className="text-[11px] text-muted-foreground">Tempo estimado</p>
        </Card>
        <Card className="items-center gap-1 p-3 text-center shadow-card">
          <p className="text-2xl font-semibold text-primary">
            {new Set(doDia.map((s) => s.clienteId)).size}
          </p>
          <p className="text-[11px] text-muted-foreground">Clientes hoje</p>
        </Card>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to="/servicos/novo"
          className="flex items-center gap-2 rounded-2xl bg-garden p-4 text-primary-foreground shadow-soft"
        >
          <CalendarPlus className="size-5" />
          <span className="text-sm font-medium">Novo agendamento</span>
        </Link>
        <Link
          to="/clientes/novo"
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <UserPlus className="size-5 text-primary" />
          <span className="text-sm font-medium">Novo cliente</span>
        </Link>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Clientes agendados para hoje</h3>
        {doDia.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nenhum serviço hoje. Aproveite ou agende um novo.
          </p>
        ) : (
          <ul className="space-y-2">
            {doDia.map((s) => (
              <li key={s.id}>
                <Card className="flex-row items-center justify-between gap-3 p-3 shadow-card">
                  <div>
                    <p className="font-medium">{nome(s.clienteId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.hora} · {s.tipo} · {minutosParaTexto(s.tempoEstimado)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Próximos serviços</h3>
        {proximos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Sem agendamentos futuros.
          </p>
        ) : (
          <ul className="space-y-2">
            {proximos.map((s) => (
              <li key={s.id}>
                <Card className="flex-row items-center gap-3 p-3 shadow-card">
                  <span className="flex size-9 items-center justify-center rounded-full bg-accent/40 text-primary">
                    <Clock className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{nome(s.clienteId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${s.data}T00:00`).toLocaleDateString("pt-BR")} às {s.hora}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <Card className="flex-row items-center gap-3 p-4 shadow-card">
          <Users className="size-5 text-primary" />
          <p className="text-sm">
            <strong>{clientes.length}</strong> clientes cadastrados
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
