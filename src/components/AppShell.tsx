import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Home, CalendarDays, Users, Leaf, MoreHorizontal } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useEstado } from "@/lib/store";
import { verificarNotificacoes } from "@/lib/notificacoes";
import { cn } from "@/lib/utils";

const abas = [
  { to: "/", label: "Início", icon: Home },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/servicos", label: "Serviços", icon: Leaf },
  { to: "/mais", label: "Mais", icon: MoreHorizontal },
] as const;

export function Rodape() {
  return (
    <footer className="pb-2 pt-6 text-center text-[11px] text-muted-foreground">
      <p>Desenvolvido por COMPANIN VTR</p>
      <a className="underline-offset-2 hover:underline" href="mailto:vmuniz.dev@gmail.com">
        vmuniz.dev@gmail.com
      </a>
    </footer>
  );
}

export function Cabecalho({ titulo, acao }: { titulo: string; acao?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 bg-garden px-4 pb-4 pt-5 text-primary-foreground shadow-soft">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
        {acao}
      </div>
    </header>
  );
}

export function AppShell({ titulo, acao, children }: { titulo: string; acao?: ReactNode; children: ReactNode }) {
  const estado = useEstado();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Evita redirecionar antes da hidratação (os dados vivem no dispositivo).
  const [pronto, setPronto] = useState(false);
  useEffect(() => setPronto(true), []);

  useEffect(() => {
    if (pronto && !estado.sessaoAtiva) router.navigate({ to: "/login" });
  }, [pronto, estado.sessaoAtiva, router]);

  useEffect(() => {
    if (!estado.config.notificacoesAtivas) return;
    const rodar = () =>
      verificarNotificacoes(estado.servicos, estado.clientes, estado.config.horaNotificacao);
    rodar();
    const id = window.setInterval(rodar, 60_000);
    return () => window.clearInterval(id);
  }, [estado.servicos, estado.clientes, estado.config]);

  if (!estado.sessaoAtiva) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Cabecalho titulo={titulo} acao={acao} />
      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
      <Rodape />
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-5">
          {abas.map(({ to, label, icon: Icon }) => {
            const ativo = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  ativo ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    ativo && "bg-accent/40 text-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
