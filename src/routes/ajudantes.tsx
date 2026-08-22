import { createFileRoute } from "@tanstack/react-router";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { excluirAjudante, salvarAjudante, useEstado } from "@/lib/store";

export const Route = createFileRoute("/ajudantes")({
  head: () => ({
    meta: [
      { title: "Ajudantes | THE GARDEN" },
      { name: "description", content: "Cadastre e gerencie os ajudantes que participam dos serviços de jardinagem." },
      { property: "og:title", content: "Ajudantes | THE GARDEN" },
      { property: "og:description", content: "Cadastro da equipe de apoio do THE GARDEN." },
    ],
  }),
  component: Ajudantes,
});

function Ajudantes() {
  const { ajudantes } = useEstado();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");

  function adicionar() {
    if (!nome.trim()) {
      toast.error("Informe o nome do ajudante");
      return;
    }
    salvarAjudante({ nome: nome.trim(), telefone, observacoes });
    setNome("");
    setTelefone("");
    setObservacoes("");
    toast.success("Ajudante cadastrado");
  }

  return (
    <AppShell titulo="Ajudantes">
      <Card className="gap-3 p-4 shadow-card">
        <h3 className="text-sm font-semibold">Novo ajudante</h3>
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Telefone</Label>
          <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="obs">Observações</Label>
          <Textarea id="obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>
        <Button className="rounded-full" onClick={adicionar}>
          <UserPlus className="size-4" /> Cadastrar ajudante
        </Button>
      </Card>

      <ul className="mt-4 space-y-2">
        {ajudantes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum ajudante cadastrado ainda.</p>
        )}
        {ajudantes.map((a) => (
          <li key={a.id}>
            <Card className="flex-row items-center justify-between gap-3 p-4 shadow-card">
              <div>
                <p className="text-sm font-medium">{a.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {[a.telefone, a.observacoes].filter(Boolean).join(" · ") || "Sem dados extras"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${a.nome}`}
                onClick={() => {
                  excluirAjudante(a.id);
                  toast.success("Ajudante removido");
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
