import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { setEstado, useEstado } from "@/lib/store";

/**
 * Aviso de cookies / armazenamento local. O THE GARDEN guarda tudo no próprio
 * aparelho, então este consentimento cobre o uso do armazenamento do dispositivo.
 */
export function AvisoCookies() {
  const { config } = useEstado();
  const [pronto, setPronto] = useState(false);
  useEffect(() => setPronto(true), []);

  if (!pronto || config.cookiesAceitos) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="text-sm font-semibold">Armazenamento no seu aparelho</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          O THE GARDEN salva clientes, serviços e fotos apenas na memória deste celular, com
          cookies e armazenamento local necessários para o app funcionar. Nada é enviado para
          servidores de terceiros.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            className="rounded-full sm:flex-1"
            onClick={() =>
              setEstado((e) => ({ ...e, config: { ...e.config, cookiesAceitos: true } }))
            }
          >
            Aceitar e continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
