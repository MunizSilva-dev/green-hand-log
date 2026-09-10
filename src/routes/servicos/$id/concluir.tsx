import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Axe, Copy, FileDown, Plus, Scissors, Send, ShoppingCart, Trash2, TreeDeciduous, Wind } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EXTRAS,
  FERRAMENTAS,
  MATERIAIS,
  minutosParaTexto,
  moeda,
  salvarServico,
  useEstado,
  type Despesa,
  type Material,
  type Servico,
} from "@/lib/store";
import { linkWhatsapp, montarRecibo } from "@/lib/recibo";
import { gerarCobrancaPdf } from "@/lib/pdf";
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
  const { servicos, clientes, ajudantes: equipe, config } = useEstado();
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
  const [valor, setValor] = useState(servico?.valor ? String(servico.valor) : "");
  const [ajudantesSel, setAjudantesSel] = useState<string[]>(servico?.ajudantes ?? []);
  const [despesas, setDespesas] = useState<Despesa[]>(servico?.despesas ?? []);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [servicoFinal, setServicoFinal] = useState<Servico | null>(null);

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

  const valorNumero = Number(valor.replace(",", ".")) || 0;

  function finalizar() {
    const atualizado = {
      id: servico!.id,
      status: "concluido" as const,
      inicioReal: `${servico!.data}T${inicio}:00`,
      fimReal: `${servico!.data}T${fim}:00`,
      valor: valorNumero,
      ajudantes: ajudantesSel,
      despesas: despesas.filter((d) => d.descricao || d.valor),
      extras,
      ferramentas,
      materiais,
      fotosAntes,
      fotosDepois,
      observacoes: obs,
    };
    salvarServico(atualizado);
    notificar("Serviço concluído", `${cliente?.nome ?? "Cliente"} · ${minutosParaTexto(minutos)}`);
    toast.success("Serviço concluído");
    const completo = { ...servico!, ...atualizado } as Servico;
    setServicoFinal(completo);
    setMensagem(montarRecibo({ servico: completo, cliente, config }));
    gerarCobrancaPdf({ servico: completo, cliente, config });
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

      <section className="mt-6 space-y-1.5">
        <h3 className="text-sm font-semibold">Valor do serviço</h3>
        <Label htmlFor="valor">Valor cobrado (R$)</Label>
        <Input
          id="valor"
          inputMode="decimal"
          placeholder="0,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Total: {moeda(valorNumero)}</p>
      </section>

      <section className="mt-10 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Despesas do serviço</h3>
          <p className="text-xs text-muted-foreground">
            Combustível, produtos ou qualquer custo. Entra no relatório em PDF.
          </p>
        </div>
        <div className="space-y-3">
          {despesas.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Descrição"
                value={d.descricao}
                onChange={(e) =>
                  setDespesas((p) => p.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)))
                }
              />
              <Input
                className="w-28"
                inputMode="decimal"
                placeholder="0,00"
                value={d.valor ? String(d.valor) : ""}
                onChange={(e) =>
                  setDespesas((p) =>
                    p.map((x, j) =>
                      j === i ? { ...x, valor: Number(e.target.value.replace(",", ".")) || 0 } : x,
                    ),
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Remover despesa"
                onClick={() => setDespesas((p) => p.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setDespesas((p) => [...p, { descricao: "", valor: 0 }])}
        >
          <Plus className="size-4" /> Adicionar despesa
        </Button>
      </section>

      <section className="mt-10 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Equipe do serviço</h3>
          <p className="text-xs text-muted-foreground">
            {ajudantesSel.length === 0
              ? "Somente você realizou este serviço."
              : `Você + ${ajudantesSel.length} ajudante(s).`}
          </p>
        </div>
        {equipe.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum ajudante cadastrado — cadastre em Configurações › Equipe.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {equipe.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => alternar(ajudantesSel, setAjudantesSel, a.id)}
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-xs",
                  ajudantesSel.includes(a.id) ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                {a.nome}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 space-y-2">
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

      <section className="mt-10 space-y-2">
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

      <section className="mt-10 space-y-2">
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

      <section className="mt-10 space-y-4">
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

      <section className="mt-10 space-y-1.5">
        <Label htmlFor="obs">Observações</Label>
        <Textarea id="obs" value={obs} onChange={(e) => setObs(e.target.value)} />
      </section>

      <Button size="lg" className="mt-10 w-full rounded-full" onClick={finalizar}>
        <Scissors className="size-4" /> Finalizar serviço
      </Button>

      <Dialog
        open={mensagem !== null}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setMensagem(null);
            navigate({ to: "/servicos" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cobrança do cliente</DialogTitle>
          </DialogHeader>
          <Textarea
            readOnly
            value={mensagem ?? ""}
            className="h-64 font-mono text-xs"
            aria-label="Mensagem de cobrança"
          />
          <div className="flex flex-col gap-2">
            <Button
              className="rounded-full"
              onClick={() => {
                window.open(linkWhatsapp(cliente?.whatsapp || cliente?.telefone || "", mensagem ?? ""), "_blank");
              }}
            >
              <Send className="size-4" /> Enviar no WhatsApp
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                void navigator.clipboard.writeText(mensagem ?? "");
                toast.success("Mensagem copiada");
              }}
            >
              <Copy className="size-4" /> Copiar mensagem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
