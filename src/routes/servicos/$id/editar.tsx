import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ServicoForm } from "@/components/ServicoForm";
import { Button } from "@/components/ui/button";
import { excluirServico, useEstado } from "@/lib/store";

export const Route = createFileRoute("/servicos/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar serviço | THE GARDEN" },
      { name: "description", content: "Altere data, horário, tipo, prioridade e status do serviço agendado." },
      { property: "og:title", content: "Editar serviço | THE GARDEN" },
      { property: "og:description", content: "Edição de agendamentos de jardinagem e roçada." },
    ],
  }),
  component: EditarServico,
});

function EditarServico() {
  const { id } = useParams({ from: "/servicos/$id/editar" });
  const { servicos } = useEstado();
  const navigate = useNavigate();
  const servico = servicos.find((s) => s.id === id);

  return (
    <AppShell titulo="Editar serviço">
      {servico ? (
        <>
          <ServicoForm servico={servico} />
          <Button
            variant="destructive"
            className="mt-4 w-full rounded-full"
            onClick={() => {
              excluirServico(servico.id);
              toast.success("Serviço excluído");
              navigate({ to: "/servicos" });
            }}
          >
            <Trash2 className="size-4" /> Excluir serviço
          </Button>
        </>
      ) : (
        <p className="text-sm">Serviço não encontrado.</p>
      )}
    </AppShell>
  );
}
