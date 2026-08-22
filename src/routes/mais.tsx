import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, LogOut, Settings, CalendarDays, Users2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setEstado, useEstado } from "@/lib/store";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais | THE GARDEN" },
      { name: "description", content: "Acesse relatórios, configurações e a conta do THE GARDEN." },
      { property: "og:title", content: "Mais | THE GARDEN" },
      { property: "og:description", content: "Relatórios, configurações e conta." },
    ],
  }),
  component: Mais,
});

const itens = [
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/calendario", label: "Agenda completa", icon: CalendarDays },
] as const;

function Mais() {
  const { usuario } = useEstado();
  const navigate = useNavigate();

  return (
    <AppShell titulo="Mais">
      <Card className="mb-4 gap-0.5 p-4 shadow-card">
        <p className="font-medium">{usuario?.nome}</p>
        <p className="text-xs text-muted-foreground">{usuario?.email}</p>
      </Card>

      <ul className="space-y-2">
        {itens.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to}>
              <Card className="flex-row items-center gap-3 p-4 shadow-card">
                <Icon className="size-5 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-full"
        onClick={() => {
          setEstado((e) => ({ ...e, sessaoAtiva: false }));
          navigate({ to: "/login" });
        }}
      >
        <LogOut className="size-4" /> Sair da conta
      </Button>
    </AppShell>
  );
}
