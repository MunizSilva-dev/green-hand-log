import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  hoje,
  salvarServico,
  useEstado,
  type Prioridade,
  type Servico,
  type StatusServico,
} from "@/lib/store";

const TIPOS = ["Roçada", "Poda", "Limpeza de terreno", "Jardinagem", "Corte de árvore", "Outros"];

export function ServicoForm({ servico }: { servico?: Servico }) {
  const { clientes } = useEstado();
  const navigate = useNavigate();
  const [f, setF] = useState({
    clienteId: servico?.clienteId ?? "",
    data: servico?.data ?? hoje(),
    hora: servico?.hora ?? "08:00",
    tipo: servico?.tipo ?? "Roçada",
    tempoEstimado: servico?.tempoEstimado ?? 60,
    observacoes: servico?.observacoes ?? "",
    prioridade: (servico?.prioridade ?? "media") as Prioridade,
    endereco: servico?.endereco ?? "",
    status: (servico?.status ?? "agendado") as StatusServico,
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function escolherCliente(id: string) {
    const c = clientes.find((x) => x.id === id);
    setF((p) => ({
      ...p,
      clienteId: id,
      endereco: c?.endereco || p.endereco,
      tempoEstimado: c?.tempoEstimado || p.tempoEstimado,
    }));
  }

  function enviar(e: React.FormEvent, iniciarAgora = false) {
    e.preventDefault();
    if (!f.clienteId) {
      toast.error("Selecione um cliente");
      return;
    }
    const dados = iniciarAgora
      ? { ...f, status: "andamento" as StatusServico, inicioReal: new Date().toISOString() }
      : f;
    salvarServico(servico ? { ...dados, id: servico.id } : dados);
    toast.success(iniciarAgora ? "Serviço iniciado" : "Serviço salvo");
    navigate({ to: "/servicos" });
  }

  return (
    <form onSubmit={(e) => enviar(e)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Cliente</Label>
        <Select value={f.clienteId} onValueChange={escolherCliente}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="data">Data</Label>
          <Input id="data" type="date" value={f.data} onChange={(e) => set("data", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hora">Horário</Label>
          <Input id="hora" type="time" value={f.hora} onChange={(e) => set("hora", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Tipo do serviço</Label>
        <Select value={f.tipo} onValueChange={(v) => set("tipo", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tempo">Tempo estimado (min)</Label>
          <Input
            id="tempo"
            type="number"
            value={f.tempoEstimado}
            onChange={(e) => set("tempoEstimado", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select value={f.prioridade} onValueChange={(v) => set("prioridade", v as Prioridade)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="end">Endereço</Label>
        <Input id="end" value={f.endereco} onChange={(e) => set("endereco", e.target.value)} />
      </div>
      {servico && (
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={f.status} onValueChange={(v) => set("status", v as StatusServico)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="obs">Observações</Label>
        <Textarea id="obs" value={f.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Button type="submit" size="lg" className="w-full rounded-full">
          {servico ? "Salvar alterações" : "Agendar serviço"}
        </Button>
        {!servico && (
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full rounded-full"
            onClick={(e) => enviar(e, true)}
          >
            Iniciar agora
          </Button>
        )}
      </div>
    </form>
  );
}
