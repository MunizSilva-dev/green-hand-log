import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { MapPin, Pencil, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { excluirCliente, hoje, minutosParaTexto, useEstado } from "@/lib/store";

export const Route = createFileRoute("/clientes/$id/")({
  head: () => ({
    meta: [
      { title: "Perfil do cliente | THE GARDEN" },
      { name: "description", content: "Dados, fotos, histórico de serviços, materiais e ferramentas usados no cliente." },
      { property: "og:title", content: "Perfil do cliente | THE GARDEN" },
      { property: "og:description", content: "Histórico completo do cliente de jardinagem." },
    ],
  }),
  component: PerfilCliente,
});

function PerfilCliente() {
  const { id } = useParams({ from: "/clientes/$id/" });
  const { clientes, servicos } = useEstado();
  const navigate = useNavigate();
  const cliente = clientes.find((c) => c.id === id);

  if (!cliente) {
    return (
      <AppShell titulo="Cliente">
        <p className="text-sm">Cliente não encontrado.</p>
      </AppShell>
    );
  }

  const meus = servicos.filter((s) => s.clienteId === cliente.id);
  const concluidos = meus.filter((s) => s.status === "concluido");
  const tempos = concluidos
    .filter((s) => s.inicioReal && s.fimReal)
    .map((s) => (new Date(s.fimReal!).getTime() - new Date(s.inicioReal!).getTime()) / 60000);
  const media = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
  const materiais = [...new Set(concluidos.flatMap((s) => s.materiais.map((m) => m.nome)))];
  const ferramentas = [...new Set(concluidos.flatMap((s) => s.ferramentas))];
  const proximos = meus
    .filter((s) => s.data >= hoje() && s.status === "agendado")
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  return (
    <AppShell
      titulo={cliente.nome}
      acao={
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link to="/clientes/$id/editar" params={{ id: cliente.id }}>
            <Pencil className="size-4" /> Editar
          </Link>
        </Button>
      }
    >
      <Card className="gap-2 p-4 shadow-card">
        <p className="flex items-center gap-2 text-sm">
          <Phone className="size-4 text-primary" /> {cliente.telefone || "—"}
          {cliente.whatsapp && <span className="text-muted-foreground">· Zap {cliente.whatsapp}</span>}
        </p>
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-primary" />
          {[cliente.endereco, cliente.bairro, cliente.cidade].filter(Boolean).join(", ") || "—"}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-muted p-2">
            <p className="text-base font-semibold text-primary">{cliente.areaM2 || 0}</p>
            m²
          </div>
          <div className="rounded-xl bg-muted p-2">
            <p className="text-base font-semibold text-primary">
              {minutosParaTexto(cliente.tempoEstimado)}
            </p>
            estimado
          </div>
          <div className="rounded-xl bg-muted p-2">
            <p className="text-base font-semibold capitalize text-primary">{cliente.frequencia}</p>
            frequência
          </div>
        </div>
        {cliente.observacoes && (
          <p className="mt-2 text-sm text-muted-foreground">{cliente.observacoes}</p>
        )}
      </Card>

      <div className="mt-4">
        <GaleriaFotos label="Fotos do jardim" fotos={cliente.fotos} />
      </div>

      <section className="mt-6 grid grid-cols-2 gap-2">
        <Card className="p-3 text-center shadow-card">
          <p className="text-xl font-semibold text-primary">{concluidos.length}</p>
          <p className="text-[11px] text-muted-foreground">Serviços concluídos</p>
        </Card>
        <Card className="p-3 text-center shadow-card">
          <p className="text-xl font-semibold text-primary">{media ? minutosParaTexto(media) : "—"}</p>
          <p className="text-[11px] text-muted-foreground">Tempo médio real</p>
        </Card>
      </section>

      <section className="mt-6 space-y-1">
        <h3 className="text-sm font-semibold">Materiais habituais</h3>
        <p className="text-sm text-muted-foreground">{materiais.join(", ") || "Sem registros"}</p>
        <h3 className="pt-2 text-sm font-semibold">Ferramentas utilizadas</h3>
        <p className="text-sm text-muted-foreground">{ferramentas.join(", ") || "Sem registros"}</p>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Próximos agendamentos</h3>
        {proximos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
        ) : (
          <ul className="space-y-2">
            {proximos.map((s) => (
              <li key={s.id}>
                <Card className="flex-row items-center justify-between p-3 shadow-card">
                  <span className="text-sm">
                    {new Date(`${s.data}T00:00`).toLocaleDateString("pt-BR")} · {s.hora}
                  </span>
                  <StatusBadge status={s.status} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Histórico de serviços</h3>
        {meus.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço registrado.</p>
        ) : (
          <ul className="space-y-2">
            {meus
              .slice()
              .sort((a, b) => b.data.localeCompare(a.data))
              .map((s) => (
                <li key={s.id}>
                  <Card className="gap-1 p-3 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {new Date(`${s.data}T00:00`).toLocaleDateString("pt-BR")} · {s.tipo}
                      </span>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estimado {minutosParaTexto(s.tempoEstimado)}
                      {s.inicioReal && s.fimReal
                        ? ` · Real ${minutosParaTexto(
                            Math.round(
                              (new Date(s.fimReal).getTime() - new Date(s.inicioReal).getTime()) / 60000,
                            ),
                          )}`
                        : ""}
                    </p>
                  </Card>
                </li>
              ))}
          </ul>
        )}
      </section>

      <Button
        variant="destructive"
        className="mt-6 w-full rounded-full"
        onClick={() => {
          excluirCliente(cliente.id);
          toast.success("Cliente excluído");
          navigate({ to: "/clientes" });
        }}
      >
        <Trash2 className="size-4" /> Excluir cliente
      </Button>
    </AppShell>
  );
}
