import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PIX_TIPOS,
  exportarDados,
  importarDados,
  setEstado,
  useEstado,
  type PixTipo,
} from "@/lib/store";
import { pedirPermissao } from "@/lib/notificacoes";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | THE GARDEN" },
      { name: "description", content: "Horário da notificação diária, backup local, exportação e importação dos dados." },
      { property: "og:title", content: "Configurações | THE GARDEN" },
      { property: "og:description", content: "Ajustes, backup e sincronização do THE GARDEN." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { config } = useEstado();
  const inputRef = useRef<HTMLInputElement>(null);

  function exportar() {
    const blob = new Blob([exportarDados()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `the-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Backup exportado");
  }

  async function importar(file?: File) {
    if (!file) return;
    try {
      importarDados(await file.text());
      toast.success("Dados importados");
    } catch {
      toast.error("Arquivo inválido");
    }
  }

  return (
    <AppShell titulo="Configurações">
      <div className="space-y-3">
        <Card className="gap-3 p-4 shadow-card">
          <h3 className="text-sm font-semibold">Notificações</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif">Notificações ativas</Label>
            <Switch
              id="notif"
              checked={config.notificacoesAtivas}
              onCheckedChange={async (v) => {
                if (v) await pedirPermissao();
                setEstado((e) => ({ ...e, config: { ...e.config, notificacoesAtivas: v } }));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hora">Horário do resumo diário</Label>
            <Input
              id="hora"
              type="time"
              value={config.horaNotificacao}
              onChange={(e) =>
                setEstado((s) => ({ ...s, config: { ...s.config, horaNotificacao: e.target.value } }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Todo dia nesse horário você recebe a lista de clientes agendados.
            </p>
          </div>
          <Button variant="secondary" className="rounded-full" onClick={() => void pedirPermissao()}>
            Permitir notificações no dispositivo
          </Button>
        </Card>

        <Card className="gap-3 p-4 shadow-card">
          <h3 className="text-sm font-semibold">Recibo e PIX</h3>
          <p className="text-xs text-muted-foreground">
            Esses dados aparecem na mensagem de cobrança enviada ao cliente ao concluir o serviço.
          </p>
          {(
            [
              ["profissionalNome", "Nome do profissional"],
              ["profissionalCpf", "CPF do profissional"],
              ["pixNome", "Nome do favorecido do PIX"],
            ] as const
          ).map(([campo, rotulo]) => (
            <div key={campo} className="space-y-1.5">
              <Label htmlFor={campo}>{rotulo}</Label>
              <Input
                id={campo}
                value={config[campo]}
                onChange={(e) =>
                  setEstado((s) => ({ ...s, config: { ...s.config, [campo]: e.target.value } }))
                }
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="pixTipo">Tipo de chave PIX</Label>
            <Select
              value={config.pixTipo}
              onValueChange={(v) =>
                setEstado((s) => ({ ...s, config: { ...s.config, pixTipo: v as PixTipo } }))
              }
            >
              <SelectTrigger id="pixTipo">
                <SelectValue placeholder="Escolha o tipo" />
              </SelectTrigger>
              <SelectContent>
                {PIX_TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "ALEATORIA" ? "CHAVE ALEATÓRIA" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pixChave">Chave PIX ({config.pixTipo})</Label>
            <Input
              id="pixChave"
              inputMode={config.pixTipo === "EMAIL" ? "email" : "text"}
              value={config.pixChave}
              onChange={(e) =>
                setEstado((s) => ({ ...s, config: { ...s.config, pixChave: e.target.value } }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contato">Contato (WhatsApp)</Label>
            <Input
              id="contato"
              value={config.contato}
              onChange={(e) =>
                setEstado((s) => ({ ...s, config: { ...s.config, contato: e.target.value } }))
              }
            />
          </div>
        </Card>

        <Card className="gap-3 p-4 shadow-card">
          <h3 className="text-sm font-semibold">Equipe</h3>
          <p className="text-xs text-muted-foreground">
            Cadastre os ajudantes que podem participar dos serviços.
          </p>
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/ajudantes">Gerenciar ajudantes</Link>
          </Button>
        </Card>

        <Card className="gap-3 p-4 shadow-card">
          <h3 className="text-sm font-semibold">Backup e sincronização</h3>
          <p className="text-xs text-muted-foreground">
            Seus dados ficam salvos no próprio aparelho. Exporte um backup com frequência; a
            sincronização com servidor está preparada para ser ativada no futuro.
          </p>
          <Button className="rounded-full" onClick={exportar}>
            Exportar dados
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => inputRef.current?.click()}>
            Importar dados
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => void importar(e.target.files?.[0])}
          />
        </Card>

        <Card className="gap-3 p-4 shadow-card">
          <h3 className="text-sm font-semibold">Aparência</h3>
          <p className="text-xs text-muted-foreground">
            Paleta oficial THE GARDEN: verde escuro, verde médio, verde claro e branco.
          </p>
          <div className="flex gap-2">
            <span className="size-8 rounded-full bg-primary" />
            <span className="size-8 rounded-full bg-secondary" />
            <span className="size-8 rounded-full bg-accent" />
            <span className="size-8 rounded-full border border-border bg-card" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
