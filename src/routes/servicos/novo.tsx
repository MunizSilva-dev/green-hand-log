import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ServicoForm } from "@/components/ServicoForm";

export const Route = createFileRoute("/servicos/novo")({
  head: () => ({
    meta: [
      { title: "Novo serviço | THE GARDEN" },
      { name: "description", content: "Agende um serviço de roçada ou inicie o atendimento imediatamente." },
      { property: "og:title", content: "Novo serviço | THE GARDEN" },
      { property: "og:description", content: "Criação de agendamentos de jardinagem em segundos." },
    ],
  }),
  component: () => (
    <AppShell titulo="Novo serviço">
      <ServicoForm />
    </AppShell>
  ),
});
