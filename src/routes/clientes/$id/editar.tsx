import { createFileRoute, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ClienteForm } from "@/components/ClienteForm";
import { useEstado } from "@/lib/store";

export const Route = createFileRoute("/clientes/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar cliente | THE GARDEN" },
      { name: "description", content: "Atualize dados, fotos e frequência de serviço do cliente." },
      { property: "og:title", content: "Editar cliente | THE GARDEN" },
      { property: "og:description", content: "Edição de cadastro de clientes no THE GARDEN." },
    ],
  }),
  component: EditarCliente,
});

function EditarCliente() {
  const { id } = useParams({ from: "/clientes/$id/editar" });
  const { clientes } = useEstado();
  const cliente = clientes.find((c) => c.id === id);

  return (
    <AppShell titulo="Editar cliente">
      {cliente ? <ClienteForm cliente={cliente} /> : <p className="text-sm">Cliente não encontrado.</p>}
    </AppShell>
  );
}
