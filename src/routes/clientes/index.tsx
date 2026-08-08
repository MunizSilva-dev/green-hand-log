import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEstado } from "@/lib/store";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes | THE GARDEN" },
      { name: "description", content: "Cadastro completo de clientes de jardinagem com fotos, endereço, área e frequência." },
      { property: "og:title", content: "Clientes | THE GARDEN" },
      { property: "og:description", content: "Gerencie todos os seus clientes de roçada e jardinagem." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const { clientes } = useEstado();
  const [busca, setBusca] = useState("");
  const q = busca.toLowerCase();
  const lista = clientes.filter((c) =>
    [c.nome, c.telefone, c.whatsapp, c.endereco, c.bairro, c.cidade]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );

  return (
    <AppShell
      titulo="Clientes"
      acao={
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link to="/clientes/novo">
            <Plus className="size-4" /> Novo
          </Link>
        </Button>
      }
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, telefone ou endereço"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {lista.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum cliente encontrado.
        </p>
      ) : (
        <ul className="space-y-2">
          {lista.map((c) => (
            <li key={c.id}>
              <Link to="/clientes/$id" params={{ id: c.id }}>
                <Card className="flex-row items-center gap-3 p-3 shadow-card">
                  {c.fotos[0] ? (
                    <img
                      src={c.fotos[0]}
                      alt={`Jardim de ${c.nome}`}
                      loading="lazy"
                      className="size-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-12 items-center justify-center rounded-xl bg-accent/40 text-lg font-semibold text-primary">
                      {c.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.bairro || c.cidade || c.endereco || "Sem endereço"} · {c.frequencia}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
