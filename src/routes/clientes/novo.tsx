import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ClienteForm } from "@/components/ClienteForm";

export const Route = createFileRoute("/clientes/novo")({
  head: () => ({
    meta: [
      { title: "Novo cliente | THE GARDEN" },
      { name: "description", content: "Cadastre um novo cliente com endereço, área do terreno, frequência e fotos do jardim." },
      { property: "og:title", content: "Novo cliente | THE GARDEN" },
      { property: "og:description", content: "Cadastro rápido de clientes de jardinagem e roçada." },
    ],
  }),
  component: () => (
    <AppShell titulo="Novo cliente">
      <ClienteForm />
    </AppShell>
  ),
});
