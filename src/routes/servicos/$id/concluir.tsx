import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Axe, Scissors, ShoppingCart, TreeDeciduous, Wind } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EXTRAS,
  FERRAMENTAS,
  MATERIAIS,
  minutosParaTexto,
  salvarServico,
  useEstado,
  type Material,
} from "@/lib/store";
import { notificar } from "@/lib/notificacoes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/servicos/$id/concluir")({
  head: () => ({
    meta: [
      { title: "Concluir serviço | THE GARDEN" },
      { name: "description", content: "Registre tempo real, serviços extras, materiais, ferramentas e fotos antes e depois." },
      { property: "og:title", content: "Concluir serviço | THE GARDEN" },
      { property: "og:description", content: "Finalização detalhada de serviços de jardinagem." },
    ],
  }),
  component: Concluir,
});

const iconesFerramenta = {
  "Roçadeira 1": Wind,
  "Roçadeira 2": Wind,
  "Carrinho da roçadeira": ShoppingCart,
  Motosserra: Axe,
  Motopoda: TreeDeciduous,
} as const;

function agora() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Concluir() {
  const { id } = useParams({ from: "/servicos/$id/concluir" });
  const { servicos, clientes } = useEstado();
  const navigate = useNavigate();
  const servico = servicos.find((s) => s.id === id);

  const [inicio, setInicio] = useState(
    servico?.inicioReal ? new Date(servico.inicioReal).toTimeString().slice(0, 5) : servico?.hora ?? "08:00",
  );
  const [fim, setFim] = useState(agora());
  const [extras, setExtras] = useState<string[]>(servico?.extras ?? []);
  const [ferramentas, setFerramentas] = useState<string[]>(servico?.ferramentas ?? []);
  const [materiais, setMateriais] = useState<Material[]>(servico?.materiais ?? []);
  const [fotosAntes, setFotosAntes] = useState<string[]>(servico?.fotosAntes ?? []);
  const [fotosDepois, setFotosDepois] = useState<string[]>(servico?.fotosDepois ?? []);
  const [obs, setObs] = useState(servico?.observacoes ?? "");

  if (!servico) {
    return (
      <AppShell titulo="Concluir serviço">
        <p className="text-sm">Serviço não encontrado.</p>
      </AppShell>
    );
  }

  const cliente = clientes.find((c) => c.id === servico.clienteId);
  const minutos = Math.max(
    0,
    (Number(fim.slice(0, 2)) * 60 + Number(fim.slice(3))) -
      (Number(inicio.slice(0, 2)) * 60 + Number(inicio.slice(3))),
  );

  const alternar = (lista: string[], set: (v: string[]) => void, item: string) =>
    set(lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item]);

  const quantidade = (nome: string) => materiais.find((m) => m.nome === nome)?.quantidade ?? "";
  function setMaterial(nome: string, marcado: boolean, qtd?: string) {
    setMateriais((prev) => {
      const outros = prev.filter((m) => m.nome !== nome);
      if (!marcado) return outros;
      return [...outros, { nome, quantidade: qtd ?? quantidade(nome) }];
    });
  }

  function finalizar() {
    salvarServico({
      id: servico!.id,
      status: "concluido",
      inicioReal: `${servico!.data}T${inicio}:00`,
      fimReal: `${servico!.data}T${fim}:00`,
      extras,
      ferramentas,
      materiais,
      fotosAntes,
      fotosDepois,
      observacoes: obs,
    });
    notificar("Serviço concluído", `${cliente?.nome ?? "Cliente"} · ${minutosParaTexto(minutos)}`);
    toast.success("Serviço concluído");
    navigate({ to: "/servicos" });
  }

  return (
    <AppShell titulo="Concluir serviço">
      <Card className="mb-4 gap-1 p-4 shadow-card">
        <p className="font-medium">{cliente?.nome ?? "Cliente"}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(`${servico.data}T00:00`).toLocaleDateString("pt-BR")} · {servico.tipo} · estimado{" "}
          {minutosParaTexto(servico.tempoEstimado)}
        </p>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Tempo de serviço</h3>
        <div className="grid grid-cols-3 items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ini">Início</Label>
            <Input id="ini" type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fim">Término</Label>
            <Input id="fim" type="time" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
          <div className="rounded-xl bg-muted p-2 text-center text-sm font-semibold text-primary">
            {minutosParaTexto(minutos)}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">Serviços adicionais</h3>
        <div className="flex flex-wrap gap-2">
          {EXTRAS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => alternar(extras, setExtras, e)}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs",
                extras.includes(e) ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">Materiais utilizados</h3>
        {MATERIAIS.map((m) => {
          const marcado = materiais.some((x) => x.nome === m);
          return (
            <div key={m} className="flex items-center gap-3">
              <Checkbox checked={marcado} onCheckedChange={(v) => setMaterial(m, !!v)} id={`mat-${m}`} />
              <Label htmlFor={`mat-${m}`} className="flex-1">
                {m}
              </Label>
              <Input
                className="w-28"
                placeholder="Qtd."
                value={quantidade(m)}
                disabled={!marcado}
                onChange={(e) => setMaterial(m, true, e.target.value)}
              />
            </div>
          );
        })}
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">Ferramentas utilizadas</h3>
        <div className="grid grid-cols-3 gap-2">
          {FERRAMENTAS.map((f) => {
            const Icone = iconesFerramenta[f];
            const ativo = ferramentas.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => alternar(ferramentas, setFerramentas, f)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border p-3 text-[11px] transition-colors",
                  ativo ? "border-primary bg-accent/30 text-primary" : "border-border bg-card text-muted-foreground",
                )}
              >
                <Icone className={cn("size-6", ativo ? "text-primary" : "text-leaf")} />
                {f}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <GaleriaFotos label="Fotos antes" fotos={fotosAntes} onChange={setFotosAntes} />
        <GaleriaFotos label="Fotos depois" fotos={fotosDepois} onChange={setFotosDepois} />
        {fotosAntes[0] && fotosDepois[0] && (
          <div>
            <p className="mb-2 text-sm font-medium">Comparação antes / depois</p>
            <div className="grid grid-cols-2 gap-2">
              <img src={fotosAntes[0]} alt="Antes" loading="lazy" className="aspect-square rounded-xl object-cover" />
              <img src={fotosDepois[0]} alt="Depois" loading="lazy" className="aspect-square rounded-xl object-cover" />
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-1.5">
        <Label htmlFor="obs">Observações</Label>
        <Textarea id="obs" value={obs} onChange={(e) => setObs(e.target.value)} />
      </section>

      <Button size="lg" className="mt-6 w-full rounded-full" onClick={finalizar}>
        <Scissors className="size-4" /> Finalizar serviço
      </Button>
    </AppShell>
  );
}
