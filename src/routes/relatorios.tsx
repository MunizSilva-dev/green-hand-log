import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { minutosParaTexto, useEstado } from "@/lib/store";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | THE GARDEN" },
      { name: "description", content: "Serviços por mês, tempo médio por cliente, uso de ferramentas e consumo de materiais." },
      { property: "og:title", content: "Relatórios | THE GARDEN" },
      { property: "og:description", content: "Indicadores do seu trabalho de jardinagem e roçada." },
    ],
  }),
  component: Relatorios,
});

function Barra({ label, valor, max }: { label: string; valor: string; max: number; }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{valor}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-garden" style={{ width: `${max}%` }} />
      </div>
    </div>
  );
}

function Relatorios() {
  const { servicos, clientes } = useEstado();
  const concluidos = servicos.filter((s) => s.status === "concluido");
  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? "Cliente";

  const porMes = new Map<string, number>();
  concluidos.forEach((s) => porMes.set(s.data.slice(0, 7), (porMes.get(s.data.slice(0, 7)) ?? 0) + 1));
  const maxMes = Math.max(1, ...porMes.values());

  const tempoPorCliente = new Map<string, number[]>();
  concluidos.forEach((s) => {
    if (!s.inicioReal || !s.fimReal) return;
    const min = (new Date(s.fimReal).getTime() - new Date(s.inicioReal).getTime()) / 60000;
    tempoPorCliente.set(s.clienteId, [...(tempoPorCliente.get(s.clienteId) ?? []), min]);
  });

  const frequencia = new Map<string, number>();
  concluidos.forEach((s) => frequencia.set(s.clienteId, (frequencia.get(s.clienteId) ?? 0) + 1));
  const maxFreq = Math.max(1, ...frequencia.values());

  const ferramentas = new Map<string, number>();
  concluidos.forEach((s) => s.ferramentas.forEach((f) => ferramentas.set(f, (ferramentas.get(f) ?? 0) + 1)));
  const maxFerr = Math.max(1, ...ferramentas.values());

  const materiais = new Map<string, string[]>();
  concluidos.forEach((s) =>
    s.materiais.forEach((m) => materiais.set(m.nome, [...(materiais.get(m.nome) ?? []), m.quantidade].filter(Boolean))),
  );

  const secao = (titulo: string, conteudo: React.ReactNode) => (
    <Card className="gap-3 p-4 shadow-card">
      <h3 className="text-sm font-semibold">{titulo}</h3>
      {conteudo}
    </Card>
  );

  const vazio = <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;

  return (
    <AppShell titulo="Relatórios">
      <div className="space-y-3">
        {secao(
          "Serviços por mês",
          porMes.size === 0
            ? vazio
            : [...porMes.entries()]
                .sort()
                .map(([mes, qtd]) => (
                  <Barra key={mes} label={mes.split("-").reverse().join("/")} valor={`${qtd}`} max={(qtd / maxMes) * 100} />
                )),
        )}

        {secao(
          "Tempo médio por cliente",
          tempoPorCliente.size === 0
            ? vazio
            : [...tempoPorCliente.entries()].map(([id, lista]) => (
                <p key={id} className="flex justify-between text-sm">
                  <span>{nome(id)}</span>
                  <span className="text-muted-foreground">
                    {minutosParaTexto(Math.round(lista.reduce((a, b) => a + b, 0) / lista.length))}
                  </span>
                </p>
              )),
        )}

        {secao(
          "Clientes mais frequentes",
          frequencia.size === 0
            ? vazio
            : [...frequencia.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([id, qtd]) => (
                  <Barra key={id} label={nome(id)} valor={`${qtd} serviços`} max={(qtd / maxFreq) * 100} />
                )),
        )}

        {secao(
          "Utilização das ferramentas",
          ferramentas.size === 0
            ? vazio
            : [...ferramentas.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([f, qtd]) => <Barra key={f} label={f} valor={`${qtd}x`} max={(qtd / maxFerr) * 100} />),
        )}

        {secao(
          "Consumo de materiais",
          materiais.size === 0
            ? vazio
            : [...materiais.entries()].map(([m, qtds]) => (
                <p key={m} className="flex justify-between text-sm">
                  <span>{m}</span>
                  <span className="text-muted-foreground">{qtds.join(" + ") || "—"}</span>
                </p>
              )),
        )}
      </div>
    </AppShell>
  );
}
