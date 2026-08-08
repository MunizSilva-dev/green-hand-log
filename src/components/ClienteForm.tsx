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
import { GaleriaFotos } from "@/components/GaleriaFotos";
import { salvarCliente, type Cliente, type Frequencia } from "@/lib/store";

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const navigate = useNavigate();
  const [f, setF] = useState({
    nome: cliente?.nome ?? "",
    telefone: cliente?.telefone ?? "",
    whatsapp: cliente?.whatsapp ?? "",
    endereco: cliente?.endereco ?? "",
    bairro: cliente?.bairro ?? "",
    cidade: cliente?.cidade ?? "",
    observacoes: cliente?.observacoes ?? "",
    fotos: cliente?.fotos ?? [],
    areaM2: cliente?.areaM2 ?? 0,
    tempoEstimado: cliente?.tempoEstimado ?? 60,
    frequencia: (cliente?.frequencia ?? "quinzenal") as Frequencia,
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!f.nome.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    salvarCliente(cliente ? { ...f, id: cliente.id } : f);
    toast.success(cliente ? "Cliente atualizado" : "Cliente cadastrado");
    navigate({ to: "/clientes" });
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" inputMode="tel" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="endereco">Endereço</Label>
        <Input id="endereco" value={f.endereco} onChange={(e) => set("endereco", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" value={f.bairro} onChange={(e) => set("bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="area">Terreno (m²)</Label>
          <Input
            id="area"
            type="number"
            value={f.areaM2}
            onChange={(e) => set("areaM2", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tempo">Tempo roçada (min)</Label>
          <Input
            id="tempo"
            type="number"
            value={f.tempoEstimado}
            onChange={(e) => set("tempoEstimado", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Frequência do serviço</Label>
        <Select value={f.frequencia} onValueChange={(v) => set("frequencia", v as Frequencia)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semanal">Semanal</SelectItem>
            <SelectItem value="quinzenal">Quinzenal</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="eventual">Eventual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="obs">Observações</Label>
        <Textarea id="obs" value={f.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
      </div>
      <GaleriaFotos label="Fotos do jardim" fotos={f.fotos} onChange={(v) => set("fotos", v)} />
      <Button type="submit" className="w-full rounded-full" size="lg">
        Salvar cliente
      </Button>
    </form>
  );
}
